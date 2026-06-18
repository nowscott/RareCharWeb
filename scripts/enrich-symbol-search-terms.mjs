#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');
const symbolItemsPath = join(dataDir, 'symbols', 'items.json');

const USER_AGENT = 'RareCharWeb data updater (+https://github.com/nowscott/RareCharWeb)';

const SYMBL_BLOCKS = [
  { slug: 'general-punctuation', category: '标点' },
  { slug: 'supplemental-punctuation', category: '标点' },
  { slug: 'cjk-symbols-and-punctuation', category: '标点' },
  { slug: 'currency-symbols', category: '货币' },
  { slug: 'letterlike-symbols', category: '字母' },
  { slug: 'number-forms', category: '数字' },
  { slug: 'enclosed-alphanumerics', category: '数字' },
  { slug: 'enclosed-alphanumeric-supplement', category: '数字' },
  { slug: 'arrows', category: '箭头' },
  { slug: 'supplemental-arrows-a', category: '箭头' },
  { slug: 'supplemental-arrows-b', category: '箭头' },
  { slug: 'supplemental-arrows-c', category: '箭头' },
  { slug: 'miscellaneous-symbols-and-arrows', category: '箭头' },
  { slug: 'mathematical-operators', category: '数学' },
  { slug: 'miscellaneous-mathematical-symbols-a', category: '数学' },
  { slug: 'miscellaneous-mathematical-symbols-b', category: '数学' },
  { slug: 'supplemental-mathematical-operators', category: '数学' },
  { slug: 'mathematical-alphanumeric-symbols', category: '数学' },
  { slug: 'geometric-shapes', category: '形状' },
  { slug: 'geometric-shapes-extended', category: '形状' },
  { slug: 'box-drawing', category: '形状' },
  { slug: 'block-elements', category: '形状' },
  { slug: 'dingbats', category: '形状' },
  { slug: 'miscellaneous-symbols', category: '其他' },
  { slug: 'miscellaneous-technical', category: '其他' },
  { slug: 'control-pictures', category: '其他' },
  { slug: 'optical-character-recognition', category: '其他' },
  { slug: 'braille-patterns', category: '盲文' },
  { slug: 'transport-and-map-symbols', category: '地理' },
  { slug: 'miscellaneous-symbols-and-pictographs', category: '符号' },
  { slug: 'supplemental-symbols-and-pictographs', category: '符号' },
  { slug: 'symbols-and-pictographs-extended-a', category: '符号' }
];

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const delayMs = parsePositiveInteger(args['delay-ms'] ?? '1200', '--delay-ms');
  const symblRecords = await fetchSymblRecords(delayMs);
  const data = await readJson(symbolItemsPath);
  const items = getItems(data, 'symbols/items.json');

  let changed = 0;
  let matched = 0;
  const nextItems = items.map((item) => {
    const source = symblRecords.get(item.symbol);
    if (source) matched += 1;

    const searchTerms = uniqueCompact([
      ...(Array.isArray(item.searchTerms) ? item.searchTerms : []),
      item.name,
      ...(Array.isArray(item.category) ? item.category : [item.category]),
      ...getCodePointTerms(item.symbol),
      source?.label,
      source?.blockName,
      source?.code ? `U+${source.code}` : undefined,
      source?.code
    ]);

    if (arraysEqual(searchTerms, item.searchTerms ?? [])) {
      return item;
    }

    changed += 1;
    return {
      ...item,
      searchTerms
    };
  });

  await writeJson(symbolItemsPath, {
    ...data,
    total: nextItems.length,
    items: nextItems
  });

  console.log(`Fetched ${symblRecords.size} SYMBL records.`);
  console.log(`Matched ${matched} online symbols.`);
  console.log(`Updated ${changed} online symbols.`);
}

async function fetchSymblRecords(delayMs) {
  const records = new Map();

  for (const block of SYMBL_BLOCKS) {
    const page = await fetchSymblBlock(block);
    for (const item of page.items) {
      records.set(item.symbol, item);
    }
    await delay(delayMs);
  }

  return records;
}

async function fetchSymblBlock(block) {
  const url = `https://symbl.cc/en/unicode/blocks/${block.slug}/`;
  const html = await fetchText(url);
  const title = decodeHtml(extractFirst(html, /<title>([^<]+)/) ?? block.slug);
  const blockName = title.split(':')[0].trim();
  const items = [];
  const cardPattern = /<li class="character-card">([\s\S]*?)<\/li>/g;
  let cardMatch;

  while ((cardMatch = cardPattern.exec(html))) {
    const card = cardMatch[1];
    const symbol = decodeHtml(extractFirst(card, /data-symbol="([^"]*)"/) ?? '').trim();
    const label = decodeHtml(extractFirst(card, /data-label="([^"]*)"/) ?? '').trim();
    const code = decodeHtml(extractFirst(card, /character-card__code">([^<]*)</) ?? '').trim();

    if (!symbol || !label || !code) continue;

    items.push({
      symbol,
      label,
      blockName,
      code,
      category: block.category
    });
  }

  return { url, items };
}

async function fetchText(url, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      });

      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10);
        const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 5000 * (attempt + 1);
        if (attempt < retries) {
          await delay(waitMs);
          continue;
        }
      }

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(1000 * (attempt + 1));
      }
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? lastError}`);
}

function getCodePointTerms(symbol) {
  const codePoints = [...String(symbol ?? '')].map((char) => char.codePointAt(0));
  const hexValues = codePoints
    .filter((codePoint) => codePoint !== undefined)
    .map((codePoint) => codePoint.toString(16).toUpperCase().padStart(4, '0'));

  return [
    ...hexValues,
    ...hexValues.map((hex) => `U+${hex}`),
    hexValues.length > 1 ? hexValues.map((hex) => `U+${hex}`).join(' ') : undefined
  ];
}

function extractFirst(text, pattern) {
  const match = pattern.exec(text);
  return match ? match[1] : undefined;
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function uniqueCompact(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) {
    throw new Error(`Invalid ${fileName}`);
  }

  return data.items;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function parseArgs(argv) {
  const parsed = {};

  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) {
      parsed[match[1]] = match[2];
    }
  }

  return parsed;
}

function parsePositiveInteger(value, flagName) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${flagName}. Use a positive integer.`);
  }

  return parsed;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEmojiKeys, isTextDefaultEmojiSymbol } from './emoji-boundary.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');
const manifestPath = join(dataDir, 'manifest.json');
const symbolItemsPath = join(dataDir, 'symbols', 'items.json');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingSymbolPath = join(dataDir, 'pending', 'symbols.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');

const USER_AGENT = 'RareCharWeb data updater (+https://github.com/nowscott/RareCharWeb)';

const EMOJIPEDIA_CATEGORIES = [
  { slug: 'smileys', category: '笑脸' },
  { slug: '人', category: '人物' },
  { slug: '动物和自然', category: '动物' },
  { slug: '食物和饮料', category: '食物' },
  { slug: '活动', category: '活动' },
  { slug: '旅行和地点', category: '地理' },
  { slug: '物体', category: '物品' },
  { slug: '符号', category: '符号' },
  { slug: '旗帜', category: '旗帜' }
];

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
  const source = String(args.source ?? 'all');
  const dryRun = Boolean(args['dry-run']);
  const maxNew = parseMaxNew(args['max-new'] ?? '500');
  const delayMs = parsePositiveInteger(args['delay-ms'] ?? '1200', '--delay-ms');

  if (!['all', 'emoji', 'symbols'].includes(source)) {
    throw new Error('Invalid --source. Expected one of: all, emoji, symbols.');
  }

  const summary = [];

  if (source === 'all' || source === 'emoji') {
    summary.push(await updateEmojiData({ dryRun, maxNew, delayMs }));
  }

  if (source === 'all' || source === 'symbols') {
    summary.push(await updateSymbolData({ dryRun, maxNew, delayMs }));
  }

  console.log('');
  console.log(dryRun ? 'Dry run complete.' : 'Data update complete.');
  for (const item of summary) {
    console.log(
      `${item.name}: online=${item.online}, pending=${item.pending}, fetched=${item.fetched}, added=${item.added}, skipped=${item.skipped}`
    );
  }
}

async function updateEmojiData({ dryRun, maxNew, delayMs }) {
  const [onlineData, pendingData] = await Promise.all([
    readJson(emojiItemsPath),
    readJson(pendingEmojiPath)
  ]);
  const online = getItems(onlineData, 'emojis/items.json');
  const pending = getItems(pendingData, 'pending/emojis.json');
  const existing = new Set([...online, ...pending].map((item) => item.emoji));
  const additions = [];
  let fetched = 0;

  for (const category of EMOJIPEDIA_CATEGORIES) {
    if (additions.length >= maxNew) break;

    const page = await fetchEmojipediaCategory(category);
    for (const item of page.items) {
      fetched += 1;
      if (existing.has(item.emoji)) continue;
      existing.add(item.emoji);
      additions.push(item);
      if (additions.length >= maxNew) break;
    }

    await delay(delayMs);
  }

  if (!dryRun && additions.length > 0) {
    const nextIndex = getNextIdIndex([...online, ...pending]);
    const nextPending = pending.concat(
      additions.map((item, index) => ({
        id: makeId('emoji', item.emoji, nextIndex + index),
        ...item
      }))
    );

    await writeJson(pendingEmojiPath, {
      source: 'Emojipedia',
      total: nextPending.length,
      items: nextPending
    });
    await updateManifestPendingCount({
      type: 'emojis',
      online: online.length,
      pending: nextPending.length
    });
  }

  return {
    name: 'pending/emojis.json',
    online: online.length,
    pending: pending.length + additions.length,
    fetched,
    added: additions.length,
    skipped: fetched - additions.length
  };
}

async function updateSymbolData({ dryRun, maxNew, delayMs }) {
  const [onlineData, pendingData, emojiData, pendingEmojiData] = await Promise.all([
    readJson(symbolItemsPath),
    readJson(pendingSymbolPath),
    readJson(emojiItemsPath),
    readJson(pendingEmojiPath)
  ]);
  const online = getItems(onlineData, 'symbols/items.json');
  const pending = getItems(pendingData, 'pending/symbols.json');
  const emojiKeys = getEmojiKeys([
    ...getItems(emojiData, 'emojis/items.json'),
    ...getItems(pendingEmojiData, 'pending/emojis.json')
  ]);
  const existing = new Set([...online, ...pending].map((item) => item.symbol));
  const additions = [];
  let fetched = 0;

  for (const block of SYMBL_BLOCKS) {
    if (additions.length >= maxNew) break;

    const page = await fetchSymblBlock(block);
    for (const item of page.items) {
      fetched += 1;
      if (isTextDefaultEmojiSymbol(item.symbol, emojiKeys)) continue;
      if (existing.has(item.symbol)) continue;
      existing.add(item.symbol);
      additions.push(item);
      if (additions.length >= maxNew) break;
    }

    await delay(delayMs);
  }

  if (!dryRun && additions.length > 0) {
    const nextIndex = getNextIdIndex([...online, ...pending]);
    const nextPending = pending.concat(
      additions.map((item, index) => ({
        id: makeId('symbol', item.symbol, nextIndex + index),
        ...item
      }))
    );

    await writeJson(pendingSymbolPath, {
      source: 'SYMBL',
      total: nextPending.length,
      items: nextPending
    });
    await updateManifestPendingCount({
      type: 'symbols',
      online: online.length,
      pending: nextPending.length
    });
  }

  return {
    name: 'pending/symbols.json',
    online: online.length,
    pending: pending.length + additions.length,
    fetched,
    added: additions.length,
    skipped: fetched - additions.length
  };
}

async function fetchEmojipediaCategory(category) {
  const url = `https://emojipedia.org/zh/${encodeURIComponent(category.slug)}`;
  const html = await fetchText(url);
  const payload = extractNextPayload(html);
  const categoryData = findEmojipediaCategoryPayload(payload, category.slug);
  const items = [];

  for (const subCategory of categoryData.subCategories ?? []) {
    for (const emoji of subCategory.emoji ?? []) {
      if (!emoji.code || !emoji.title) continue;
      const name = emoji.currentCldrName || emoji.title;
      const localCategory = normalizeEmojiCategory(category.category, subCategory.title);
      items.push({
        emoji: emoji.code,
        name,
        category: localCategory,
        keywords: uniqueCompact([name, emoji.title, subCategory.title, localCategory]),
        text: `可用于表达「${name}」相关含义。`
      });
    }
  }

  return { url, items };
}

function normalizeEmojiCategory(category, subCategoryTitle) {
  if (category === '人物' && subCategoryTitle === '手和身体部位') {
    return '身体';
  }

  if (category === '人物' && subCategoryTitle === '活动与运动') {
    return '行为';
  }

  if (category === '人物' && subCategoryTitle === '职业、角色和幻想') {
    return '角色';
  }

  if (category === '人物' && subCategoryTitle === '家庭与夫妻') {
    return '家庭';
  }

  return category;
}

function findEmojipediaCategoryPayload(payload, slug) {
  const marker = `{"slug":"${slug}"`;
  let searchFrom = 0;

  while (searchFrom < payload.length) {
    const start = payload.indexOf(marker, searchFrom);
    if (start === -1) break;

    const candidate = JSON.parse(extractJsonObjectAt(payload, start));
    if (Array.isArray(candidate.subCategories)) {
      return candidate;
    }

    searchFrom = start + marker.length;
  }

  throw new Error(`Could not find Emojipedia category payload: ${slug}`);
}

async function fetchSymblBlock(block) {
  const url = `https://symbl.cc/en/unicode/blocks/${block.slug}/`;
  const html = await fetchText(url);
  const title = decodeHtml(extractFirst(html, /<title>([^<]+)/) ?? block.slug);
  const blockName = title.split(':')[0].trim();
  const items = [];
  const cardPattern = /<li\b[^>]*class="[^"]*\bcharacter-card\b[^"]*"[\s\S]*?<\/li>/g;
  let cardMatch;

  while ((cardMatch = cardPattern.exec(html))) {
    const card = cardMatch[0];
    const symbol = decodeHtml(extractFirst(card, /data-symbol="([^"]*)"/) ?? '').trim();
    const label = decodeHtml(extractFirst(card, /data-label="([^"]*)"/) ?? '').trim();
    const href = decodeHtml(extractFirst(card, /href="([^"]*)"/) ?? '');
    const code = decodeHtml(extractFirst(card, /character-card__code[^>]*>([^<]*)</) ?? '').trim();

    if (!isUsableSymbol(symbol) || !label || !code) continue;

    items.push({
      symbol,
      name: label,
      category: [block.category],
      searchTerms: uniqueCompact([label, blockName, code, `U+${code}`]),
      notes: `${label}，Unicode U+${code}。数据来源：SYMBL ${new URL(href, 'https://symbl.cc').toString()}`
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

function extractNextPayload(html) {
  const chunks = [];
  const chunkPattern = /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)<\/script>/g;
  let match;

  while ((match = chunkPattern.exec(html))) {
    chunks.push(JSON.parse(`"${match[1]}"`));
  }

  if (chunks.length === 0) {
    throw new Error('Could not find Next.js hydration payload');
  }

  return chunks.join('');
}

function extractJsonObjectAt(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  throw new Error('Unterminated JSON object in payload');
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

function isUsableSymbol(symbol) {
  if (!symbol || symbol.length === 0) return false;

  const codePoints = [...symbol].map((char) => char.codePointAt(0));
  return codePoints.every((codePoint) => {
    if (codePoint === undefined) return false;
    if (codePoint <= 0x20 || codePoint === 0x7f) return false;
    if (codePoint >= 0x200b && codePoint <= 0x200f) return false;
    if (codePoint >= 0x2028 && codePoint <= 0x202f) return false;
    if (codePoint >= 0x2060 && codePoint <= 0x206f) return false;
    if (codePoint >= 0xe000 && codePoint <= 0xf8ff) return false;
    if (codePoint >= 0xf0000 && codePoint <= 0xffffd) return false;
    if (codePoint >= 0x100000 && codePoint <= 0x10fffd) return false;
    if (codePoint === 0xfeff) return false;
    return true;
  });
}

function uniqueCompact(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) {
    throw new Error(`Invalid ${fileName}`);
  }

  return data.items;
}

function getNextIdIndex(items) {
  let max = 0;

  for (const item of items) {
    const match = /-(\d+)$/.exec(String(item.id ?? ''));
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }

  return max + 1;
}

function makeId(prefix, value, index) {
  const codePoints = [...String(value ?? '')]
    .map((char) => char.codePointAt(0).toString(16))
    .join('-');
  return `${prefix}-${codePoints || 'empty'}-${index}`;
}

async function updateManifestPendingCount({ type, online, pending }) {
  const manifest = await readJson(manifestPath);
  const existing = manifest.datasets?.[type] ?? {};

  manifest.generatedAt = new Date().toISOString();
  manifest.datasets = {
    ...manifest.datasets,
    [type]: {
      ...existing,
      online,
      pending,
      total: online + pending
    }
  };

  await writeJson(manifestPath, manifest);
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
    if (arg === '--dry-run') {
      parsed['dry-run'] = true;
      continue;
    }

    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) {
      parsed[match[1]] = match[2];
    }
  }

  return parsed;
}

function parseMaxNew(value) {
  if (value === 'all') return Number.POSITIVE_INFINITY;

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid --max-new. Use a positive integer or "all".');
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

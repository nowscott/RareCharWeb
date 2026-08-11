#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin } from 'pinyin';
import { findTextDefaultEmojiSymbolOverlaps } from './emoji-boundary.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');

const manifestPath = join(dataDir, 'manifest.json');
const symbolItemsPath = join(dataDir, 'symbols', 'items.json');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingSymbolPath = join(dataDir, 'pending', 'symbols.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');
const symbolSearchPinyinPath = join(dataDir, 'symbols', 'search-pinyin.json');
const emojiSearchPinyinPath = join(dataDir, 'emojis', 'search-pinyin.json');

const SEARCH_PINYIN_SCHEMA_VERSION = 1;
const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/u;
const SKIN_TONE_PATTERN_GLOBAL = /[\u{1F3FB}-\u{1F3FF}]/gu;
const VARIATION_SELECTOR_PATTERN = /\uFE0F/gu;
const SKIN_TONE_LABELS = new Map([
  ['🏻', '较浅肤色'],
  ['🏼', '中等-浅肤色'],
  ['🏽', '中等肤色'],
  ['🏾', '中等-深肤色'],
  ['🏿', '较深肤色']
]);

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [previousManifest, symbolItems, emojiItems, pendingSymbols, pendingEmojis] = await Promise.all([
    readJsonIfExists(manifestPath),
    readJson(symbolItemsPath),
    readJson(emojiItemsPath),
    readJson(pendingSymbolPath),
    readJson(pendingEmojiPath)
  ]);

  const symbols = getItems(symbolItems, 'symbols/items.json');
  const emojis = getItems(emojiItems, 'emojis/items.json');
  const pendingSymbolItems = getItems(pendingSymbols, 'pending/symbols.json');
  const pendingEmojiItems = getItems(pendingEmojis, 'pending/emojis.json');
  assertNoTextDefaultEmojiSymbolOverlaps(
    [...symbols, ...pendingSymbolItems],
    [...emojis, ...pendingEmojiItems]
  );
  const emojiSkinToneVariantKeys = getEmojiSkinToneVariantKeys(emojis);
  const symbolSearchPinyin = buildSearchPinyinIndex(symbols, {
    keyOf: (item) => item.id ?? item.symbol,
    valuesOf: (item) => [item.name, item.notes, ...(item.searchTerms ?? [])]
  });
  const emojiSearchPinyin = buildSearchPinyinIndex(emojis, {
    keyOf: (item) => item.id ?? item.emoji,
    valuesOf: (item) => [
      item.name,
      item.text,
      ...(item.keywords ?? []),
      emojiSkinToneVariantKeys.has(item.id ?? item.emoji) ? getSkinToneLabel(item.emoji) : undefined
    ]
  });

  await Promise.all([
    rm(join(dataDir, 'symbols', 'by-category'), { recursive: true, force: true }),
    rm(join(dataDir, 'emojis', 'by-category'), { recursive: true, force: true })
  ]);

  const symbolCategoryFiles = await writeCategoryShards({
    type: 'symbols',
    records: symbols,
    categoryOf: (item) => item.category,
    categoryDir: join(dataDir, 'symbols', 'by-category')
  });

  const emojiCategoryFiles = await writeCategoryShards({
    type: 'emojis',
    records: emojis,
    categoryOf: (item) => [item.category],
    categoryDir: join(dataDir, 'emojis', 'by-category')
  });

  await Promise.all([
    writeJson(symbolItemsPath, {
      total: symbols.length,
      items: symbols
    }),
    writeJson(emojiItemsPath, {
      total: emojis.length,
      items: emojis
    }),
    writeJson(pendingSymbolPath, {
      source: 'SYMBL',
      total: pendingSymbolItems.length,
      items: pendingSymbolItems
    }),
    writeJson(pendingEmojiPath, {
      source: 'Emojipedia',
      total: pendingEmojiItems.length,
      items: pendingEmojiItems
    }),
    writeCompactJson(symbolSearchPinyinPath, symbolSearchPinyin),
    writeCompactJson(emojiSearchPinyinPath, emojiSearchPinyin)
  ]);

  const manifest = {
    generatedAt: new Date().toISOString(),
    datasets: {
      symbols: {
        version: getPreviousVersion(previousManifest, 'symbols', 'v1.6.3'),
        online: symbols.length,
        pending: pendingSymbolItems.length,
        total: symbols.length + pendingSymbolItems.length
      },
      emojis: {
        version: getPreviousVersion(previousManifest, 'emojis', 'v1.2.3'),
        online: emojis.length,
        pending: pendingEmojiItems.length,
        total: emojis.length + pendingEmojiItems.length
      }
    },
    outputs: {
      symbols: {
        items: 'symbols/items.json',
        searchPinyin: 'symbols/search-pinyin.json',
        byCategory: symbolCategoryFiles
      },
      emojis: {
        items: 'emojis/items.json',
        searchPinyin: 'emojis/search-pinyin.json',
        byCategory: emojiCategoryFiles
      },
      pending: {
        symbols: 'pending/symbols.json',
        emojis: 'pending/emojis.json'
      }
    }
  };

  await writeJson(manifestPath, manifest);

  console.log('Data build complete.');
  console.log(
    `symbols: online=${symbols.length}, pending=${pendingSymbolItems.length}, categories=${symbolCategoryFiles.length}`
  );
  console.log(
    `emojis: online=${emojis.length}, pending=${pendingEmojiItems.length}, categories=${emojiCategoryFiles.length}`
  );
}

function assertNoTextDefaultEmojiSymbolOverlaps(symbols, emojis) {
  const overlaps = findTextDefaultEmojiSymbolOverlaps(symbols, emojis);
  if (overlaps.length === 0) return;

  const sample = overlaps.slice(0, 10).map((item) => `${item.symbol} ${item.name}`).join(', ');
  throw new Error(`Text-default Emoji found in symbols (${overlaps.length}): ${sample}`);
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) {
    throw new Error(`Invalid ${fileName}`);
  }

  return data.items;
}

function getPreviousVersion(manifest, type, fallback) {
  const version = manifest?.datasets?.[type]?.version ?? manifest?.sources?.[type]?.version;
  return typeof version === 'string' ? version : fallback;
}

function buildSearchPinyinIndex(records, { keyOf, valuesOf }) {
  const seen = new Set();
  const items = records.map((record) => {
    const key = String(keyOf(record) ?? '').trim();
    if (!key) throw new Error('Search pinyin index contains an empty key');
    if (seen.has(key)) throw new Error(`Duplicate search pinyin key: ${key}`);
    seen.add(key);

    return [key, toPinyinFields(valuesOf(record))];
  });

  if (items.length !== records.length) {
    throw new Error('Search pinyin index count mismatch');
  }

  return {
    schemaVersion: SEARCH_PINYIN_SCHEMA_VERSION,
    items
  };
}

function toPinyinFields(values) {
  try {
    return [...new Set(
      values
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .map((value) => pinyin(value, { style: 'normal', heteronym: false }).join('').toLowerCase())
        .filter(Boolean)
    )];
  } catch {
    return [];
  }
}

function getSkinToneLabel(symbol) {
  const labels = Array.from(String(symbol ?? ''))
    .map((char) => SKIN_TONE_LABELS.get(char))
    .filter(Boolean);

  return labels.length > 0 ? [...new Set(labels)].join('、') : undefined;
}

function getEmojiSkinToneVariantKeys(emojis) {
  const grouped = new Map();

  for (const emoji of emojis) {
    const key = String(emoji.variantBase ?? emoji.emoji)
      .trim()
      .replace(SKIN_TONE_PATTERN_GLOBAL, '')
      .replace(VARIATION_SELECTOR_PATTERN, '');
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(emoji);
  }

  const variantKeys = new Set();
  for (const group of grouped.values()) {
    const base = group.find((emoji) => !SKIN_TONE_PATTERN.test(emoji.emoji)) ?? group[0];
    for (const emoji of group) {
      if (emoji !== base && SKIN_TONE_PATTERN.test(emoji.emoji)) {
        variantKeys.add(emoji.id ?? emoji.emoji);
      }
    }
  }

  return variantKeys;
}

async function writeCategoryShards({ type, records, categoryOf, categoryDir }) {
  const grouped = new Map();

  for (const record of records) {
    for (const category of categoryOf(record)) {
      const normalized = String(category ?? '').trim() || '其他';
      if (!grouped.has(normalized)) grouped.set(normalized, []);
      grouped.get(normalized).push(record);
    }
  }

  const categoryFiles = [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right, 'zh-Hans-CN'))
    .map(([category, items]) => ({
      id: toFileName(category),
      name: category,
      count: items.length,
      file: `${type}/by-category/${toFileName(category)}.json`,
      items
    }));

  await Promise.all(
    categoryFiles.map((categoryFile) =>
      writeJson(join(categoryDir, `${categoryFile.id}.json`), {
        category: categoryFile.name,
        total: categoryFile.count,
        items: categoryFile.items
      })
    )
  );

  return categoryFiles.map(({ id, name, count, file }) => ({ id, name, count, file }));
}

function toFileName(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'uncategorized';
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readJsonIfExists(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function writeCompactJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data)}\n`, 'utf8');
}

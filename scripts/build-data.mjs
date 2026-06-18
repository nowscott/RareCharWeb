#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');

const manifestPath = join(dataDir, 'manifest.json');
const symbolItemsPath = join(dataDir, 'symbols', 'items.json');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingSymbolPath = join(dataDir, 'pending', 'symbols.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');

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

  await Promise.all([
    rm(join(dataDir, 'symbols', 'by-category'), { recursive: true, force: true }),
    rm(join(dataDir, 'emojis', 'by-category'), { recursive: true, force: true }),
    rm(join(dataDir, 'symbols', 'random-pool.json'), { force: true }),
    rm(join(dataDir, 'emojis', 'random-pool.json'), { force: true })
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
    writeJson(join(dataDir, 'symbols', 'random-pool.json'), {
      total: symbols.length,
      ids: symbols.map((item) => item.id)
    }),
    writeJson(join(dataDir, 'emojis', 'random-pool.json'), {
      total: emojis.length,
      ids: emojis.map((item) => item.id)
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
    })
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
        randomPool: 'symbols/random-pool.json',
        byCategory: symbolCategoryFiles
      },
      emojis: {
        items: 'emojis/items.json',
        randomPool: 'emojis/random-pool.json',
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
      ids: items.map((item) => item.id)
    }));

  await Promise.all(
    categoryFiles.map((categoryFile) =>
      writeJson(join(categoryDir, `${categoryFile.id}.json`), {
        category: categoryFile.name,
        total: categoryFile.count,
        ids: categoryFile.ids
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

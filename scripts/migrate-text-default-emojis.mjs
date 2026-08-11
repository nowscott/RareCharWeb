#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTextDefaultEmojiSymbolOverlaps } from './emoji-boundary.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');
const symbolItemsPath = join(dataDir, 'symbols', 'items.json');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');
const apply = process.argv.includes('--apply');

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [symbolData, emojiData, pendingEmojiData] = await Promise.all([
    readJson(symbolItemsPath),
    readJson(emojiItemsPath),
    readJson(pendingEmojiPath)
  ]);
  const symbols = getItems(symbolData, 'symbols/items.json');
  const emojis = [
    ...getItems(emojiData, 'emojis/items.json'),
    ...getItems(pendingEmojiData, 'pending/emojis.json')
  ];
  const overlaps = findTextDefaultEmojiSymbolOverlaps(symbols, emojis);
  const overlapIds = new Set(overlaps.map((item) => item.id ?? item.symbol));

  console.log(`${apply ? 'Applying' : 'Dry run'}: ${overlaps.length} text-default Emoji symbols`);
  for (const item of overlaps) {
    console.log(`${item.symbol}\t${item.name}\t${item.category.join('/')}`);
  }

  if (!apply || overlaps.length === 0) return;

  const nextItems = symbols.filter((item) => !overlapIds.has(item.id ?? item.symbol));
  await writeJson(symbolItemsPath, { total: nextItems.length, items: nextItems });
  console.log(`symbols/items.json: ${symbols.length} -> ${nextItems.length}`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) throw new Error(`Invalid ${fileName}`);
  return data.items;
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

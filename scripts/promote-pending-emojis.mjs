#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [onlineData, pendingData] = await Promise.all([
    readJson(emojiItemsPath),
    readJson(pendingEmojiPath)
  ]);

  const online = getItems(onlineData, 'emojis/items.json');
  const pending = getItems(pendingData, 'pending/emojis.json');
  const existing = new Set(online.map((item) => item.emoji));
  const promoted = [];

  for (const item of pending) {
    if (existing.has(item.emoji)) continue;
    existing.add(item.emoji);
    promoted.push({
      ...item,
      keywords: uniqueCompact([...(item.keywords ?? []), item.name, item.category]),
      text: cleanEmojiText(item.text, item.name)
    });
  }

  const normalizedOnline = online.map((item) => ({
    ...item,
    keywords: uniqueCompact([...(item.keywords ?? []), item.name, item.category])
  }));

  await writeJson(emojiItemsPath, {
    ...onlineData,
    total: normalizedOnline.length + promoted.length,
    items: normalizedOnline.concat(promoted)
  });

  await writeJson(pendingEmojiPath, {
    source: pendingData.source ?? 'Emojipedia',
    total: 0,
    items: []
  });

  console.log(`Promoted ${promoted.length} pending emoji items.`);
  console.log(`Normalized ${normalizedOnline.length + promoted.length} online emoji keyword sets.`);
}

function cleanEmojiText(text, name) {
  const source = String(text ?? '').trim();
  const expressionMatch = /可用于表达「([^」]+)」相关含义。/.exec(source);
  if (expressionMatch) {
    return `可用于表达「${expressionMatch[1]}」相关含义。`;
  }

  const stripped = source
    .replace(/^来自 Emojipedia「[^」]+」分类（[^）]+）。/, '')
    .replace(/来源：https:\/\/emojipedia\.org\/\S+$/u, '')
    .trim();

  return stripped || `可用于表达「${name}」相关含义。`;
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

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

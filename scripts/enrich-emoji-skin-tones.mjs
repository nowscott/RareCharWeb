#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const emojiItemsPath = join(rootDir, 'public', 'data', 'emojis', 'items.json');
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt';

const SKIN_TONE_LABELS = new Map([
  ['1F3FB', '较浅肤色'],
  ['1F3FC', '中等-浅肤色'],
  ['1F3FD', '中等肤色'],
  ['1F3FE', '中等-深肤色'],
  ['1F3FF', '较深肤色']
]);

const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/u;
const VARIATION_SELECTOR = 'FE0F';

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [emojiData, emojiTestText] = await Promise.all([
    readJson(emojiItemsPath),
    fetchText(EMOJI_TEST_URL)
  ]);

  const items = getItems(emojiData, 'emojis/items.json');
  const variantsBySkeleton = parseSkinToneVariants(emojiTestText);
  const existingEmoji = new Set(items.map((item) => item.emoji));
  let nextIndex = getNextIdIndex(items);
  let added = 0;
  const nextItems = [];

  for (const item of items) {
    nextItems.push(item);

    if (item.category !== '身体' || SKIN_TONE_PATTERN.test(item.emoji)) {
      continue;
    }

    const variants = variantsBySkeleton.get(toSkeleton(item.emoji)) ?? [];
    for (const variant of variants) {
      if (existingEmoji.has(variant.emoji)) continue;

      const name = `${item.name}:${variant.toneLabel}`;
      nextItems.push({
        id: makeId('emoji', variant.emoji, nextIndex),
        emoji: variant.emoji,
        name,
        category: '身体',
        keywords: uniqueCompact([name, item.name, variant.toneLabel, ...(item.keywords ?? []), '身体']),
        text: `可用于表达「${item.name}」的${variant.toneLabel}变体。`
      });
      existingEmoji.add(variant.emoji);
      nextIndex += 1;
      added += 1;
    }
  }

  await writeJson(emojiItemsPath, {
    ...emojiData,
    total: nextItems.length,
    items: nextItems
  });

  console.log(`Added ${added} emoji skin tone variants.`);
}

function parseSkinToneVariants(text) {
  const variantsBySkeleton = new Map();

  for (const line of text.split(/\r?\n/)) {
    const match = /^([0-9A-F ]+)\s*;\s*fully-qualified\s*#\s*(\S+)\s+E[0-9.]+\s+(.+)$/.exec(line);
    if (!match) continue;

    const codePoints = match[1].trim().split(/\s+/);
    const skinTone = codePoints.find((codePoint) => SKIN_TONE_LABELS.has(codePoint));
    if (!skinTone) continue;

    const skeleton = toSkeletonFromCodePoints(codePoints);
    if (!variantsBySkeleton.has(skeleton)) {
      variantsBySkeleton.set(skeleton, []);
    }

    variantsBySkeleton.get(skeleton).push({
      emoji: match[2],
      unicodeName: match[3],
      toneLabel: SKIN_TONE_LABELS.get(skinTone)
    });
  }

  return variantsBySkeleton;
}

async function fetchText(url, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'RareCharWeb data updater (+https://github.com/nowscott/RareCharWeb)'
        }
      });

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

function toSkeleton(emoji) {
  return [...emoji]
    .map((char) => char.codePointAt(0).toString(16).toUpperCase())
    .filter((codePoint) => codePoint !== VARIATION_SELECTOR && !SKIN_TONE_LABELS.has(codePoint))
    .join(' ');
}

function toSkeletonFromCodePoints(codePoints) {
  return codePoints
    .filter((codePoint) => codePoint !== VARIATION_SELECTOR && !SKIN_TONE_LABELS.has(codePoint))
    .join(' ');
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

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

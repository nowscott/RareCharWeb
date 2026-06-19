#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const emojiItemsPath = join(rootDir, 'public', 'data', 'emojis', 'items.json');
const EMOJI_TEST_URL = 'https://unicode.org/Public/emoji/latest/emoji-test.txt';
const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/u;
const VARIATION_SELECTOR_PATTERN = /\uFE0F/gu;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [emojiData, emojiTestText] = await Promise.all([
    readJson(emojiItemsPath),
    fetchText(EMOJI_TEST_URL)
  ]);

  const localItems = getItems(emojiData, 'emojis/items.json');
  const localEmoji = new Set(localItems.map((item) => normalizeEmoji(item.emoji)));
  const localSkeletons = new Set(localItems.map((item) => toSkeleton(item.emoji)));
  const officialRows = parseEmojiTest(emojiTestText);
  const officialFullyQualified = officialRows.filter((row) => row.status === 'fully-qualified');
  const officialEmoji = new Set(officialFullyQualified.map((row) => row.emoji));
  const missingFullyQualified = officialFullyQualified.filter((row) => !localEmoji.has(row.emoji));
  const missingNonTone = missingFullyQualified.filter((row) => !SKIN_TONE_PATTERN.test(row.emoji));
  const missingToneForExistingBase = missingFullyQualified.filter((row) =>
    SKIN_TONE_PATTERN.test(row.emoji) && localSkeletons.has(toSkeleton(row.emoji))
  );
  const localNotFullyQualified = [...localEmoji].filter((emoji) => !officialEmoji.has(emoji));
  const duplicateEmoji = findDuplicates(localItems.map((item) => normalizeEmoji(item.emoji)));

  console.log(JSON.stringify({
    source: EMOJI_TEST_URL,
    officialFullyQualified: officialFullyQualified.length,
    localItems: localItems.length,
    localUnique: localEmoji.size,
    duplicateEmoji,
    missingNonTone: {
      total: missingNonTone.length,
      sample: missingNonTone.slice(0, 50)
    },
    missingToneForExistingBase: {
      total: missingToneForExistingBase.length,
      sample: missingToneForExistingBase.slice(0, 50)
    },
    localNotFullyQualified: {
      total: localNotFullyQualified.length,
      sample: localNotFullyQualified.slice(0, 50)
    }
  }, null, 2));
}

function parseEmojiTest(text) {
  const rows = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const match = /^([0-9A-F ]+)\s*;\s*([^#]+)#\s*(\S+)\s+E[0-9.]+\s+(.+)$/u.exec(line);
    if (!match) continue;

    rows.push({
      emoji: toEmoji(match[1]),
      status: match[2].trim(),
      name: match[4].trim()
    });
  }

  return rows;
}

function toEmoji(codePoints) {
  return String.fromCodePoint(...codePoints.trim().split(/\s+/).map((codePoint) => parseInt(codePoint, 16)));
}

function normalizeEmoji(emoji) {
  return String(emoji ?? '').trim().normalize('NFC');
}

function toSkeleton(emoji) {
  return normalizeEmoji(emoji)
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(VARIATION_SELECTOR_PATTERN, '');
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

async function fetchText(url, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'RareCharWeb data auditor (+https://github.com/nowscott/RareCharWeb)'
        }
      });

      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await delay(1000 * (attempt + 1));
    }
  }

  throw new Error('Failed to fetch ' + url + ': ' + (lastError?.message ?? lastError));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) throw new Error('Invalid ' + fileName);
  return data.items;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

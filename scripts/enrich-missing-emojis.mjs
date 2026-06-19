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
const MIXED_TONE_BASE_BY_NAME_PREFIX = new Map([
  ['handshake', '🤝'],
  ['people with bunny ears', '👯'],
  ['men with bunny ears', '👯‍♂️'],
  ['women with bunny ears', '👯‍♀️'],
  ['people wrestling', '🤼'],
  ['men wrestling', '🤼‍♂️'],
  ['women wrestling', '🤼‍♀️'],
  ['women holding hands', '👭'],
  ['woman and man holding hands', '👫'],
  ['men holding hands', '👬'],
  ['kiss', '💏'],
  ['couple with heart', '💑']
]);

const MISSING_NON_TONE_EMOJIS = [
  {
    emoji: '🫯',
    name: '打斗云',
    category: '行为',
    keywords: ['打斗云', '打架', '冲突', '烟尘', '争斗', '行为'],
    text: '可用于表达打架、争斗、冲突或烟尘翻滚的场景。'
  },
  {
    emoji: '💫',
    name: '头晕目眩',
    category: '笑脸',
    keywords: ['头晕目眩', '眩晕', '星星', '晕', '情绪', '笑脸'],
    text: '可用于表达头晕、眼冒金星、震惊或恍惚的状态。'
  },
  {
    emoji: '🧊',
    name: '冰块',
    category: '物品',
    keywords: ['冰块', '冰', '冷', '降温', '物品'],
    text: '可用于表达冰块、低温、冷饮或降温。'
  },
  {
    emoji: '🧵',
    name: '线',
    category: '物品',
    keywords: ['线', '缝纫线', '针线', '手工', '物品'],
    text: '可用于表达线、缝纫、手工制作或连接。'
  },
  {
    emoji: '🪡',
    name: '缝衣针',
    category: '物品',
    keywords: ['缝衣针', '针', '缝纫', '针线', '手工', '物品'],
    text: '可用于表达缝衣针、缝纫、修补或手工制作。'
  },
  {
    emoji: '💊',
    name: '药丸',
    category: '物品',
    keywords: ['药丸', '药', '胶囊', '医疗', '健康', '物品'],
    text: '可用于表达药物、医疗、健康或治疗。'
  },
  {
    emoji: '🪬',
    name: '法蒂玛之手',
    category: '符号',
    keywords: ['法蒂玛之手', '护身符', '幸运', '守护', '符号'],
    text: '可用于表达护身符、守护、幸运或法蒂玛之手。'
  },
  {
    emoji: '⚛️',
    name: '原子符号',
    category: '符号',
    keywords: ['原子符号', '原子', '科学', '物理', '符号'],
    text: '可用于表达原子、科学、物理或相关符号。'
  },
  {
    emoji: '🔱',
    name: '三叉戟徽章',
    category: '符号',
    keywords: ['三叉戟徽章', '三叉戟', '徽章', '海神', '符号'],
    text: '可用于表达三叉戟、徽章、海神或权威象征。'
  },
  {
    emoji: '🅿️',
    name: '停车按钮',
    category: '符号',
    keywords: ['停车按钮', '停车', 'P按钮', '停车场', '符号'],
    text: '可用于表达停车、停车场或 P 按钮。'
  },
  {
    emoji: '🇫🇴',
    name: '法罗群岛旗帜',
    category: '旗帜',
    keywords: ['法罗群岛旗帜', '法罗群岛', '旗帜'],
    text: '法罗群岛的地区旗帜。'
  }
];

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
  const officialVariants = parseSkinToneVariants(emojiTestText);
  const officialSkinToneRows = parseSkinToneRows(emojiTestText);
  const nextItems = [];
  const existingEmoji = new Set(items.map((item) => normalizeEmoji(item.emoji)));
  let nextIndex = getNextIdIndex(items);
  let addedNonTone = 0;
  let addedSkinTone = 0;

  for (const item of items) {
    if (!existingEmoji.has(normalizeEmoji(item.emoji))) {
      existingEmoji.add(normalizeEmoji(item.emoji));
    }
    nextItems.push({ ...item, emoji: normalizeEmoji(item.emoji) });
  }

  for (const missing of MISSING_NON_TONE_EMOJIS) {
    if (existingEmoji.has(missing.emoji)) continue;

    nextItems.push({
      id: makeId('emoji', missing.emoji, nextIndex),
      emoji: missing.emoji,
      name: missing.name,
      category: missing.category,
      keywords: uniqueCompact(missing.keywords),
      text: missing.text
    });
    existingEmoji.add(missing.emoji);
    nextIndex += 1;
    addedNonTone += 1;
  }

  const baseItems = [...nextItems];
  for (const item of baseItems) {
    if (SKIN_TONE_PATTERN.test(item.emoji)) continue;

    const variants = officialVariants.get(toSkeleton(item.emoji)) ?? [];
    for (const variant of variants) {
      if (existingEmoji.has(variant.emoji)) continue;

      const name = item.name + ':' + variant.toneLabel;
      nextItems.push({
        id: makeId('emoji', variant.emoji, nextIndex),
        emoji: variant.emoji,
        name,
        category: item.category,
        keywords: uniqueCompact([name, item.name, variant.toneLabel, ...(item.keywords ?? []), item.category]),
        text: '可用于表达「' + item.name + '」的' + variant.toneLabel + '变体。'
      });
      existingEmoji.add(variant.emoji);
      nextIndex += 1;
      addedSkinTone += 1;
    }
  }

  for (const row of officialSkinToneRows) {
    if (existingEmoji.has(row.emoji)) continue;

    const baseEmoji = MIXED_TONE_BASE_BY_NAME_PREFIX.get(row.name.split(':')[0]);
    if (!baseEmoji) continue;

    const baseItem = nextItems.find((item) => normalizeEmoji(item.emoji) === baseEmoji);
    if (!baseItem) continue;

    const name = baseItem.name + ':' + row.toneLabel;
    nextItems.push({
      id: makeId('emoji', row.emoji, nextIndex),
      emoji: row.emoji,
      name,
      category: baseItem.category,
      keywords: uniqueCompact([name, baseItem.name, row.toneLabel, ...(baseItem.keywords ?? []), baseItem.category]),
      text: '可用于表达「' + baseItem.name + '」的' + row.toneLabel + '变体。',
      variantBase: baseEmoji
    });
    existingEmoji.add(row.emoji);
    nextIndex += 1;
    addedSkinTone += 1;
  }

  await writeJson(emojiItemsPath, {
    ...emojiData,
    total: nextItems.length,
    items: nextItems
  });

  console.log(JSON.stringify({ addedNonTone, addedSkinTone, total: nextItems.length }, null, 2));
}

function parseSkinToneVariants(text) {
  const variantsBySkeleton = new Map();

  for (const line of text.split(/\r?\n/)) {
    const match = /^([0-9A-F ]+)\s*;\s*fully-qualified\s*#/u.exec(line);
    if (!match) continue;

    const codePoints = match[1].trim().split(/\s+/);
    const skinTone = codePoints.find((codePoint) => SKIN_TONE_LABELS.has(codePoint));
    if (!skinTone) continue;

    const skeleton = toSkeletonFromCodePoints(codePoints);
    if (!variantsBySkeleton.has(skeleton)) variantsBySkeleton.set(skeleton, []);
    variantsBySkeleton.get(skeleton).push({
      emoji: toEmoji(codePoints),
      toneLabel: SKIN_TONE_LABELS.get(skinTone)
    });
  }

  return variantsBySkeleton;
}

function parseSkinToneRows(text) {
  const rows = [];

  for (const line of text.split(/\r?\n/)) {
    const match = /^([0-9A-F ]+)\s*;\s*fully-qualified\s*#\s*\S+\s+E[0-9.]+\s+(.+)$/u.exec(line);
    if (!match) continue;

    const codePoints = match[1].trim().split(/\s+/);
    const toneLabel = getToneLabel(codePoints);
    if (!toneLabel) continue;

    rows.push({
      emoji: toEmoji(codePoints),
      name: match[2].trim(),
      toneLabel
    });
  }

  return rows;
}

function toSkeleton(emoji) {
  return [...normalizeEmoji(emoji)]
    .map((char) => char.codePointAt(0).toString(16).toUpperCase())
    .filter((codePoint) => codePoint !== VARIATION_SELECTOR && !SKIN_TONE_LABELS.has(codePoint))
    .join(' ');
}

function toSkeletonFromCodePoints(codePoints) {
  return codePoints
    .filter((codePoint) => codePoint !== VARIATION_SELECTOR && !SKIN_TONE_LABELS.has(codePoint))
    .join(' ');
}

function getToneLabel(codePoints) {
  const labels = codePoints
    .map((codePoint) => SKIN_TONE_LABELS.get(codePoint))
    .filter(Boolean);

  return labels.length > 0 ? uniqueCompact(labels).join('、') : undefined;
}

function toEmoji(codePoints) {
  return String.fromCodePoint(...codePoints.map((codePoint) => parseInt(codePoint, 16)));
}

function normalizeEmoji(emoji) {
  return String(emoji ?? '').trim().normalize('NFC');
}

function uniqueCompact(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

function getItems(data, fileName) {
  if (!Array.isArray(data.items)) throw new Error('Invalid ' + fileName);
  return data.items;
}

function getNextIdIndex(items) {
  let max = 0;

  for (const item of items) {
    const match = /-(\d+)$/.exec(String(item.id ?? ''));
    if (match) max = Math.max(max, Number(match[1]));
  }

  return max + 1;
}

function makeId(prefix, value, index) {
  const codePoints = [...String(value ?? '')]
    .map((char) => char.codePointAt(0).toString(16))
    .join('-');
  return prefix + '-' + (codePoints || 'empty') + '-' + index;
}

async function fetchText(url, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'RareCharWeb emoji enricher (+https://github.com/nowscott/RareCharWeb)'
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

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

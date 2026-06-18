#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'public', 'data');
const emojiItemsPath = join(dataDir, 'emojis', 'items.json');
const pendingEmojiPath = join(dataDir, 'pending', 'emojis.json');

const BUG_EMOJIS = new Set(['🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠']);

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
    const category = normalizeEmojiCategory(item);
    promoted.push({
      ...item,
      category,
      keywords: normalizeEmojiKeywords(item, category),
      text: cleanEmojiText(item.text, item.name)
    });
  }

  const normalizedOnline = online.map((item) => ({
    ...item,
    category: normalizeEmojiCategory(item),
    keywords: normalizeEmojiKeywords(item, normalizeEmojiCategory(item))
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

function normalizeEmojiCategory(item) {
  if (item.category === '虫类' || item.category === '虫子' || BUG_EMOJIS.has(item.emoji)) {
    return '动物';
  }

  if (item.category === '人物' && Array.isArray(item.keywords) && item.keywords.includes('手和身体部位')) {
    return '身体';
  }

  if (item.category === '人物' && isFamilyEmoji(item)) {
    return '家庭';
  }

  if (item.category === '人物' && isActivityEmoji(item)) {
    return '行为';
  }

  if (item.category === '人物' && isRoleEmoji(item)) {
    return '角色';
  }

  return item.category;
}

function normalizeEmojiKeywords(item, category) {
  const previousCategory = item.category === category ? undefined : item.category;
  const legacyKeywords = item.category === '虫类' || item.category === '虫子' || BUG_EMOJIS.has(item.emoji) ? ['虫类', '昆虫'] : [];
  return uniqueCompact([...(item.keywords ?? []), item.name, ...legacyKeywords, category]).filter(
    (keyword) => keyword !== previousCategory
  );
}

function isFamilyEmoji(item) {
  const keywords = item.keywords ?? [];
  const name = item.name ?? '';

  return (
    keywords.includes('家庭与夫妻') ||
    /^(家庭|情侣|亲吻):/.test(name) ||
    [
      '家庭',
      '情侣',
      '亲吻',
      '手拉手的两个人',
      '手拉手的两个女人',
      '手拉手的一男一女',
      '手拉手的两个男人',
      '一孩家庭',
      '二孩家庭',
      '单亲一孩家庭',
      '单亲二孩家庭'
    ].includes(name)
  );
}

function isActivityEmoji(item) {
  const keywords = item.keywords ?? [];
  const name = item.name ?? '';

  return (
    keywords.includes('活动与运动') ||
    /面向右边$/.test(name) ||
    [
      'Ballet Dancer',
      '芭蕾舞演员'
    ].includes(name)
  );
}

function isRoleEmoji(item) {
  const keywords = item.keywords ?? [];
  const name = item.name ?? '';

  return (
    keywords.includes('职业、角色和幻想') ||
    [
      '戴王冠的人',
      '西装革履的人',
      '穴居巨怪',
      'Hairy Creature'
    ].includes(name)
  );
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

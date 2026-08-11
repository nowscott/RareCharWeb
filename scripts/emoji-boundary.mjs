const VARIATION_SELECTOR_PATTERN = /\uFE0F/gu;
const EMOJI_PATTERN = /^\p{Emoji}$/u;
const EMOJI_PRESENTATION_PATTERN = /^\p{Emoji_Presentation}$/u;
const EMOJI_COMPONENT_PATTERN = /^\p{Emoji_Component}$/u;

export function normalizeEmojiKey(value) {
  return String(value ?? '').trim().normalize('NFC').replace(VARIATION_SELECTOR_PATTERN, '');
}

export function getEmojiKeys(items) {
  return new Set(items.map((item) => normalizeEmojiKey(item.emoji)).filter(Boolean));
}

export function isTextDefaultEmojiSymbol(symbol, emojiKeys) {
  const key = normalizeEmojiKey(symbol);
  return [...key].length === 1
    && EMOJI_PATTERN.test(key)
    && !EMOJI_PRESENTATION_PATTERN.test(key)
    && !EMOJI_COMPONENT_PATTERN.test(key)
    && emojiKeys.has(key);
}

export function findTextDefaultEmojiSymbolOverlaps(symbols, emojis) {
  const emojiKeys = getEmojiKeys(emojis);
  return symbols.filter((item) => isTextDefaultEmojiSymbol(item.symbol, emojiKeys));
}

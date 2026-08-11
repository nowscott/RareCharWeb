import { SymbolData, SymbolVariantData } from './types';

const SKIN_TONE_LABELS = new Map([
  ['🏻', '较浅肤色'],
  ['🏼', '中等-浅肤色'],
  ['🏽', '中等肤色'],
  ['🏾', '中等-深肤色'],
  ['🏿', '较深肤色']
]);

const SKIN_TONE_PATTERN = /[\u{1F3FB}-\u{1F3FF}]/u;
const SKIN_TONE_PATTERN_GLOBAL = /[\u{1F3FB}-\u{1F3FF}]/gu;
const VARIATION_SELECTOR_PATTERN = /\uFE0F/gu;

export function groupEmojiSkinToneVariants(symbols: SymbolData[]): SymbolData[] {
  const grouped = new Map<string, SymbolData[]>();

  for (const symbol of symbols) {
    const key = getEmojiVariantKey(symbol._variantBaseSymbol ?? symbol.symbol);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(symbol);
  }

  return [...grouped.values()].map(toDisplaySymbol);
}

export function hasSkinTone(symbol: string): boolean {
  return SKIN_TONE_PATTERN.test(symbol);
}

export function getEmojiVariantKey(symbol: string): string {
  return symbol
    .trim()
    .replace(SKIN_TONE_PATTERN_GLOBAL, '')
    .replace(VARIATION_SELECTOR_PATTERN, '');
}

function toDisplaySymbol(group: SymbolData[]): SymbolData {
  const base = group.find((symbol) => !hasSkinTone(symbol.symbol)) ?? group[0];
  const variants = group
    .filter((symbol) => symbol !== base && hasSkinTone(symbol.symbol))
    .map(toVariant)
    .sort((left, right) => getToneSortIndex(left) - getToneSortIndex(right));

  const duplicateSearchTerms = group
    .filter((symbol) => symbol !== base && !hasSkinTone(symbol.symbol))
    .flatMap((symbol) => [symbol.symbol.trim(), symbol.name, symbol.notes, ...symbol.searchTerms]);

  return {
    ...base,
    symbol: base.symbol.trim(),
    searchTerms: uniqueCompact([
      ...base.searchTerms,
      ...duplicateSearchTerms,
      ...variants.flatMap((variant) => [
        variant.symbol,
        variant.name,
        variant.toneLabel,
        variant.notes,
        ...variant.searchTerms
      ])
    ]),
    _searchSourceIds: uniqueCompact(
      group.flatMap((symbol) => symbol._searchSourceIds ?? [symbol.id ?? symbol.symbol])
    ),
    variants: variants.length > 0 ? variants : undefined
  };
}

function toVariant(symbol: SymbolData): SymbolVariantData {
  return {
    id: symbol.id,
    symbol: symbol.symbol.trim(),
    name: symbol.name,
    searchTerms: symbol.searchTerms,
    notes: symbol.notes,
    toneLabel: getSkinToneLabel(symbol.symbol)
  };
}

function getSkinToneLabel(symbol: string): string | undefined {
  const labels = Array.from(symbol)
    .map((char) => SKIN_TONE_LABELS.get(char))
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? uniqueCompact(labels).join('、') : undefined;
}

function getToneSortIndex(variant: SymbolVariantData): number {
  const label = variant.toneLabel ?? '';
  const index = [...SKIN_TONE_LABELS.values()].findIndex((toneLabel) => toneLabel === label);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function uniqueCompact(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

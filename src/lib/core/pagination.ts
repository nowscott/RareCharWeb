export const SYMBOL_PAGE_SIZE = 60;

export function getHourlySeed(now = Date.now()): number {
  return Math.floor(now / 3_600_000);
}

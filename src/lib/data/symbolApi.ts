import { SYMBOL_PAGE_SIZE } from '@/lib/core/pagination';
import { PaginatedSymbolResponse, SymbolData } from '@/lib/core/types';

export interface SymbolListQuery {
  apiEndpoint: string;
  category: string;
  searchQuery: string;
  seed: number;
}

export interface InfiniteSymbolPage {
  data: SymbolData[];
  nextPage: number | undefined;
  total: number;
}

export function normalizeSymbolSearch(searchQuery: string): string {
  return searchQuery.trim();
}

export function getSymbolQueryKey({
  apiEndpoint,
  category,
  searchQuery,
  seed
}: SymbolListQuery) {
  const normalizedSearch = normalizeSymbolSearch(searchQuery);
  const normalizedCategory = category || 'all';
  const randomSeed = normalizedCategory === 'all' && !normalizedSearch ? seed : null;

  return ['symbols', apiEndpoint, normalizedCategory, normalizedSearch, randomSeed] as const;
}

export function toInfiniteSymbolPage(response: PaginatedSymbolResponse): InfiniteSymbolPage {
  return {
    data: response.symbols,
    nextPage: response.hasMore ? response.page + 1 : undefined,
    total: response.total
  };
}

export async function fetchSymbolPage(
  query: SymbolListQuery,
  page: number,
  signal?: AbortSignal
): Promise<InfiniteSymbolPage> {
  const normalizedSearch = normalizeSymbolSearch(query.searchQuery);
  const normalizedCategory = query.category || 'all';
  const params = new URLSearchParams({
    page: String(page),
    limit: String(SYMBOL_PAGE_SIZE)
  });

  if (normalizedCategory === 'all' && !normalizedSearch) {
    params.set('seed', String(query.seed));
  }
  if (normalizedCategory !== 'all') params.set('category', normalizedCategory);
  if (normalizedSearch) params.set('search', normalizedSearch);

  const response = await fetch(`${query.apiEndpoint}?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data: PaginatedSymbolResponse = await response.json();
  return toInfiniteSymbolPage(data);
}

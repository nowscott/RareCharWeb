import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { calculateCategoryStats } from '@/lib/core/apiUtils';
import { EmojiData, PaginatedSymbolResponse, SymbolData, SymbolDataResponse } from '@/lib/core/types';
import { groupEmojiSkinToneVariants } from '@/lib/core/emojiVariants';
import { filterSymbolsByCategory, searchSymbols, sortSymbols, shuffleArray } from '@/lib/core/symbolUtils';

export interface PaginatedParams {
  page: number;
  limit: number;
  seed?: number;
  category?: string;
  search?: string;
}

// 内存缓存 — 数据文件仅部署时变更，缓存整个进程生命周期
let _symbolsCache: SymbolDataResponse | null = null;
let _emojiCache: SymbolDataResponse | null = null;
let _manifestCache: DataManifest | null = null;
let _manifestPromise: Promise<DataManifest> | null = null;
const _searchIndexPromises: Partial<Record<DatasetType, Promise<Map<string, string[]>>>> = {};
const _attachedSearchIndexes = new Set<DatasetType>();
const _warnedSearchIndexes = new Set<DatasetType>();

type DatasetType = 'symbols' | 'emojis';

export interface DataManifest {
  generatedAt?: string;
  datasets?: {
    symbols?: DataManifestDataset;
    emojis?: DataManifestDataset;
  };
  outputs?: {
    symbols?: {
      items?: string;
      searchPinyin?: string;
      byCategory?: DataManifestCategory[];
    };
    emojis?: {
      items?: string;
      searchPinyin?: string;
      byCategory?: DataManifestCategory[];
    };
  };
}

export interface DataManifestDataset {
  version?: unknown;
  online?: unknown;
  pending?: unknown;
  total?: unknown;
}

export interface DataManifestCategory {
  id?: unknown;
  name?: unknown;
  count?: unknown;
  file?: unknown;
}

interface CategoryShard<T> {
  items?: T[];
}

interface SearchPinyinIndexFile {
  schemaVersion?: unknown;
  items?: unknown;
}

function getPublicDataPath(...segments: string[]) {
  return join(process.cwd(), 'public', 'data', ...segments);
}

async function getDataVersion(type: 'symbols' | 'emojis'): Promise<string> {
  const manifest = await getManifest();
  const version = manifest.datasets?.[type]?.version;
  return typeof version === 'string' ? version : 'v1.0.0';
}

async function getManifest(): Promise<DataManifest> {
  if (_manifestCache) return _manifestCache;

  if (!_manifestPromise) {
    _manifestPromise = readFile(getPublicDataPath('manifest.json'), 'utf8')
      .then((raw) => {
        _manifestCache = JSON.parse(raw) as DataManifest;
        return _manifestCache;
      });
  }

  return _manifestPromise;
}

export async function getLocalDataManifest(): Promise<DataManifest> {
  return getManifest();
}

export async function getLocalSymbolDataResponse(): Promise<SymbolDataResponse> {
  if (_symbolsCache) return _symbolsCache;

  const symbols = await loadSymbolsFromCategoryShards();

  const categoryStats = calculateCategoryStats(symbols);
  const version = await getDataVersion('symbols');

  _symbolsCache = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  return _symbolsCache;
}

export async function getLocalEmojiDataResponse(): Promise<SymbolDataResponse> {
  if (_emojiCache) return _emojiCache;

  const version = await getDataVersion('emojis');
  const emojis = await loadEmojisFromCategoryShards();

  const symbols: SymbolData[] = groupEmojiSkinToneVariants(emojis.map((emoji) => ({
    id: emoji.id,
    symbol: emoji.emoji,
    name: emoji.name,
    category: [emoji.category],
    searchTerms: emoji.keywords || [],
    notes: emoji.text || '',
    _variantBaseSymbol: emoji.variantBase,
    _searchSourceIds: [emoji.id ?? emoji.emoji]
  })));

  const categoryStats = calculateCategoryStats(symbols);

  _emojiCache = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  return _emojiCache;
}

async function loadSymbolsFromCategoryShards(): Promise<SymbolData[]> {
  const manifest = await getManifest();
  const shardFiles = getShardFiles(manifest.outputs?.symbols?.byCategory);

  if (shardFiles.length === 0) {
    const data = await readItemsFile<SymbolData>(manifest.outputs?.symbols?.items ?? 'symbols/items.json', 'symbols data');
    return data;
  }

  const shards = await Promise.all(
    shardFiles.map((file) => readJsonData<CategoryShard<SymbolData>>(file))
  );

  return dedupeRecords(
    shards.flatMap((shard) => validateShardItems(shard, 'symbols category shard')),
    (item) => item.id ?? item.symbol
  );
}

async function loadEmojisFromCategoryShards(): Promise<EmojiData[]> {
  const manifest = await getManifest();
  const shardFiles = getShardFiles(manifest.outputs?.emojis?.byCategory);

  if (shardFiles.length === 0) {
    const data = await readItemsFile<EmojiData>(manifest.outputs?.emojis?.items ?? 'emojis/items.json', 'emoji data');
    return data;
  }

  const shards = await Promise.all(
    shardFiles.map((file) => readJsonData<CategoryShard<EmojiData>>(file))
  );

  return dedupeRecords(
    shards.flatMap((shard) => validateShardItems(shard, 'emoji category shard')),
    (item) => item.id ?? item.emoji
  );
}

function getShardFiles(shards: DataManifestCategory[] | undefined): string[] {
  return (shards ?? [])
    .map((shard) => shard.file)
    .filter((file): file is string => typeof file === 'string' && file.length > 0);
}

function validateShardItems<T>(shard: CategoryShard<T>, name: string): T[] {
  if (!Array.isArray(shard.items)) {
    throw new Error(`Invalid ${name}`);
  }

  return shard.items;
}

async function readItemsFile<T>(file: string, name: string): Promise<T[]> {
  const data = await readJsonData<{ items?: T[] }>(file);
  if (!Array.isArray(data.items)) {
    throw new Error(`Invalid ${name}`);
  }

  return data.items;
}

async function readJsonData<T>(file: string): Promise<T> {
  const raw = await readFile(getPublicDataPath(...file.split('/')), 'utf8');
  return JSON.parse(raw) as T;
}

function dedupeRecords<T>(records: T[], getKey: (record: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const record of records) {
    const key = getKey(record);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(record);
  }

  return result;
}

/**
 * 对已缓存的符号数据进行分页查询，支持分类筛选、搜索和随机打乱
 */
export async function getPaginatedSymbols(params: PaginatedParams): Promise<PaginatedSymbolResponse> {
  const [data, searchIndex] = await Promise.all([
    getLocalSymbolDataResponse(),
    params.search?.trim() ? getSearchPinyinIndex('symbols') : null
  ]);
  attachSearchPinyin('symbols', data.symbols, searchIndex);
  return paginateSymbols(data.symbols, params);
}

export async function getPaginatedEmoji(params: PaginatedParams): Promise<PaginatedSymbolResponse> {
  const [data, searchIndex] = await Promise.all([
    getLocalEmojiDataResponse(),
    params.search?.trim() ? getSearchPinyinIndex('emojis') : null
  ]);
  attachSearchPinyin('emojis', data.symbols, searchIndex);
  return paginateSymbols(data.symbols, params);
}

async function getSearchPinyinIndex(type: DatasetType): Promise<Map<string, string[]> | null> {
  if (!_searchIndexPromises[type]) {
    _searchIndexPromises[type] = loadSearchPinyinIndex(type);
  }
  const searchIndexPromise = _searchIndexPromises[type];

  try {
    return await searchIndexPromise;
  } catch (error) {
    if (_searchIndexPromises[type] === searchIndexPromise) {
      delete _searchIndexPromises[type];
    }
    if (!_warnedSearchIndexes.has(type)) {
      _warnedSearchIndexes.add(type);
      console.warn(`Failed to load ${type} search pinyin index; using basic search only.`, error);
    }
    return null;
  }
}

async function loadSearchPinyinIndex(type: DatasetType): Promise<Map<string, string[]>> {
  const manifest = await getManifest();
  const file = manifest.outputs?.[type]?.searchPinyin;
  if (!file) throw new Error(`Missing ${type} search pinyin output in manifest`);

  const data = await readJsonData<SearchPinyinIndexFile>(file);
  if (data.schemaVersion !== 1 || !Array.isArray(data.items)) {
    throw new Error(`Invalid ${type} search pinyin index`);
  }

  const index = new Map<string, string[]>();
  for (const item of data.items) {
    if (!Array.isArray(item) || typeof item[0] !== 'string' || !Array.isArray(item[1])) {
      throw new Error(`Invalid ${type} search pinyin index entry`);
    }

    const values = item[1];
    if (!values.every((value) => typeof value === 'string')) {
      throw new Error(`Invalid ${type} search pinyin values for ${item[0]}`);
    }
    if (index.has(item[0])) throw new Error(`Duplicate ${type} search pinyin key: ${item[0]}`);
    index.set(item[0], values);
  }

  const expectedCount = manifest.datasets?.[type]?.online;
  if (typeof expectedCount === 'number' && index.size !== expectedCount) {
    throw new Error(`${type} search pinyin count mismatch: ${index.size} !== ${expectedCount}`);
  }

  return index;
}

function attachSearchPinyin(
  type: DatasetType,
  symbols: SymbolData[],
  index: Map<string, string[]> | null
): void {
  if (!index || _attachedSearchIndexes.has(type)) return;

  for (const symbol of symbols) {
    const sourceIds = symbol._searchSourceIds ?? [symbol.id ?? symbol.symbol];
    symbol._searchPinyin = [...new Set(sourceIds.flatMap((id) => index.get(id) ?? []))];
  }
  _attachedSearchIndexes.add(type);
}

function toClientSymbol(symbol: SymbolData): SymbolData {
  return {
    id: symbol.id,
    symbol: symbol.symbol,
    name: symbol.name,
    category: symbol.category,
    searchTerms: symbol.searchTerms,
    notes: symbol.notes,
    variants: symbol.variants
  };
}

function paginateSymbols(allSymbols: SymbolData[], params: PaginatedParams): PaginatedSymbolResponse {
  const { page, limit, seed, category, search } = params;
  let symbols = allSymbols;

  // 1. 随机打乱（仅在无搜索且分类为 all 时打乱）
  if (!search?.trim() && (!category || category === 'all')) {
    symbols = shuffleArray(symbols, seed);
  }

  // 2. 按分类过滤
  if (category && category !== 'all') {
    symbols = filterSymbolsByCategory(symbols, category);
  }

  // 3. 搜索过滤
  if (search?.trim()) {
    symbols = searchSymbols(symbols, search);
  }

  // 4. 排序（非全部 + 有搜索时保持搜索顺序）
  const hasSearch = !!(search?.trim());
  symbols = sortSymbols(symbols, category || 'all', hasSearch);

  // 5. 分页
  const total = symbols.length;
  const start = (page - 1) * limit;
  const paged = symbols.slice(start, start + limit).map(toClientSymbol);

  return {
    symbols: paged,
    page,
    limit,
    total,
    hasMore: start + limit < total
  };
}

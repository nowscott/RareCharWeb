// 应用核心数据类型定义

export interface SymbolData {
  id?: string;
  symbol: string;
  name: string;
  category: string[];
  searchTerms: string[];
  notes: string;
  variants?: SymbolVariantData[];
  _variantBaseSymbol?: string;
  // 服务端搜索索引字段，输出客户端前会被剔除
  _searchPinyin?: string[];
  _searchSourceIds?: string[];
}

export interface SymbolVariantData {
  id?: string;
  symbol: string;
  name: string;
  searchTerms: string[];
  notes: string;
  toneLabel?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  count: number;
}

export interface EmojiData {
  id?: string;
  emoji: string;
  name: string;
  category: string;
  keywords?: string[];
  text?: string;
  variantBase?: string;
}

export interface SymbolDataResponse {
  version: string;
  symbols: SymbolData[];
  stats?: {
    totalSymbols: number;
    categoryStats: CategoryStat[];
  };
}

export interface PaginatedSymbolResponse {
  symbols: SymbolData[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface EmojiDataResponse {
  version: string;
  emojis: EmojiData[];
}

// 应用核心数据类型定义

export interface SymbolData {
  id?: string;
  symbol: string;
  name: string;
  pronunciation: string;
  category: string[];
  searchTerms: string[];
  notes: string;
  variants?: SymbolVariantData[];
  _variantBaseSymbol?: string;
  // 预计算字段 — 服务端填充，客户端搜索直接读取
  _namePinyin?: string;
  _notesPinyin?: string;
  _searchTermsPinyin?: string[];
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

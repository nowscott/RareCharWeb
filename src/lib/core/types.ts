// 应用核心数据类型定义

export interface SymbolData {
  symbol: string;
  name: string;
  pronunciation: string;
  category: string[];
  searchTerms: string[];
  notes: string;
  // 预计算字段 — 服务端填充，客户端搜索直接读取
  _namePinyin?: string;
  _notesPinyin?: string;
  _searchTermsPinyin?: string[];
}

export interface CategoryStat {
  id: string;
  name: string;
  count: number;
}

export interface EmojiData {
  emoji: string;
  name: string;
  category: string;
  keywords?: string[];
  text?: string;
}

export interface SymbolDataResponse {
  version: string;
  symbols: SymbolData[];
  stats?: {
    totalSymbols: number;
    categoryStats: CategoryStat[];
  };
}

export interface EmojiDataResponse {
  version: string;
  emojis: EmojiData[];
}
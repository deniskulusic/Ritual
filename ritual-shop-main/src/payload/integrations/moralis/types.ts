export type MoralisLoginResponse = {
  result?: {
    master_token?: string | null;
  };
};

export type MoralisProduct = {
  BAR_KOD?: string | null;
  J_M?: string | null;
  KOLICINA?: number | string | null;
  NAZ_ART?: string | null;
  OPIS?: string | null;
  OPIS_1?: string | null;
  P_D_V?: number | string | null;
  SIF_ART?: string | null;
  VPC?: number | string | null;
  ZALIHE?: string | null;
  [key: string]: unknown;
};

export type MoralisProductsResponse = {
  dataset?: {
    data?: MoralisProduct[];
    primary_key?: string;
  };
};

export type MoralisDatasetRecord = Record<string, unknown>;

export type MoralisDatasetResponse<T extends MoralisDatasetRecord = MoralisDatasetRecord> = {
  dataset?: {
    data?: T[];
    primary_key?: string;
  };
  result?: Record<string, unknown>;
  status?: {
    success?: boolean;
    warning?: unknown[];
  };
};

export type MoralisUpdateTablesResponse = {
  result?: Record<string, Record<string, unknown>>;
  status?: {
    success?: boolean;
    warning?: unknown[];
  };
};

export type MoralisProductFetchOptions = {
  limit?: number;
  offset?: number;
};

import { getMoralisMasterToken, resetMoralisMasterToken } from "./auth";
import { getMoralisConfig } from "./config";
import type {
  MoralisProduct,
  MoralisProductFetchOptions,
  MoralisProductsResponse,
} from "./types";

const parseJSON = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Moralis returned invalid JSON: ${text.slice(0, 200)}`);
  }
};

const isAuthError = (status: number) => status === 401 || status === 403;

const requestMoralisProducts = async (
  body: Record<string, unknown>,
  allowRetry = true,
) => {
  const config = getMoralisConfig();
  const token = await getMoralisMasterToken();
  const response = await fetch(config.apiURL, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      MasterToken: token,
    },
    method: "POST",
  });

  if (isAuthError(response.status) && allowRetry) {
    resetMoralisMasterToken();
    await getMoralisMasterToken({ forceRefresh: true });

    return requestMoralisProducts(body, false);
  }

  if (!response.ok) {
    throw new Error(`Moralis products request failed with status ${response.status}.`);
  }

  return parseJSON<MoralisProductsResponse>(response);
};

export const fetchMoralisProductsPage = async ({
  limit,
  offset,
}: MoralisProductFetchOptions = {}): Promise<MoralisProduct[]> => {
  const config = getMoralisConfig();
  const pageSize = limit ?? config.pageSize;
  const pageOffset = offset ?? 0;
  const response = await requestMoralisProducts({
    filter: [
      {
        compare: "=",
        key: "A.ARTIKAL",
        type: "ftString",
        value_string: " ",
      },
      {
        operand: "AND",
      },
      {
        compare: "=",
        key: "A.AKTIVAN",
        type: "ftString",
        value_string: "D",
      },
      {
        direction: "ASC",
        field: "A.SIF_ART",
        operand: "ORDER",
      },
    ],
    limit: pageSize,
    metadata: false,
    offset: pageOffset,
    select_fields:
      "SIF_ART,NAZ_ART,OPIS,SIF_AMB,MPC,VPC,P_D_V,KOLICINA,J_M,ZALIHE,SVOJSTVO,BAR_KOD",
    web_zalihe: true,
    zalihe: {
      pos_jed: [config.stockLocationCode],
      user_only: true,
    },
  });

  return response.dataset?.data ?? [];
};

export const fetchMoralisProductByItemID = async (itemID: string) => {
  const normalizedItemID = itemID.trim();

  if (!normalizedItemID) {
    return null;
  }

  const config = getMoralisConfig();
  const response = await requestMoralisProducts({
    filter: [
      {
        compare: "=",
        key: "A.ARTIKAL",
        type: "ftString",
        value_string: " ",
      },
      {
        operand: "AND",
      },
      {
        compare: "=",
        key: "A.AKTIVAN",
        type: "ftString",
        value_string: "D",
      },
      {
        operand: "AND",
      },
      {
        compare: "=",
        key: "A.SIF_ART",
        type: "ftString",
        value_string: normalizedItemID,
      },
    ],
    limit: 1,
    metadata: false,
    offset: 0,
    select_fields:
      "SIF_ART,NAZ_ART,OPIS,SIF_AMB,MPC,VPC,P_D_V,KOLICINA,J_M,ZALIHE,SVOJSTVO,BAR_KOD",
    web_zalihe: true,
    zalihe: {
      pos_jed: [config.stockLocationCode],
      user_only: true,
    },
  });

  return response.dataset?.data?.[0] ?? null;
};

export async function* iterateMoralisProducts({
  limit,
}: Pick<MoralisProductFetchOptions, "limit"> = {}) {
  const config = getMoralisConfig();
  const pageSize = limit ?? config.pageSize;
  let offset = 0;

  while (true) {
    const page = await fetchMoralisProductsPage({
      limit: pageSize,
      offset,
    });

    if (page.length === 0) {
      return;
    }

    yield page;

    if (page.length < pageSize) {
      return;
    }

    offset += pageSize;
  }
}

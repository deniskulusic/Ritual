import { getMoralisMasterToken, resetMoralisMasterToken } from "../../../integrations/moralis/auth";
import { getMoralisConfig } from "../../../integrations/moralis/config";
import type {
  MoralisDatasetResponse,
  MoralisUpdateTablesResponse,
} from "../../../integrations/moralis/types";

type MoralisBusinessCustomerRow = {
  IND_BROJ?: null | string;
  NAZ_PAR?: null | string;
  SIF_PAR?: null | number | string;
};

type MoralisPrivateCustomerRow = {
  NAZ_PAR?: null | string;
  SIF_PAR?: null | number | string;
  SIF_PAR_EX?: null | string;
  SIF_PJ?: null | number | string;
};

type MoralisCustomerDocumentRef = {
  sifPar: number;
  sifPj: number;
};

type MoralisOrderDocumentRef = {
  brDok: string;
  intBr: number;
};

type MoralisUpdateTablesRecord = Record<string, unknown>;

const parseJSON = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Moralis returned invalid JSON: ${text.slice(0, 200)}`);
  }
};

const isAuthError = (status: number) => status === 401 || status === 403;

const getInteger = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Math.trunc(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));

  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

function formatMoralisNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const normalized = value.toFixed(4).replace(/\.?0+$/, "");

  return normalized.replace(".", ",");
}

async function requestMoralisJSON<T>(args: {
  allowRetry?: boolean;
  body: Record<string, unknown>;
  url: string;
}) {
  const { allowRetry = true, body, url } = args;
  const token = await getMoralisMasterToken();
  const response = await fetch(url, {
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

    return requestMoralisJSON<T>({
      allowRetry: false,
      body,
      url,
    });
  }

  if (!response.ok) {
    throw new Error(`Moralis request failed with status ${response.status}.`);
  }

  return parseJSON<T>(response);
}

function getFirstDatasetRow<T extends Record<string, unknown>>(
  response: MoralisDatasetResponse<T>,
) {
  return response.dataset?.data?.[0] ?? null;
}

function getUpdateTablesRecord(response: MoralisUpdateTablesResponse, key: string) {
  const exactRecord = response.result?.[key];

  if (exactRecord && typeof exactRecord === "object") {
    return exactRecord as MoralisUpdateTablesRecord;
  }

  const firstRecord = Object.values(response.result ?? {}).find(
    (value) => value && typeof value === "object",
  );

  return firstRecord && typeof firstRecord === "object"
    ? (firstRecord as MoralisUpdateTablesRecord)
    : null;
}

export async function findMoralisPrivateCustomer(privateBuyerKey: string) {
  const config = getMoralisConfig();
  const response = await requestMoralisJSON<MoralisDatasetResponse<MoralisPrivateCustomerRow>>({
    body: {
      filter: [
        {
          compare: "=",
          key: "A.SIF_PAR_EX",
          type: "ftString",
          value_string: privateBuyerKey,
        },
      ],
      limit: 1,
      metadata: false,
      offset: 0,
      select_fields: "SIF_PAR,SIF_PJ,SIF_PAR_EX,NAZ_PAR",
    },
    url: config.partPjLookupURL,
  });
  const row = getFirstDatasetRow(response);
  const sifPar = getInteger(row?.SIF_PAR);
  const sifPj = getInteger(row?.SIF_PJ);

  if (sifPar === null || sifPj === null) {
    return null;
  }

  return {
    raw: row,
    sifPar,
    sifPj,
  };
}

export async function findMoralisBusinessCustomer(taxId: string) {
  const config = getMoralisConfig();
  const response = await requestMoralisJSON<MoralisDatasetResponse<MoralisBusinessCustomerRow>>({
    body: {
      filter: [
        {
          compare: "=",
          key: "A.IND_BROJ",
          type: "ftString",
          value_string: taxId,
        },
      ],
      limit: 1,
      metadata: false,
      offset: 0,
      select_fields: "SIF_PAR,IND_BROJ,NAZ_PAR",
    },
    url: config.partneriLookupURL,
  });
  const row = getFirstDatasetRow(response);
  const sifPar = getInteger(row?.SIF_PAR);

  if (sifPar === null) {
    return null;
  }

  return {
    raw: row,
    sifPar,
  };
}

export async function createMoralisPrivateCustomer(input: {
  address: string;
  city: string;
  country: string;
  name: string;
  privateBuyerKey: string;
}) {
  const config = getMoralisConfig();
  const requestKey = "0|";
  const payload = {
    [requestKey]: {
      action: "bmInsert",
      database: 1,
      generator: "",
      primary_key: "SIF_PJ",
      query_params: [
        {
          function: "PkFu_PartPJ",
          key: "SIF_PJ",
          type: "ftInteger",
          value_string: "0",
        },
        {
          key: "SIF_PAR",
          type: "ftInteger",
          value_string: String(config.webCustomerPartnerID),
        },
        {
          key: "NAZ_PAR",
          type: "ftString",
          value_string: input.name,
        },
        {
          key: "ADRESA",
          type: "ftString",
          value_string: input.address,
        },
        {
          key: "GRAD",
          type: "ftString",
          value_string: input.city,
        },
        {
          key: "DRZAVA",
          type: "ftString",
          value_string: input.country,
        },
        {
          key: "ID_DJ",
          type: "ftInteger",
          value_string: String(config.partPjIDDJ),
        },
        {
          key: "DVO_KUP",
          type: "ftSmallint",
          value_string: "0",
        },
        {
          key: "RAB_KUP",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "RAB_KUP1",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "KRED_LIM",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "INO",
          type: "ftString",
          value_string: "",
        },
        {
          key: "TIP",
          type: "ftSmallint",
          value_string: "0",
        },
        {
          key: "SAMO_UC",
          type: "ftString",
          value_string: "N",
        },
        {
          key: "SIF_PAR_EX",
          type: "ftString",
          value_string: input.privateBuyerKey,
        },
        {
          key: "BR_UGOV",
          type: "ftInteger",
          value_string: "0",
        },
      ],
      returning_key: "SIF_PJ",
      table: "PART_PJ",
    },
  };
  const response = await requestMoralisJSON<MoralisUpdateTablesResponse>({
    body: payload,
    url: config.updateTablesURL,
  });
  const record = getUpdateTablesRecord(response, requestKey);
  const sifPj = getInteger(record?.SIF_PJ);

  if (sifPj === null) {
    throw new Error("Moralis private customer creation did not return SIF_PJ.");
  }

  return {
    documentRef: {
      sifPar: config.webCustomerPartnerID,
      sifPj,
    } satisfies MoralisCustomerDocumentRef,
    raw: response,
  };
}

export async function createMoralisBusinessCustomer(input: {
  address: string;
  companyName: string;
  createdOn: string;
  taxId: string;
}) {
  const config = getMoralisConfig();
  const requestKey = "0|";
  const payload = {
    [requestKey]: {
      action: "bmInsert",
      database: 1,
      functions_before: "MicFu_SifParRange",
      generator: "",
      primary_key: "SIF_PAR",
      query_params: [
        {
          function: "pkFu_Partneri",
          key: "SIF_PAR",
          type: "ftInteger",
          value_string: "0",
        },
        {
          key: "POR_TIP",
          type: "ftSmallint",
          value_string: "1",
        },
        {
          key: "NAZ_PAR",
          type: "ftString",
          value_string: input.companyName,
        },
        {
          key: "ADRESA",
          type: "ftString",
          value_string: input.address,
        },
        {
          key: "E_RACUN",
          type: "ftString",
          value_string: "N",
        },
        {
          key: "IND_BROJ",
          type: "ftString",
          value_string: input.taxId,
        },
        {
          key: "DATUM",
          type: "ftDate",
          value_string: input.createdOn,
        },
        {
          key: "SIF_PJ_RN",
          type: "ftInteger",
          value_string: "0",
        },
        {
          key: "AKTIVAN",
          type: "ftString",
          value_string: "D",
        },
        {
          key: "SAMO_UC",
          type: "ftString",
          value_string: "N",
        },
        {
          key: "TIP",
          type: "ftSmallint",
          value_string: "0",
        },
        {
          key: "RAB_KUP",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "RAB_KUP1",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "KRED_LIM",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "KRED_LIM_D",
          type: "ftFMTBcd",
          value_string: "0",
        },
        {
          key: "DVO_KUP",
          type: "ftSmallint",
          value_string: "0",
        },
        {
          key: "PREK_DVO",
          type: "ftInteger",
          value_string: "0",
        },
        {
          key: "ID_DJ",
          type: "ftInteger",
          value_string: String(config.partneriIDDJ),
        },
        {
          key: "BR_UGOV",
          type: "ftInteger",
          value_string: "0",
        },
      ],
      returning_key: "SIF_PAR,GRUPA",
      table: "PARTNERI",
    },
  };
  const response = await requestMoralisJSON<MoralisUpdateTablesResponse>({
    body: payload,
    url: config.updateTablesURL,
  });
  const record = getUpdateTablesRecord(response, requestKey);
  const sifPar = getInteger(record?.SIF_PAR);

  if (sifPar === null) {
    throw new Error("Moralis business customer creation did not return SIF_PAR.");
  }

  return {
    documentRef: {
      sifPar,
      sifPj: -1,
    } satisfies MoralisCustomerDocumentRef,
    raw: response,
  };
}

export async function createMoralisOrderHeader(input: {
  createdOn: {
    date: string;
    dateTime: string;
    year: number;
  };
  fiskalPaymentCode: string;
  sifPar: number;
  sifPj: number;
}) {
  const config = getMoralisConfig();
  const requestKey = "-1|";
  const salesUnitCode = config.salesUnitCode.trim().toUpperCase();
  const mlpvlp = salesUnitCode[0] ?? "M";
  const posJed = `${salesUnitCode}-${input.createdOn.year}`;
  const payload = {
    [requestKey]: {
      action: "bmInsert",
      database: 1,
      extra_param: {
        INT_BR: "-1",
        MLPVLP: mlpvlp,
        POS_JED: posJed,
        TECAJ: "1",
        VRSTA_DOK: config.documentType,
      },
      generator: "",
      primary_key: "INT_BR",
      query_params: [
        {
          key: "INT_BR",
          type: "ftInteger",
          value_string: "-1",
        },
        {
          key: "POS_JED",
          type: "ftString",
          value_string: posJed,
        },
        {
          key: "VRSTA_DOK",
          type: "ftString",
          value_string: config.documentType,
        },
        {
          key: "SIF_PAR",
          type: "ftInteger",
          value_string: String(input.sifPar),
        },
        {
          key: "SIF_PJ",
          type: "ftInteger",
          value_string: String(input.sifPj),
        },
        {
          key: "DAT_IZ",
          type: "ftDate",
          value_string: input.createdOn.date,
        },
        {
          key: "ROK_DOS",
          type: "ftSmallint",
          value_string: "0",
        },
        {
          key: "DAT_DOS",
          type: "ftDate",
          value_string: input.createdOn.date,
        },
        {
          key: "VRIJEME",
          type: "ftDateTime",
          value_string: input.createdOn.dateTime,
        },
        {
          key: "DAT_ISP",
          type: "ftDate",
          value_string: input.createdOn.date,
        },
        {
          key: "MT",
          type: "ftString",
          value_string: salesUnitCode,
        },
        {
          key: "ZATVORENO",
          type: "ftString",
          value_string: "N",
        },
        {
          key: "VALUTA",
          type: "ftString",
          value_string: config.currencyCode,
        },
        {
          key: "TECAJ",
          type: "ftFMTBcd",
          value_string: "1",
        },
        {
          key: "ID_DJ",
          type: "ftInteger",
          value_string: "-1",
        },
        {
          key: "ID_DJK",
          type: "ftInteger",
          value_string: "-1",
        },
        {
          key: "END_D",
          type: "ftSmallint",
          value_string: "-1",
        },
        {
          key: "FISK_PL",
          type: "ftString",
          value_string: input.fiskalPaymentCode,
        },
        {
          key: "FISKALNA_OZNAKA",
          type: "ftString",
          value_string: salesUnitCode,
        },
        {
          key: "ER_PROCES",
          type: "ftString",
          value_string: "",
        },
        {
          key: "ER_VATEX",
          type: "ftString",
          value_string: "",
        },
      ],
      returning_key: "INT_BR,BR_DOK,DOSAO_IZ,OTISAO_U,ID_TL",
      table: "IZLAZ0",
    },
  };
  const response = await requestMoralisJSON<MoralisUpdateTablesResponse>({
    body: payload,
    url: config.updateTablesURL,
  });
  const record = getUpdateTablesRecord(response, requestKey);
  const intBr = getInteger(record?.INT_BR);
  const brDok = typeof record?.BR_DOK === "string" ? record.BR_DOK.trim() : String(record?.BR_DOK ?? "").trim();

  if (intBr === null || !brDok) {
    throw new Error("Moralis order header creation did not return INT_BR and BR_DOK.");
  }

  return {
    documentRef: {
      brDok,
      intBr,
    } satisfies MoralisOrderDocumentRef,
    posJed,
    raw: response,
    salesUnitCode,
  };
}

export async function createMoralisOrderLines(input: {
  brDok: string;
  intBr: number;
  items: Array<{
    discountPercent: number;
    itemID: string;
    quantity: number;
    unitPrice: number;
  }>;
  posJed: string;
  salesUnitCode: string;
}) {
  const config = getMoralisConfig();
  const mlpvlp = input.salesUnitCode[0] ?? "M";
  const payload = Object.fromEntries(
    input.items.map((item, index) => {
      const recordKey = `-${index + 1}|`;
      const negativeID = String(-(index + 1));

      return [
        recordKey,
        {
          action: "bmInsert",
          database: 1,
          extra_param: {
            BR_DOK: input.brDok,
            INT_BR: String(input.intBr),
            MLPVLP: mlpvlp,
            POS_JED: input.posJed,
            SIF_ART: item.itemID,
            TECAJ: "1",
            VRSTA_DOK: config.documentType,
          },
          functions_after: "MicFu_Zalihe",
          generator: "",
          primary_key: "ID_REC",
          query_params: [
            {
              key: "SIF_ART",
              type: "ftString",
              value_string: item.itemID,
            },
            {
              key: "KOLICINA",
              type: "ftFMTBcd",
              value_string: formatMoralisNumber(item.quantity),
            },
            {
              key: "KOLICINA_S",
              type: "ftFMTBcd",
              value_string: "0",
            },
            {
              key: "CIJENA",
              type: "ftFMTBcd",
              value_string: formatMoralisNumber(item.unitPrice),
            },
            {
              key: "RAB",
              type: "ftFMTBcd",
              value_string: formatMoralisNumber(item.discountPercent),
            },
            {
              key: "RAB1",
              type: "ftFMTBcd",
              value_string: "0",
            },
            {
              key: "KOLICINA_I",
              type: "ftFMTBcd",
              value_string: "0",
            },
            {
              key: "U1_ID_REC",
              type: "ftInteger",
              value_string: "0",
            },
            {
              key: "INT_BR",
              type: "ftInteger",
              value_string: String(input.intBr),
            },
            {
              key: "ID_REC",
              type: "ftInteger",
              value_string: negativeID,
            },
          ],
          returning_key: "ID_REC,NABAVNA_CI",
          table: "IZLAZ1",
        },
      ];
    }),
  );
  const response = await requestMoralisJSON<MoralisUpdateTablesResponse>({
    body: {
      ...payload,
      functions_after_batch: "MicFu_KalkIzlaz",
    },
    url: config.updateTablesURL,
  });

  return {
    raw: response,
  };
}

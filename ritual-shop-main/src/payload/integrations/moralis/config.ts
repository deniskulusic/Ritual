const DEFAULT_HOST = "http://moralisst.ddns.net";
const DEFAULT_LOGIN_PORT = 8010;
const DEFAULT_API_PORT = 8002;
const DEFAULT_MASTER_PORT = 8000;
const DEFAULT_DATABASE_ID = "008";
const DEFAULT_SERVER_ID = "001";
const DEFAULT_USER_ROLES_GROUP = "fi";
const DEFAULT_LANG = "en";
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_TOKEN_CACHE_MS = 30 * 60 * 1000;
const DEFAULT_STOCK_LOCATION = "V01-2025";
const DEFAULT_DOCUMENT_TYPE = "PON";
const DEFAULT_SALES_UNIT_CODE = "M01";
const DEFAULT_PRIVATE_BUYER_PREFIX = "WEB-";
const DEFAULT_WEB_CUSTOMER_PARTNER_ID = 11410;
const DEFAULT_PART_PJ_ID_DJ = 23;
const DEFAULT_PARTNERI_ID_DJ = 0;

const readEnvNumber = (name: string, fallback: number) => {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const readEnvString = (name: string, fallback?: string) => {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  return fallback;
};

export type MoralisConfig = {
  apiURL: string;
  currencyCode: string;
  databaseID: string;
  documentType: string;
  lang: string;
  loginURL: string;
  pageSize: number;
  partPjIDDJ: number;
  partPjLookupURL: string;
  password: string;
  partneriIDDJ: number;
  partneriLookupURL: string;
  privateBuyerPrefix: string;
  serverID: string;
  salesUnitCode: string;
  stockLocationCode: string;
  tokenCacheMs: number;
  updateTablesURL: string;
  userRolesGroup: string;
  webCustomerPartnerID: number;
  username: string;
};

export const getMoralisConfig = (): MoralisConfig => {
  const username = readEnvString("MORALIS_API_USER");
  const password =
    readEnvString("MORALIS_API_PASSWORD") ?? readEnvString("MORALIS_API_PASS");

  if (!username || !password) {
    throw new Error(
      "Moralis credentials are missing. Set MORALIS_API_USER and MORALIS_API_PASSWORD.",
    );
  }

  const baseURL = readEnvString("MORALIS_API_BASE_URL", DEFAULT_HOST)!;
  const loginPort = readEnvNumber("MORALIS_API_LOGIN_PORT", DEFAULT_LOGIN_PORT);
  const apiPort = readEnvNumber("MORALIS_API_OTHER_PORT", DEFAULT_API_PORT);
  const masterPort = readEnvNumber("MORALIS_API_MASTER_PORT", DEFAULT_MASTER_PORT);

  return {
    apiURL: `${baseURL}:${apiPort}/kisapi/sifranti/Artikli/GetArtikli`,
    currencyCode: readEnvString("MORALIS_API_CURRENCY_CODE", "EUR")!,
    databaseID: readEnvString("MORALIS_API_DATABASE_ID", DEFAULT_DATABASE_ID)!,
    documentType: readEnvString("MORALIS_API_DOCUMENT_TYPE", DEFAULT_DOCUMENT_TYPE)!,
    lang: readEnvString("MORALIS_API_LANG", DEFAULT_LANG)!,
    loginURL: `${baseURL}:${loginPort}/kisapi/master/auth/Login`,
    pageSize: readEnvNumber("MORALIS_API_PAGE_SIZE", DEFAULT_PAGE_SIZE),
    partPjIDDJ: readEnvNumber("MORALIS_API_PART_PJ_ID_DJ", DEFAULT_PART_PJ_ID_DJ),
    partPjLookupURL:
      readEnvString("MORALIS_API_PART_PJ_URL") ??
      `${baseURL}:${apiPort}/kisapi/sifranti/PartPj/GetPartPj`,
    password,
    partneriIDDJ: readEnvNumber("MORALIS_API_PARTNERI_ID_DJ", DEFAULT_PARTNERI_ID_DJ),
    partneriLookupURL:
      readEnvString("MORALIS_API_PARTNERI_URL") ??
      `${baseURL}:${apiPort}/kisapi/sifranti/Partneri/GetPartneri`,
    privateBuyerPrefix: readEnvString(
      "MORALIS_API_PRIVATE_BUYER_PREFIX",
      DEFAULT_PRIVATE_BUYER_PREFIX,
    )!,
    serverID: readEnvString("MORALIS_API_SERVER_ID", DEFAULT_SERVER_ID)!,
    salesUnitCode: readEnvString("MORALIS_API_SALES_UNIT_CODE", DEFAULT_SALES_UNIT_CODE)!,
    stockLocationCode: readEnvString(
      "MORALIS_API_STOCK_LOCATION",
      DEFAULT_STOCK_LOCATION,
    )!,
    tokenCacheMs: readEnvNumber(
      "MORALIS_API_TOKEN_CACHE_MS",
      DEFAULT_TOKEN_CACHE_MS,
    ),
    updateTablesURL:
      readEnvString("MORALIS_API_UPDATE_TABLES_URL") ??
      `${baseURL}:${masterPort}/kisapi/master/methods/UpdateTables`,
    userRolesGroup: readEnvString(
      "MORALIS_API_USER_ROLES_GROUP",
      DEFAULT_USER_ROLES_GROUP,
    )!,
    webCustomerPartnerID: readEnvNumber(
      "MORALIS_API_WEB_CUSTOMER_PARTNER_ID",
      DEFAULT_WEB_CUSTOMER_PARTNER_ID,
    ),
    username,
  };
};

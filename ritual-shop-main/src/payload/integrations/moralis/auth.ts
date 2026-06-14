import { getMoralisConfig } from "./config";
import type { MoralisLoginResponse } from "./types";

type MoralisTokenCache = {
  expiresAt: number;
  token: string;
};

let tokenCache: MoralisTokenCache | null = null;

const parseJSON = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Moralis returned invalid JSON: ${text.slice(0, 200)}`);
  }
};

export const resetMoralisMasterToken = () => {
  tokenCache = null;
};

export const loginToMoralis = async () => {
  const config = getMoralisConfig();
  const credentials = Buffer.from(
    `${config.username}:${config.password}`,
    "utf8",
  ).toString("base64");

  const response = await fetch(config.loginURL, {
    body: JSON.stringify({
      database_id: config.databaseID,
      lang: config.lang,
      server_id: config.serverID,
      user_roles: true,
      user_roles_group: config.userRolesGroup,
    }),
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Moralis login failed with status ${response.status}.`);
  }

  const data = await parseJSON<MoralisLoginResponse>(response);
  const token = data.result?.master_token?.trim();

  if (!token) {
    throw new Error("Moralis login succeeded but did not return a master token.");
  }

  tokenCache = {
    expiresAt: Date.now() + config.tokenCacheMs,
    token,
  };

  return token;
};

export const getMoralisMasterToken = async ({
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
} = {}) => {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  return loginToMoralis();
};

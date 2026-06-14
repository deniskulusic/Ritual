import type { MoralisSyncStatus } from "../../shared/moralis";
import type { MoralisProduct } from "./types";

const normalizeString = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = Number(trimmed.replace(",", "."));

  return Number.isFinite(normalized) ? normalized : null;
};

const extractBarcode = (value: unknown) => {
  const raw = normalizeString(value);

  if (!raw) {
    return null;
  }

  const lines = raw.split(/\r\n|\r|\n/);

  for (const line of lines) {
    const tokens = line.split(/[\u000f\s]+/);

    for (const token of tokens) {
      if (/^\d{8,14}$/.test(token)) {
        return token;
      }
    }
  }

  return null;
};

export type MoralisOperationalSnapshot = {
  barcode: string | null;
  isAvailable: boolean;
  itemID: string;
  lastSyncError: null;
  lastSyncedAt: string;
  lastSyncStatus: MoralisSyncStatus;
  price: number | null;
  rawOperationalData: MoralisProduct;
  sku: string;
  stockQuantity: number | null;
  taxRate: number | null;
  unit: string | null;
};

export const mapMoralisProductToOperationalSnapshot = (
  product: MoralisProduct,
): MoralisOperationalSnapshot => {
  const itemID = normalizeString(product.SIF_ART);

  if (!itemID) {
    throw new Error("Moralis product is missing SIF_ART.");
  }

  const stockQuantity = normalizeNumber(product.KOLICINA);

  return {
    barcode: extractBarcode(product.BAR_KOD),
    isAvailable: (stockQuantity ?? 0) > 0,
    itemID,
    lastSyncError: null,
    lastSyncedAt: new Date().toISOString(),
    lastSyncStatus: "succeeded",
    price: normalizeNumber(product.VPC),
    rawOperationalData: product,
    sku: itemID,
    stockQuantity,
    taxRate: normalizeNumber(product.P_D_V),
    unit: normalizeString(product.J_M),
  };
};

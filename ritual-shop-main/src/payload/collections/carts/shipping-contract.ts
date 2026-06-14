export type ShippingProvider = "box-now" | "gls";

export type ShippingMethodId = "box-now-locker" | "gls-home";

export type ShippingMethodKind = "home" | "locker";

export type ShippingPickupPoint = {
  addressLine1: string;
  city: string;
  country: string;
  externalId?: null | string;
  id: string;
  latitude?: null | number;
  longitude?: null | number;
  name: string;
  postalCode: string;
  raw?: null | Record<string, unknown>;
  size?: null | string;
  type?: null | string;
};

export type BoxNowWidgetConfig = {
  partnerId: null | string;
  widgetScriptUrl: null | string;
};

export type ShippingMethodDefinition = {
  available: boolean;
  checkoutOnly: boolean;
  description: string;
  disabledLabel: string;
  id: ShippingMethodId;
  kind: ShippingMethodKind;
  label: string;
  priceValue: number;
  provider: ShippingProvider;
  requiresPickupPoint: boolean;
};

export const freeShippingThreshold = 100;

export const defaultShippingMethodId: ShippingMethodId = "gls-home";

export const fallbackShippingMethods: ShippingMethodDefinition[] = [
  {
    available: true,
    checkoutOnly: false,
    description: "Dostava na kućnu ili poslovnu adresu putem GLS kurirske službe.",
    disabledLabel: "Trenutno nedostupno",
    id: "gls-home",
    kind: "home",
    label: "GLS dostava na adresu",
    priceValue: 8.9,
    provider: "gls",
    requiresPickupPoint: false,
  },
  {
    available: true,
    checkoutOnly: true,
    description: "Preuzimanje narudžbe u BOX NOW paketomatu po vašem izboru.",
    disabledLabel: "Trenutno nedostupno",
    id: "box-now-locker",
    kind: "locker",
    label: "BOX NOW paketomat",
    priceValue: 4.5,
    provider: "box-now",
    requiresPickupPoint: true,
  },
];

export const fallbackBoxNowPickupPoints: ShippingPickupPoint[] = [
  {
    addressLine1: "Avenija Dubrovnik 16",
    city: "Zagreb",
    country: "Croatia",
    id: "box-now-zagreb-arena",
    latitude: 45.7711,
    longitude: 15.9443,
    name: "BOX NOW Arena Centar",
    postalCode: "10020",
    raw: {
      city: "Zagreb",
      code: "ZG-ARENA",
    },
    size: "M",
    type: "locker",
  },
  {
    addressLine1: "Ul. Josipa Jovića 93",
    city: "Split",
    country: "Croatia",
    id: "box-now-split-mall",
    latitude: 43.5167,
    longitude: 16.4906,
    name: "BOX NOW Mall of Split",
    postalCode: "21000",
    raw: {
      city: "Split",
      code: "ST-MALL",
    },
    size: "M",
    type: "locker",
  },
  {
    addressLine1: "Ul. Vjekoslava Dukića 14",
    city: "Rijeka",
    country: "Croatia",
    id: "box-now-rijeka-west",
    latitude: 45.3342,
    longitude: 14.4149,
    name: "BOX NOW ZTC Rijeka",
    postalCode: "51000",
    raw: {
      city: "Rijeka",
      code: "RI-ZTC",
    },
    size: "M",
    type: "locker",
  },
];

const euroIntegerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const euroOneDecimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const euroTwoDecimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatEuro(value: number) {
  if (value === 0) {
    return "Besplatno";
  }

  const normalized = Number(value.toFixed(2));
  const formatter = Number.isInteger(normalized)
    ? euroIntegerFormatter
    : Number.isInteger(normalized * 10)
      ? euroOneDecimalFormatter
      : euroTwoDecimalFormatter;

  return `${formatter.format(normalized)}\u00A0EUR`;
}

export function getFreeShippingProgress(subtotal: number) {
  const sanitizedSubtotal = Math.max(0, subtotal);
  const remaining = Math.max(0, Number((freeShippingThreshold - sanitizedSubtotal).toFixed(2)));
  const progress = Math.min(1, sanitizedSubtotal / freeShippingThreshold);

  return {
    isUnlocked: remaining <= 0,
    progress,
    progressPercent: Math.round(progress * 100),
    remaining,
    remainingLabel: formatEuro(remaining),
    threshold: freeShippingThreshold,
    thresholdLabel: formatEuro(freeShippingThreshold),
  };
}

export function getShippingMethodById(methodId: string | null | undefined) {
  return fallbackShippingMethods.find((method) => method.id === methodId) ?? fallbackShippingMethods[0];
}

export function isLockerShippingMethod(methodId: string | null | undefined) {
  return getShippingMethodById(methodId).kind === "locker";
}

export function normalizePickupPoint(input: unknown): null | ShippingPickupPoint {
  if (!input || typeof input !== "object") {
    return null;
  }

  const maybePickupPoint = input as Record<string, unknown>;
  const id = typeof maybePickupPoint.id === "string" ? maybePickupPoint.id.trim() : "";
  const name = typeof maybePickupPoint.name === "string" ? maybePickupPoint.name.trim() : "";
  const addressLine1 =
    typeof maybePickupPoint.addressLine1 === "string" ? maybePickupPoint.addressLine1.trim() : "";
  const city = typeof maybePickupPoint.city === "string" ? maybePickupPoint.city.trim() : "";
  const postalCode =
    typeof maybePickupPoint.postalCode === "string" ? maybePickupPoint.postalCode.trim() : "";
  const country = typeof maybePickupPoint.country === "string" ? maybePickupPoint.country.trim() : "";

  if (!id || !name || !addressLine1 || !city || !postalCode || !country) {
    return null;
  }

  const latitude = typeof maybePickupPoint.latitude === "number" ? maybePickupPoint.latitude : null;
  const longitude = typeof maybePickupPoint.longitude === "number" ? maybePickupPoint.longitude : null;

  return {
    addressLine1,
    city,
    country,
    externalId:
      typeof maybePickupPoint.externalId === "string" && maybePickupPoint.externalId.trim().length > 0
        ? maybePickupPoint.externalId.trim()
        : null,
    id,
    latitude,
    longitude,
    name,
    postalCode,
    raw:
      maybePickupPoint.raw && typeof maybePickupPoint.raw === "object"
        ? (maybePickupPoint.raw as Record<string, unknown>)
        : null,
    size:
      typeof maybePickupPoint.size === "string" && maybePickupPoint.size.trim().length > 0
        ? maybePickupPoint.size.trim()
        : null,
    type:
      typeof maybePickupPoint.type === "string" && maybePickupPoint.type.trim().length > 0
        ? maybePickupPoint.type.trim()
        : null,
  };
}

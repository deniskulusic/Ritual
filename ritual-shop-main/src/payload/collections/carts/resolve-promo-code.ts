import type { PayloadRequest, Where } from "payload";

import type { Product, PromoCode } from "../../../../payload-types";
import { getLocalizedText } from "../../shared/admin-copy";
import type { CartQuote } from "./quote-cart";
import {
  type AppliedPromotion,
  normalizePromoCodeInput,
} from "./promo-contract";
import { formatEuro } from "./shipping-contract";

type PromotionResolution = {
  appliedPromotion: AppliedPromotion | null;
  discountTotal: number;
  error: null | string;
  lineDiscounts: Record<string, number>;
  normalizedCode: null | string;
};

function getRelationIDs(value: unknown): Array<number | string> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return entry;
      }

      if (entry && typeof entry === "object" && "id" in entry) {
        const id = entry.id;

        return typeof id === "string" || typeof id === "number" ? id : null;
      }

      return null;
    })
    .filter((entry): entry is number | string => entry !== null);
}

function getRelationID(value: unknown): number | string | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = value.id;

    return typeof id === "string" || typeof id === "number" ? id : null;
  }

  return null;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function floorCurrency(value: number) {
  return Math.floor((value + Number.EPSILON) * 100) / 100;
}

function getScopeLabel(
  req: PayloadRequest,
  scope: "brand" | "cart" | "category",
) {
  return getLocalizedText({
    en:
      scope === "cart"
        ? "Whole cart"
        : scope === "brand"
          ? "Selected brands"
          : "Selected categories",
    hr:
      scope === "cart"
        ? "Cijela košarica"
        : scope === "brand"
          ? "Odabrani brendovi"
          : "Odabrane kategorije",
    req,
  });
}

function getEligibleSubtotal(args: {
  items: CartQuote["items"];
  productsBySlug: Map<string, Product>;
  promoCode: PromoCode;
}) {
  const { items, productsBySlug, promoCode } = args;
  const scope = promoCode.application?.scope;

  if (scope === "cart") {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  if (scope === "brand") {
    const targetIDs = new Set(getRelationIDs(promoCode.application?.brands));

    return items.reduce((sum, item) => {
      const brandID = getRelationID(productsBySlug.get(item.productSlug)?.brand);

      return brandID !== null && targetIDs.has(brandID) ? sum + item.lineTotal : sum;
    }, 0);
  }

  const targetIDs = new Set(getRelationIDs(promoCode.application?.categories));

  return items.reduce((sum, item) => {
    const productCategoryIDs = getRelationIDs(productsBySlug.get(item.productSlug)?.categories);

    return productCategoryIDs.some((categoryID) => targetIDs.has(categoryID))
      ? sum + item.lineTotal
      : sum;
  }, 0);
}

function isItemEligible(args: {
  item: CartQuote["items"][number];
  productsBySlug: Map<string, Product>;
  promoCode: PromoCode;
}) {
  const { item, productsBySlug, promoCode } = args;
  const scope = promoCode.application?.scope;

  if (scope === "cart") {
    return true;
  }

  if (scope === "brand") {
    const targetIDs = new Set(getRelationIDs(promoCode.application?.brands));
    const brandID = getRelationID(productsBySlug.get(item.productSlug)?.brand);

    return brandID !== null && targetIDs.has(brandID);
  }

  const targetIDs = new Set(getRelationIDs(promoCode.application?.categories));
  const productCategoryIDs = getRelationIDs(productsBySlug.get(item.productSlug)?.categories);

  return productCategoryIDs.some((categoryID) => targetIDs.has(categoryID));
}

function allocateLineDiscounts(args: {
  discountTotal: number;
  items: CartQuote["items"];
  productsBySlug: Map<string, Product>;
  promoCode: PromoCode;
}) {
  const { discountTotal, items, productsBySlug, promoCode } = args;
  const lineDiscounts = Object.fromEntries(items.map((item) => [item.productSlug, 0]));
  const eligibleItems = items.filter((item) =>
    isItemEligible({
      item,
      productsBySlug,
      promoCode,
    }),
  );

  if (eligibleItems.length === 0 || discountTotal <= 0) {
    return lineDiscounts;
  }

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.lineTotal, 0);

  if (eligibleSubtotal <= 0) {
    return lineDiscounts;
  }

  const allocations = eligibleItems.map((item) => {
    const exactShare = (discountTotal * item.lineTotal) / eligibleSubtotal;
    const baseShare = floorCurrency(exactShare);

    return {
      baseShare,
      exactShare,
      productSlug: item.productSlug,
    };
  });
  const allocatedBaseTotal = allocations.reduce((sum, item) => sum + item.baseShare, 0);
  let centsRemaining = Math.max(
    0,
    Math.round((roundCurrency(discountTotal) - roundCurrency(allocatedBaseTotal)) * 100),
  );

  allocations.sort((left, right) => {
    const remainderDiff = right.exactShare - right.baseShare - (left.exactShare - left.baseShare);

    if (Math.abs(remainderDiff) > Number.EPSILON) {
      return remainderDiff > 0 ? 1 : -1;
    }

    return left.productSlug.localeCompare(right.productSlug);
  });

  for (const allocation of allocations) {
    let nextDiscount = allocation.baseShare;

    if (centsRemaining > 0) {
      nextDiscount = roundCurrency(nextDiscount + 0.01);
      centsRemaining -= 1;
    }

    lineDiscounts[allocation.productSlug] = nextDiscount;
  }

  return lineDiscounts;
}

async function findPromoCode(req: PayloadRequest, code: string) {
  const result = await req.payload.find({
    collection: "promo-codes",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      code: {
        equals: code,
      },
    },
  });

  return (result.docs[0] as PromoCode | undefined) ?? null;
}

async function countOrdersWithPromoCode(args: {
  code: string;
  customerID?: number | string;
  req: PayloadRequest;
}) {
  const { code, customerID, req } = args;
  const conditions: Where[] = [
    {
      "promotion.code": {
        equals: code,
      },
    },
  ];

  if (customerID !== undefined) {
    conditions.push({
      customer: {
        equals: customerID,
      },
    });
  }

  const result = await req.payload.find({
    collection: "orders",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: conditions,
    },
  });

  return result.totalDocs;
}

async function countCustomerOrders(req: PayloadRequest, customerID: number | string) {
  const result = await req.payload.find({
    collection: "orders",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      customer: {
        equals: customerID,
      },
    },
  });

  return result.totalDocs;
}

function getDiscountValue(promoCode: PromoCode) {
  if (promoCode.application?.discountType === "percent") {
    return Number(promoCode.application.percentOff ?? 0);
  }

  return Number(promoCode.application?.amountOff ?? 0);
}

function getPromoError(req: PayloadRequest, en: string, hr: string) {
  return getLocalizedText({
    en,
    hr,
    req,
  });
}

export async function resolvePromoCode(args: {
  items: CartQuote["items"];
  productsBySlug: Map<string, Product>;
  promoCodeInput: null | string;
  req: PayloadRequest;
  subtotal: number;
}): Promise<PromotionResolution> {
  const { items, productsBySlug, promoCodeInput, req, subtotal } = args;
  const normalizedCode = normalizePromoCodeInput(promoCodeInput);

  if (!normalizedCode) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: null,
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  if (req.user?.collection !== "customers" || !req.user.id) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        "Promo codes are available only to signed-in customers.",
        "Promo kodovi dostupni su samo prijavljenim kupcima.",
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  const promoCode = await findPromoCode(req, normalizedCode);

  if (!promoCode || promoCode.status !== "active") {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        "This promo code is not valid.",
        "Promo kod nije valjan.",
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  const now = Date.now();
  const startsAt = promoCode.schedule?.startsAt ? Date.parse(promoCode.schedule.startsAt) : null;
  const endsAt = promoCode.schedule?.endsAt ? Date.parse(promoCode.schedule.endsAt) : null;

  if (startsAt !== null && Number.isFinite(startsAt) && startsAt > now) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        "This promo code is not active yet.",
        "Promo kod još nije aktivan.",
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  if (endsAt !== null && Number.isFinite(endsAt) && endsAt < now) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        "This promo code has expired.",
        "Promo kod je istekao.",
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  const minimumSubtotal = Number(promoCode.application?.minimumSubtotal ?? 0);

  if (minimumSubtotal > 0 && subtotal < minimumSubtotal) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        `This promo code requires a cart subtotal of at least ${formatEuro(minimumSubtotal)}.`,
        `Za ovaj promo kod potreban je međuzbroj od najmanje ${formatEuro(minimumSubtotal)}.`,
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  const customerID = req.user.id;

  if (promoCode.application?.firstOrderOnly === "yes") {
    const customerOrderCount = await countCustomerOrders(req, customerID);

    if (customerOrderCount > 0) {
      return {
        appliedPromotion: null,
        discountTotal: 0,
        error: getPromoError(
          req,
          "This promo code is available only on the first order.",
          "Promo kod vrijedi samo za prvu narudžbu.",
        ),
        lineDiscounts: {},
        normalizedCode: null,
      };
    }
  }

  if (
    typeof promoCode.limits?.maxUsesPerCustomer === "number" &&
    promoCode.limits.maxUsesPerCustomer > 0
  ) {
    const customerUsageCount = await countOrdersWithPromoCode({
      code: normalizedCode,
      customerID,
      req,
    });

    if (customerUsageCount >= promoCode.limits.maxUsesPerCustomer) {
      return {
        appliedPromotion: null,
        discountTotal: 0,
        error: getPromoError(
          req,
          "This promo code has already been used on your account.",
          "Promo kod je već iskorišten na vašem računu.",
        ),
        lineDiscounts: {},
        normalizedCode: null,
      };
    }
  }

  if (typeof promoCode.limits?.maxUsesTotal === "number" && promoCode.limits.maxUsesTotal > 0) {
    const totalUsageCount = await countOrdersWithPromoCode({
      code: normalizedCode,
      req,
    });

    if (totalUsageCount >= promoCode.limits.maxUsesTotal) {
      return {
        appliedPromotion: null,
        discountTotal: 0,
        error: getPromoError(
          req,
          "This promo code has reached its usage limit.",
          "Promo kod je dosegao maksimalan broj korištenja.",
        ),
        lineDiscounts: {},
        normalizedCode: null,
      };
    }
  }

  if (items.length === 0) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: null,
      lineDiscounts: {},
      normalizedCode,
    };
  }

  const eligibleSubtotal = roundCurrency(
    getEligibleSubtotal({
      items,
      productsBySlug,
      promoCode,
    }),
  );

  if (eligibleSubtotal <= 0) {
    return {
      appliedPromotion: null,
      discountTotal: 0,
      error: getPromoError(
        req,
        "This promo code does not apply to the selected products.",
        "Promo kod nije primjenjiv na odabrane proizvode.",
      ),
      lineDiscounts: {},
      normalizedCode: null,
    };
  }

  const rawDiscount =
    promoCode.application?.discountType === "percent"
      ? (eligibleSubtotal * Number(promoCode.application.percentOff ?? 0)) / 100
      : Number(promoCode.application?.amountOff ?? 0);
  const discountTotal = roundCurrency(Math.max(0, Math.min(rawDiscount, eligibleSubtotal)));
  const scope = promoCode.application?.scope ?? "cart";
  const discountType = promoCode.application?.discountType ?? "percent";
  const lineDiscounts = allocateLineDiscounts({
    discountTotal,
    items,
    productsBySlug,
    promoCode,
  });

  return {
    appliedPromotion: {
      code: normalizedCode,
      description: typeof promoCode.description === "string" ? promoCode.description : null,
      discountLabel: formatEuro(discountTotal),
      discountType,
      discountValue: getDiscountValue(promoCode),
      eligibleSubtotal,
      eligibleSubtotalLabel: formatEuro(eligibleSubtotal),
      name: promoCode.name,
      scope,
      scopeLabel: getScopeLabel(req, scope),
    },
    discountTotal,
    error: null,
    lineDiscounts,
    normalizedCode,
  };
}

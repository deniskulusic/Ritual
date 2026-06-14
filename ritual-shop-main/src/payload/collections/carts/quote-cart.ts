import type { PayloadRequest } from "payload";

import type { Product } from "../../../../payload-types";
import {
  normalizePromoCodeInput,
  type AppliedPromotion,
} from "./promo-contract";
import {
  type BoxNowWidgetConfig,
  formatEuro,
  normalizePickupPoint,
  type ShippingPickupPoint,
} from "./shipping-contract";
import type { CartInput, CartInputItem } from "./contracts";
import { resolvePromoCode } from "./resolve-promo-code";
import { resolveBoxNowWidgetConfig, resolveCartShippingOptions } from "./shipping-options";

type QuoteAdjustmentType = "quantity-adjusted" | "removed" | "unavailable";

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type CartQuote = {
  adjustments: Array<{
    message: string;
    productSlug: string;
    type: QuoteAdjustmentType;
  }>;
  boxNowWidgetConfig: BoxNowWidgetConfig | null;
  items: Array<{
    discountPercent: number;
    discountTotal: number;
    finalLineTotal: number;
    image: null | string;
    lineTotal: number;
    maxQuantity: null | number;
    priceLabel: string;
    productId: number;
    productSlug: string;
    quantity: number;
    title: string;
    totalLabel: string;
    unitPrice: number;
  }>;
  localCart: {
    items: CartInputItem[];
    promoCode: null | string;
    shippingOptionId: null | string;
    shippingPickupPoint: null | ShippingPickupPoint;
  };
  promoCodeError: null | string;
  promotion: AppliedPromotion | null;
  selectedShippingOptionId: null | string;
  shippingOptions: Array<{
    available: boolean;
    checkoutOnly: boolean;
    description: string;
    disabledLabel: string;
    id: string;
    kind: "home" | "locker";
    label: string;
    priceLabel: string;
    priceValue: number;
    provider: string;
    requiresPickupPoint: boolean;
    selected: boolean;
  }>;
  totals: {
    discount: number;
    discountLabel: string;
    grandTotal: number;
    grandTotalLabel: string;
    shipping: number;
    shippingLabel: string;
    subtotal: number;
    subtotalLabel: string;
  };
};

const maxCartQuantityPerLine = 12;

function getProductImage(product: Product) {
  if (!product.heroImage || typeof product.heroImage !== "object") {
    return null;
  }

  return typeof product.heroImage.url === "string" ? product.heroImage.url : null;
}

function normalizeCartInput(input: CartInput, shippingOptions: Awaited<ReturnType<typeof resolveCartShippingOptions>>) {
  const itemMap = new Map<string, number>();

  for (const item of input.items ?? []) {
    const productSlug = typeof item.productSlug === "string" ? item.productSlug.trim() : "";
    const quantity = Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0;

    if (!productSlug || quantity <= 0) {
      continue;
    }

    itemMap.set(
      productSlug,
      Math.min(maxCartQuantityPerLine, (itemMap.get(productSlug) ?? 0) + quantity),
    );
  }

  const selectedShippingOption =
    shippingOptions.find((option) => option.id === input.shippingOptionId && option.available) ?? null;
  const shippingPickupPoint =
    selectedShippingOption?.requiresPickupPoint ? normalizePickupPoint(input.shippingPickupPoint) : null;

  return {
    items: Array.from(itemMap.entries()).map(([productSlug, quantity]) => ({
      productSlug,
      quantity,
    })),
    promoCode: normalizePromoCodeInput(input.promoCode),
    shippingOptionId: selectedShippingOption?.id ?? null,
    shippingPickupPoint,
  };
}

async function getProductsBySlug(req: PayloadRequest, slugs: string[]) {
  if (slugs.length === 0) {
    return [];
  }

  const result = await req.payload.find({
    collection: "products",
    depth: 1,
    limit: slugs.length,
    pagination: false,
    req,
    where: {
      and: [
        {
          slug: {
            in: slugs,
          },
        },
        {
          status: {
            equals: "active",
          },
        },
      ],
    },
  });

  return result.docs as Product[];
}

export async function quoteCart(req: PayloadRequest, input: CartInput): Promise<CartQuote> {
  const shippingOptions = await resolveCartShippingOptions(req);
  const boxNowWidgetConfig = await resolveBoxNowWidgetConfig(req);
  const normalizedInput = normalizeCartInput(input, shippingOptions);
  const products = await getProductsBySlug(
    req,
    normalizedInput.items.map((item) => item.productSlug),
  );
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const adjustments: CartQuote["adjustments"] = [];
  const items: CartQuote["items"] = [];

  for (const item of normalizedInput.items) {
    const product = productsBySlug.get(item.productSlug);

    if (!product) {
      adjustments.push({
        message: "Proizvod više nije dostupan u ponudi.",
        productSlug: item.productSlug,
        type: "removed",
      });
      continue;
    }

    const unitPrice = Number(product.moralis?.price ?? 0);
    const stockQuantity = Number(product.moralis?.stockQuantity ?? 0);
    const isAvailable = !!product.moralis?.isAvailable && unitPrice > 0;

    if (!isAvailable || stockQuantity <= 0) {
      adjustments.push({
        message: "Proizvod trenutno nije dostupan.",
        productSlug: item.productSlug,
        type: "unavailable",
      });
      continue;
    }

    const maxQuantity = Math.min(stockQuantity, maxCartQuantityPerLine);
    const quantity = Math.max(1, Math.min(item.quantity, maxQuantity));

    if (quantity !== item.quantity) {
      adjustments.push({
        message: `Količina je prilagođena na ${quantity}.`,
        productSlug: item.productSlug,
        type: "quantity-adjusted",
      });
    }

    const lineTotal = unitPrice * quantity;

    items.push({
      discountPercent: 0,
      discountTotal: 0,
      finalLineTotal: lineTotal,
      image: getProductImage(product),
      lineTotal,
      maxQuantity,
      priceLabel: formatEuro(unitPrice),
      productId: product.id,
      productSlug: product.slug,
      quantity,
      title: product.title,
      totalLabel: formatEuro(lineTotal),
      unitPrice,
    });
  }

  const selectedShipping =
    shippingOptions.find((option) => option.id === normalizedInput.shippingOptionId) ?? null;
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const promotionResult = await resolvePromoCode({
    items,
    productsBySlug,
    promoCodeInput: normalizedInput.promoCode,
    req,
    subtotal,
  });
  const discountedItems = items.map((item) => {
    const discountTotal = roundCurrency(promotionResult.lineDiscounts[item.productSlug] ?? 0);
    const finalLineTotal = roundCurrency(Math.max(0, item.lineTotal - discountTotal));

    return {
      ...item,
      discountPercent:
        item.lineTotal > 0 ? roundCurrency((discountTotal / item.lineTotal) * 100) : 0,
      discountTotal,
      finalLineTotal,
    };
  });
  const discount = promotionResult.discountTotal;
  const shipping = discountedItems.length === 0 || !selectedShipping ? 0 : selectedShipping.priceValue;
  const grandTotal = subtotal - discount + shipping;

  return {
    adjustments,
    boxNowWidgetConfig,
    items: discountedItems,
    localCart: {
      items: discountedItems.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
      })),
      promoCode: promotionResult.normalizedCode,
      shippingOptionId: selectedShipping?.id ?? null,
      shippingPickupPoint:
        selectedShipping?.requiresPickupPoint ? normalizedInput.shippingPickupPoint : null,
    },
    promoCodeError: promotionResult.error,
    promotion: promotionResult.appliedPromotion,
    selectedShippingOptionId: selectedShipping?.id ?? null,
    shippingOptions: shippingOptions.map((option) => ({
      available: option.available,
      checkoutOnly: option.checkoutOnly,
      description: option.description,
      disabledLabel: option.disabledLabel,
      id: option.id,
      kind: option.kind,
      label: option.label,
      priceLabel: option.priceLabel,
      priceValue: option.priceValue,
      provider: option.provider,
      requiresPickupPoint: option.requiresPickupPoint,
      selected: option.id === selectedShipping?.id,
    })),
    totals: {
      discount,
      discountLabel: formatEuro(discount),
      grandTotal,
      grandTotalLabel: formatEuro(grandTotal),
      shipping,
      shippingLabel: formatEuro(shipping),
      subtotal,
      subtotalLabel: formatEuro(subtotal),
    },
  };
}

export async function readCartInput(req: PayloadRequest): Promise<CartInput> {
  try {
    const body =
      typeof req.json === "function"
        ? ((await req.json()) as CartInput)
        : ((req.data ?? {}) as CartInput);

    return {
      items: Array.isArray(body?.items) ? body.items : [],
      promoCode: normalizePromoCodeInput(body?.promoCode),
      shippingOptionId: typeof body?.shippingOptionId === "string" ? body.shippingOptionId : null,
      shippingPickupPoint: normalizePickupPoint(body?.shippingPickupPoint),
    };
  } catch {
    return {
      items: [],
      promoCode: null,
      shippingOptionId: null,
      shippingPickupPoint: null,
    };
  }
}

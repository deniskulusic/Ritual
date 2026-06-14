export type PromoCodeDiscountType = "fixed" | "percent";

export type PromoCodeScope = "brand" | "cart" | "category";

export type AppliedPromotion = {
  code: string;
  description: null | string;
  discountLabel: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  eligibleSubtotal: number;
  eligibleSubtotalLabel: string;
  name: string;
  scope: PromoCodeScope;
  scopeLabel: string;
};

export function normalizePromoCodeInput(value: unknown): null | string {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  return normalized.length > 0 ? normalized : null;
}

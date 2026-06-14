import type { PayloadRequest } from "payload";

import type { SiteSetting } from "../../../../payload-types";
import {
  type BoxNowWidgetConfig,
  defaultShippingMethodId,
  fallbackShippingMethods,
  formatEuro,
  type ShippingMethodDefinition,
} from "./shipping-contract";

export type CartShippingOption = ShippingMethodDefinition & {
  priceLabel: string;
};

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasGlsRuntimeConfig(siteSettings: null | SiteSetting) {
  return !!(
    hasText(siteSettings?.gls?.apiBaseUrl) &&
    hasText(siteSettings?.gls?.username) &&
    hasText(siteSettings?.gls?.password) &&
    hasText(siteSettings?.gls?.clientNumber)
  );
}

function hasBoxNowWidgetConfig(siteSettings: null | SiteSetting) {
  return !!(
    hasText(siteSettings?.boxNow?.partnerId) &&
    hasText(siteSettings?.boxNow?.widgetScriptUrl)
  );
}

function hasBoxNowRuntimeConfig(siteSettings: null | SiteSetting) {
  return !!(
    hasText(siteSettings?.boxNow?.apiBaseUrl) &&
    hasText(siteSettings?.boxNow?.clientId) &&
    hasText(siteSettings?.boxNow?.clientSecret) &&
    hasText(siteSettings?.boxNow?.originId) &&
    hasText(siteSettings?.boxNow?.typeOfService) &&
    hasBoxNowWidgetConfig(siteSettings)
  );
}

function withPriceLabel(option: ShippingMethodDefinition): CartShippingOption {
  return {
    ...option,
    priceLabel: formatEuro(option.priceValue),
  };
}

function readSiteSettingsOption(
  siteSettings: null | SiteSetting,
  option: ShippingMethodDefinition,
): ShippingMethodDefinition {
  const settingsGroup = option.provider === "gls" ? siteSettings?.gls : siteSettings?.boxNow;

  if (!settingsGroup) {
    return option;
  }

  const isConfigured =
    option.provider === "gls" ? hasGlsRuntimeConfig(siteSettings) : hasBoxNowRuntimeConfig(siteSettings);

  return {
    ...option,
    available:
      settingsGroup.availability === "enabled" && isConfigured
        ? true
        : settingsGroup.availability === "disabled"
          ? false
          : option.available && isConfigured,
    description:
      typeof settingsGroup.description === "string" && settingsGroup.description.trim().length > 0
        ? settingsGroup.description.trim()
        : option.description,
    disabledLabel:
      typeof settingsGroup.disabledLabel === "string" && settingsGroup.disabledLabel.trim().length > 0
        ? settingsGroup.disabledLabel.trim()
        : option.disabledLabel,
    label:
      typeof settingsGroup.label === "string" && settingsGroup.label.trim().length > 0
        ? settingsGroup.label.trim()
        : option.label,
    priceValue: typeof settingsGroup.price === "number" ? settingsGroup.price : option.priceValue,
  };
}

export async function resolveCartShippingOptions(req: PayloadRequest): Promise<CartShippingOption[]> {
  try {
    const siteSettings = (await req.payload.findGlobal({
      depth: 0,
      req,
      slug: "site-settings",
    })) as SiteSetting;

    return fallbackShippingMethods.map((option) => withPriceLabel(readSiteSettingsOption(siteSettings, option)));
  } catch {
    return fallbackShippingMethods.map((option) =>
      withPriceLabel({
        ...option,
        available: false,
      }),
    );
  }
}

export async function resolveBoxNowWidgetConfig(
  req: PayloadRequest,
): Promise<BoxNowWidgetConfig | null> {
  try {
    const siteSettings = (await req.payload.findGlobal({
      depth: 0,
      req,
      slug: "site-settings",
    })) as SiteSetting;

    if (!hasBoxNowWidgetConfig(siteSettings)) {
      return null;
    }

    return {
      partnerId: siteSettings.boxNow?.partnerId?.trim() ?? null,
      widgetScriptUrl: siteSettings.boxNow?.widgetScriptUrl?.trim() ?? null,
    };
  } catch {
    return null;
  }
}

export function resolveDefaultCartShippingOptionId(options: CartShippingOption[]) {
  return options.find((option) => option.available)?.id ?? defaultShippingMethodId;
}

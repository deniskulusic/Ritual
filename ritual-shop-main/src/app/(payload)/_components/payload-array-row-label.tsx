"use client";

import { useRowLabel, useTranslation } from "@payloadcms/ui";

type ArrayRowData = {
  categoryLabel?: string;
  ctaLabel?: string;
  label?: string;
  linkLabel?: string;
  links?: Array<{ label?: string | null } | null> | null;
  name?: string;
  platform?: string;
  primaryCtaLabel?: string;
  text?: string;
  title?: string;
};

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function PayloadArrayRowLabel() {
  const { i18n } = useTranslation();
  const { data, rowNumber } = useRowLabel<ArrayRowData>();

  const nextLabel =
    clean(data?.label) ||
    clean(data?.title) ||
    clean(data?.name) ||
    clean(data?.categoryLabel) ||
    clean(data?.linkLabel) ||
    clean(data?.ctaLabel) ||
    clean(data?.platform) ||
    clean(data?.text) ||
    clean(data?.primaryCtaLabel) ||
    clean(data?.links?.find((entry) => clean(entry?.label))?.label);

  const fallbackLabel = i18n.language === "hr" ? "Stavka" : "Item";

  return nextLabel || `${fallbackLabel} ${rowNumber ?? ""}`.trim();
}

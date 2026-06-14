import type { PayloadRequest } from "payload";

export const localizedLabel = (en: string, hr: string) => ({
  en,
  hr,
});

export const adminGroups = {
  admin: localizedLabel("Admin", "Administracija"),
  catalogue: localizedLabel("Catalogue", "Katalog"),
  commerce: localizedLabel("Commerce", "Trgovina"),
  content: localizedLabel("Content", "Sadržaj"),
} as const;

export const getLocalizedText = ({
  en,
  hr,
  req,
}: {
  en: string;
  hr: string;
  req?: Pick<PayloadRequest, "i18n" | "locale"> | null;
}) => {
  const language = req?.i18n?.language ?? req?.locale ?? "hr";

  return language === "en" ? en : hr;
};

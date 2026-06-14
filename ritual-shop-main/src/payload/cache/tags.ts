export const FRONTEND_CACHE_TAG = "frontend";

export const getCollectionTag = (slug: string) => `collection:${slug}`;

export const getGlobalTag = (slug: string) => `global:${slug}`;

export const getDocumentTag = (collection: string, slug: string) =>
  `document:${collection}:${slug}`;

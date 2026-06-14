import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from "payload";

import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
  getDocumentTag,
  getGlobalTag,
} from "./tags";

type Logger = {
  warn: (message: string) => void;
};

function dedupeTags(tags: string[]) {
  return [...new Set(tags)];
}

async function requestTagRevalidation(tags: string[], logger?: Logger) {
  try {
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger?.warn(`Cache revalidation failed for tags [${tags.join(", ")}]: ${message}`);
  }
}

function getDocumentSlug(doc?: Record<string, unknown> | null) {
  return typeof doc?.slug === "string" ? doc.slug : null;
}

export function withGlobalRevalidation(globalConfig: GlobalConfig): GlobalConfig {
  const afterChange: GlobalAfterChangeHook = async ({ req }) => {
    await requestTagRevalidation(
      [FRONTEND_CACHE_TAG, getGlobalTag(globalConfig.slug)],
      req.payload.logger,
    );
  };

  return {
    ...globalConfig,
    hooks: {
      ...globalConfig.hooks,
      afterChange: [...(globalConfig.hooks?.afterChange ?? []), afterChange],
    },
  };
}

export function withCollectionRevalidation(collectionConfig: CollectionConfig): CollectionConfig {
  const getTags = (
    doc?: Record<string, unknown> | null,
    previousDoc?: Record<string, unknown> | null,
  ) => {
    const tags = [FRONTEND_CACHE_TAG, getCollectionTag(collectionConfig.slug)];
    const nextSlug = getDocumentSlug(doc);
    const previousSlug = getDocumentSlug(previousDoc);

    if (nextSlug) {
      tags.push(getDocumentTag(collectionConfig.slug, nextSlug));
    }

    if (previousSlug) {
      tags.push(getDocumentTag(collectionConfig.slug, previousSlug));
    }

    return dedupeTags(tags);
  };

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
    await requestTagRevalidation(getTags(doc, previousDoc), req.payload.logger);
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await requestTagRevalidation(getTags(doc), req.payload.logger);
    return doc;
  };

  return {
    ...collectionConfig,
    hooks: {
      ...collectionConfig.hooks,
      afterChange: [...(collectionConfig.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collectionConfig.hooks?.afterDelete ?? []), afterDelete],
    },
  };
}

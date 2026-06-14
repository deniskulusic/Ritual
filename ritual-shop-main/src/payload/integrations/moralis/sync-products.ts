import type { Payload } from "payload";

import { MORALIS_SYNC_CONTEXT_KEY } from "../../shared/moralis";
import { iterateMoralisProducts } from "./client";
import { mapMoralisProductToOperationalSnapshot } from "./mapper";

const PRODUCT_BINDING_PAGE_SIZE = 100;

type ProductBinding = {
  id: number | string;
  moralis?: {
    itemID?: string | null;
  } | null;
};

export type MoralisProductSyncError = {
  itemID: string;
  message: string;
};

export type MoralisProductSyncSummary = {
  errors: MoralisProductSyncError[];
  failed: number;
  matched: number;
  processed: number;
  skipped: number;
  updated: number;
};

const loadProductBindings = async (payload: Payload) => {
  const bindings = new Map<string, number | string>();
  let page = 1;

  while (true) {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      limit: PRODUCT_BINDING_PAGE_SIZE,
      overrideAccess: true,
      page,
      pagination: true,
    });

    for (const doc of result.docs as ProductBinding[]) {
      const itemID = doc.moralis?.itemID?.trim();

      if (itemID) {
        bindings.set(itemID, doc.id);
      }
    }

    if (!result.hasNextPage) {
      return bindings;
    }

    page += 1;
  }
};

// This service is intentionally not wired to any admin action, route, or job yet.
// It exists so all future execution paths share the same sync contract.
export const syncMoralisProducts = async (
  payload: Payload,
): Promise<MoralisProductSyncSummary> => {
  const bindings = await loadProductBindings(payload);
  const summary: MoralisProductSyncSummary = {
    errors: [],
    failed: 0,
    matched: 0,
    processed: 0,
    skipped: 0,
    updated: 0,
  };

  for await (const page of iterateMoralisProducts()) {
    for (const sourceProduct of page) {
      summary.processed += 1;

      try {
        const snapshot = mapMoralisProductToOperationalSnapshot(sourceProduct);
        const productID = bindings.get(snapshot.itemID);

        if (!productID) {
          summary.skipped += 1;
          continue;
        }

        summary.matched += 1;

        await payload.update({
          collection: "products",
          context: {
            [MORALIS_SYNC_CONTEXT_KEY]: true,
          },
          data: {
            moralis: snapshot,
          },
          id: productID,
          overrideAccess: true,
        });

        summary.updated += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          itemID:
            typeof sourceProduct.SIF_ART === "string" && sourceProduct.SIF_ART.trim()
              ? sourceProduct.SIF_ART.trim()
              : "unknown",
          message: error instanceof Error ? error.message : "Unknown sync error.",
        });
      }
    }
  }

  return summary;
};

"use client";

import { toast, useConfig } from "@payloadcms/ui";
import { useTransition } from "react";

export function RitualCacheRevalidateButton() {
  const [isPending, startTransition] = useTransition();
  const {
    config: {
      routes: { api: apiRoute },
    },
  } = useConfig();

  function handleClick() {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`${apiRoute}/admin/cache/revalidate`, {
          credentials: "include",
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Cache revalidation failed.");
        }

        toast.success("Frontend cache revalidation queued.");
      } catch {
        toast.error("Unable to revalidate frontend cache.");
      }
    });
  }

  return (
    <button
      type="button"
      className="ritual-nav-shell__utility-link"
      disabled={isPending}
      onClick={handleClick}
    >
      <span className="ritual-nav-shell__utility-link-label">
        {isPending ? "Revalidating..." : "Revalidate cache"}
      </span>
    </button>
  );
}

import { localizedLabel } from "./admin-copy";

export const MORALIS_SYNC_CONTEXT_KEY = "isMoralisSync";

export type MoralisSyncStatus = "never-synced" | "succeeded" | "failed";

export const moralisSyncStatusOptions = [
  {
    label: localizedLabel("Never Synced", "Nije sinkronizirano"),
    value: "never-synced" as MoralisSyncStatus,
  },
  {
    label: localizedLabel("Synced", "Sinkronizirano"),
    value: "succeeded" as MoralisSyncStatus,
  },
  {
    label: localizedLabel("Sync Failed", "Sinkronizacija nije uspjela"),
    value: "failed" as MoralisSyncStatus,
  },
];

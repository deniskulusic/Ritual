import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../access";
import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["alt", "filename", "mimeType", "updatedAt"],
    group: adminGroups.catalogue,
    useAsTitle: "alt",
  },
  labels: {
    plural: localizedLabel("Media", "Mediji"),
    singular: localizedLabel("Media Item", "Medijski zapis"),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: localizedLabel("Alt text", "Alt tekst"),
    },
  ],
  upload: {
    adminThumbnail: "card",
    imageSizes: [
      {
        name: "card",
        width: 720,
        height: 720,
        position: "centre",
      },
    ],
    mimeTypes: ["image/*"],
    staticDir: "media",
  },
};

import type { CollectionConfig } from "payload";

import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    defaultColumns: ["email", "name", "role", "updatedAt"],
    group: adminGroups.admin,
    useAsTitle: "email",
  },
  labels: {
    plural: localizedLabel("Team", "Tim"),
    singular: localizedLabel("Team Member", "Član tima"),
  },
  auth: true,
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: localizedLabel("Name", "Ime i prezime"),
        },
        {
          name: "role",
          type: "select",
          required: true,
          defaultValue: "editor",
          label: localizedLabel("Role", "Uloga"),
          options: [
            {
              label: localizedLabel("Admin", "Administrator"),
              value: "admin",
            },
            {
              label: localizedLabel("Editor", "Urednik"),
              value: "editor",
            },
          ],
        },
      ],
    },
  ],
};

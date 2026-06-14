import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../../access";
import { brandLayoutBlocks } from "./_blocks";
import { ritualSlugField } from "../../fields/ritual-slug-field";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";

export const Brands: CollectionConfig = {
  slug: "brands",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["name", "slug", "updatedAt"],
    group: adminGroups.catalogue,
    useAsTitle: "name",
  },
  labels: {
    plural: localizedLabel("Brands", "Brendovi"),
    singular: localizedLabel("Brand", "Brend"),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Overview", "Pregled"),
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              label: localizedLabel("Name", "Naziv"),
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              label: localizedLabel("Logo", "Logotip"),
            },
            {
              name: "shortDescription",
              type: "textarea",
              label: localizedLabel("Short description", "Kratki opis"),
            },
            {
              name: "story",
              type: "textarea",
              label: localizedLabel("Story", "Priča"),
            },
          ],
        },
        {
          label: localizedLabel("Detail Page", "Detaljna stranica"),
          fields: [
            {
              type: "tabs",
              tabs: [
                {
                  label: localizedLabel("Content", "Sadržaj"),
                  fields: [
                    {
                      name: "layout",
                      type: "blocks",
                      blocks: brandLayoutBlocks,
                      required: false,
                      label: localizedLabel("Layout", "Raspored"),
                      labels: {
                        plural: localizedLabel("Sections", "Sekcije"),
                        singular: localizedLabel("Section", "Sekcija"),
                      },
                      admin: {
                        description: localizedLabel(
                          "Flexible brand detail page sections.",
                          "Fleksibilne sekcije detaljne stranice brenda.",
                        ),
                        initCollapsed: true,
                      },
                    },
                  ],
                },
                {
                  label: localizedLabel("SEO", "SEO"),
                  fields: [
                    {
                      name: "metaTitle",
                      type: "text",
                      label: localizedLabel("Meta title", "Meta naslov"),
                    },
                    {
                      name: "metaDescription",
                      type: "textarea",
                      label: localizedLabel("Meta description", "Meta opis"),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    ritualSlugField({
      position: "sidebar",
      useAsSlug: "name",
    }),
  ],
};

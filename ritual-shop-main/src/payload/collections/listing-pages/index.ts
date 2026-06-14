import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../../access";
import { ritualSlugField } from "../../fields/ritual-slug-field";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";
import {
  catalogVisibleFilterDefinitions,
  defaultCategoryVisibleFilterKeys,
} from "../../shared/catalog-filters";
import { productTypeOptions } from "../../shared/product-types";

export const ListingPages: CollectionConfig = {
  slug: "listing-pages",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    group: adminGroups.catalogue,
    useAsTitle: "title",
  },
  labels: {
    plural: localizedLabel("Listing Pages", "SEO liste"),
    singular: localizedLabel("Listing Page", "SEO lista"),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Overview", "Pregled"),
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: localizedLabel("Title", "Naslov"),
            },
            {
              name: "description",
              type: "textarea",
              label: localizedLabel("Description", "Opis"),
            },
          ],
        },
        {
          label: localizedLabel("Listing Page", "Stranica liste"),
          fields: [
            {
              type: "tabs",
              tabs: [
                {
                  label: localizedLabel("Filters", "Filteri"),
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "preappliedBrands",
                          type: "relationship",
                          relationTo: "brands",
                          hasMany: true,
                          admin: {
                            width: "50%",
                          },
                          label: localizedLabel("Preapplied brands", "Prethodno zadani brendovi"),
                        },
                        {
                          name: "preappliedCategories",
                          type: "relationship",
                          relationTo: "categories",
                          hasMany: true,
                          admin: {
                            width: "50%",
                          },
                          label: localizedLabel("Preapplied categories", "Prethodno zadane kategorije"),
                        },
                      ],
                    },
                    {
                      type: "row",
                      fields: [
                        {
                          name: "preappliedProductTypes",
                          type: "select",
                          hasMany: true,
                          options: productTypeOptions,
                          admin: {
                            description: localizedLabel(
                              "Use when the page should be locked to one or more product types.",
                              "Koristite kada stranica mora biti zaključana na jednu ili više vrsta proizvoda.",
                            ),
                            width: "50%",
                          },
                          label: localizedLabel("Preapplied product types", "Prethodno zadane vrste proizvoda"),
                        },
                        {
                          name: "visibleFilterKeys",
                          type: "select",
                          hasMany: true,
                          options: catalogVisibleFilterDefinitions.map((definition) => ({
                            label: definition.adminLabel,
                            value: definition.key,
                          })),
                          defaultValue: defaultCategoryVisibleFilterKeys,
                          admin: {
                            description: localizedLabel(
                              "Choose which catalog filters editors want to expose on this page. Locked filters stay active in the background.",
                              "Odaberite koje katalog filtre urednici žele prikazati na ovoj stranici. Zaključani filteri ostaju aktivni u pozadini.",
                            ),
                            width: "50%",
                          },
                          label: localizedLabel("Visible filters", "Prikazani filteri"),
                        },
                      ],
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
      useAsSlug: "title",
      overrides: (field) => ({
        ...field,
        admin: {
          ...field.admin,
          description: localizedLabel(
            "Unique route segment under /shop.",
            "Jedinstveni segment rute unutar /shop.",
          ),
        },
      }),
    }),
  ],
};

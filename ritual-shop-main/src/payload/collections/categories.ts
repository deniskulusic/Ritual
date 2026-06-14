import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../access";
import { ritualSlugField } from "../fields/ritual-slug-field";
import { adminGroups, localizedLabel } from "../shared/admin-copy";
import { productTypeOptions } from "../shared/product-types";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "slug", "parent", "updatedAt"],
    group: adminGroups.catalogue,
    useAsTitle: "title",
  },
  labels: {
    plural: localizedLabel("Categories", "Kategorije"),
    singular: localizedLabel("Category", "Kategorija"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: localizedLabel("Title", "Naziv"),
    },
    {
      name: "description",
      type: "textarea",
      label: localizedLabel("Description", "Opis"),
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: localizedLabel("Image", "Slika"),
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Parent category", "Nadređena kategorija"),
    },
    {
      name: "allowedProductTypes",
      type: "select",
      hasMany: true,
      options: productTypeOptions,
      admin: {
        description: localizedLabel(
          "Leave empty to allow this category across all product types.",
          "Ostavite prazno kako bi kategorija bila dostupna za sve vrste proizvoda.",
        ),
        position: "sidebar",
      },
      label: localizedLabel("Allowed product types", "Dopuštene vrste proizvoda"),
    },
    ritualSlugField({
      position: "sidebar",
      useAsSlug: "title",
    }),
  ],
};

import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../../access";
import { blogLayoutBlocks } from "./_blocks";
import { ritualSlugField } from "../../fields/ritual-slug-field";
import { buildSectionHeadingFields } from "../../fields/section-heading";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";

export const Blogs: CollectionConfig = {
  slug: "blogs",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "category", "publishedAt", "slug", "updatedAt"],
    group: adminGroups.content,
    useAsTitle: "title",
  },
  labels: {
    plural: localizedLabel("Blogs", "Blogovi"),
    singular: localizedLabel("Blog", "Blog"),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Content", "Sadržaj"),
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: localizedLabel("Title", "Naslov"),
            },
            {
              type: "row",
              fields: [
                {
                  name: "category",
                  type: "text",
                  required: true,
                  label: localizedLabel("Category", "Kategorija"),
                  admin: {
                    width: "34%",
                  },
                },
                {
                  name: "publishedAt",
                  type: "date",
                  required: true,
                  label: localizedLabel("Published at", "Objavljeno"),
                  admin: {
                    width: "33%",
                  },
                },
                {
                  name: "readingTime",
                  type: "text",
                  required: true,
                  label: localizedLabel("Reading time", "Vrijeme čitanja"),
                  admin: {
                    width: "33%",
                  },
                },
              ],
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              label: localizedLabel("Excerpt", "Sažetak"),
            },
            {
              name: "heroBadges",
              type: "group",
              label: localizedLabel("Hero badges", "Hero oznake"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "primaryLabel",
                      type: "text",
                      required: true,
                      admin: {
                        width: "50%",
                      },
                      label: localizedLabel("Primary badge", "Primarna oznaka"),
                    },
                    {
                      name: "stampLabel",
                      type: "text",
                      required: true,
                      admin: {
                        width: "50%",
                      },
                      label: localizedLabel("Stamp badge", "Pečat oznaka"),
                    },
                  ],
                },
              ],
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: localizedLabel("Image", "Slika"),
            },
            {
              name: "layout",
              type: "blocks",
              blocks: blogLayoutBlocks,
              required: true,
              admin: {
                initCollapsed: true,
                description: localizedLabel(
                  "Flexible blog detail page blocks shown below the intro.",
                  "Fleksibilni blokovi detaljne blog stranice prikazani ispod uvoda.",
                ),
              },
              label: localizedLabel("Layout", "Raspored"),
              labels: {
                plural: localizedLabel("Blocks", "Blokovi"),
                singular: localizedLabel("Block", "Blok"),
              },
            },
            {
              name: "relatedBlogs",
              type: "group",
              label: localizedLabel("Related blogs", "Povezani blogovi"),
              fields: [
                ...buildSectionHeadingFields({
                  description: localizedLabel(
                    "Heading shown above the related blogs section on this blog detail page.",
                    "Naslov prikazan iznad sekcije povezanih blogova na ovoj detaljnoj blog stranici.",
                  ),
                }),
                {
                  name: "blogs",
                  type: "relationship",
                  relationTo: "blogs",
                  hasMany: true,
                  label: localizedLabel("Blogs", "Blogovi"),
                  admin: {
                    description: localizedLabel(
                      "Choose the blogs shown in the related blogs section on this blog detail page.",
                      "Odaberite blogove prikazane u sekciji povezanih blogova na ovoj detaljnoj blog stranici.",
                    ),
                  },
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
    }),
  ],
};

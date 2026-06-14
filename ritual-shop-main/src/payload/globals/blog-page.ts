import type { GlobalConfig } from "payload";

import { buildSectionHeadingFields } from "../fields/section-heading";
import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const BlogPage: GlobalConfig = {
  slug: "blog-page",
  admin: {
    group: adminGroups.content,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Content", "Sadržaj"),
          fields: [
            {
              name: "intro",
              type: "group",
              fields: buildSectionHeadingFields({
                description: localizedLabel(
                  "Heading shown at the top of the blogs page.",
                  "Naslov prikazan na vrhu blog stranice.",
                ),
              }),
              label: localizedLabel("Intro", "Uvod"),
            },
            {
              name: "featuredBlogs",
              type: "array",
              label: localizedLabel("Featured blogs", "Izdvojeni blogovi"),
              labels: {
                plural: localizedLabel("Featured blogs", "Izdvojeni blogovi"),
                singular: localizedLabel("Featured blog", "Izdvojeni blog"),
              },
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                },
              },
              fields: [
                {
                  name: "blog",
                  type: "relationship",
                  relationTo: "blogs",
                  required: true,
                  label: localizedLabel("Blog", "Blog"),
                },
                {
                  name: "ctaLabel",
                  type: "text",
                  required: true,
                  label: localizedLabel("Button label", "Oznaka gumba"),
                },
              ],
            },
            {
              name: "latestBlogs",
              type: "group",
              fields: [
                ...buildSectionHeadingFields({
                  description: localizedLabel(
                    "Heading shown above the latest blogs grid.",
                    "Naslov prikazan iznad mreže najnovijih blogova.",
                  ),
                }),
                {
                  name: "description",
                  type: "textarea",
                  required: true,
                  label: localizedLabel("Description", "Opis"),
                },
              ],
              label: localizedLabel("Latest blogs", "Najnoviji blogovi"),
            },
          ],
        },
      ],
    },
  ],
  label: localizedLabel("Blogs page", "Blog stranica"),
};

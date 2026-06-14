import type { GlobalConfig } from "payload";

import { homeLayoutBlocks } from "./_blocks";
import { buildLinkFields } from "../../fields/link";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";
import { internalLinkRelationTo } from "../../shared/internal-link-relation-to";

export const HomePage: GlobalConfig = {
  slug: "home-page",
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
              name: "hero",
              type: "group",
              label: localizedLabel("Hero", "Hero"),
              fields: [
                {
                  name: "backgroundImage",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: localizedLabel("Background image", "Pozadinska slika"),
                },
                {
                  name: "title",
                  type: "textarea",
                  required: true,
                  label: localizedLabel("Title", "Naslov"),
                },
                {
                  name: "description",
                  type: "textarea",
                  required: true,
                  label: localizedLabel("Description", "Opis"),
                },
                {
                  name: "primaryCtaLabel",
                  type: "text",
                  required: true,
                  label: localizedLabel("CTA label", "Oznaka CTA gumba"),
                },
                ...buildLinkFields({
                  dbNamePrefix: "primary_cta",
                  namePrefix: "primaryCta",
                  relationTo: internalLinkRelationTo,
                }),
                {
                  name: "highlights",
                  type: "array",
                  minRows: 1,
                  maxRows: 6,
                  label: localizedLabel("Highlights", "Istaknuto"),
                  labels: {
                    plural: localizedLabel("Highlights", "Istaknuto"),
                    singular: localizedLabel("Highlight", "Istaknuta stavka"),
                  },
                  admin: {
                    initCollapsed: true,
                    components: {
                      RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                    },
                  },
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      required: true,
                      label: localizedLabel("Label", "Oznaka"),
                    },
                    {
                      name: "icon",
                      type: "upload",
                      relationTo: "media",
                      required: true,
                      label: localizedLabel("Icon", "Ikona"),
                    },
                  ],
                },
              ],
            },
            {
              name: "layout",
              type: "blocks",
              blocks: homeLayoutBlocks,
              required: false,
              label: localizedLabel("Layout", "Raspored"),
              labels: {
                plural: localizedLabel("Sections", "Sekcije"),
                singular: localizedLabel("Section", "Sekcija"),
              },
              admin: {
                description: localizedLabel(
                  "Flexible homepage sections shown below the hero.",
                  "Fleksibilne sekcije naslovnice prikazane ispod hero dijela.",
                ),
                initCollapsed: true,
              },
            },
          ],
        },
      ],
    },
  ],
  label: localizedLabel("Homepage", "Naslovnica"),
};

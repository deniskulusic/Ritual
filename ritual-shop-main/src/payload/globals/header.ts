import type { GlobalConfig } from "payload";

import { buildLinkFields } from "../fields/link";
import { adminGroups, localizedLabel } from "../shared/admin-copy";
import { internalLinkRelationTo } from "../shared/internal-link-relation-to";

export const Header: GlobalConfig = {
  slug: "header",
  admin: {
    group: adminGroups.content,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Announcement", "Obavijest"),
          fields: [
            {
              name: "announcementBar",
              type: "group",
              fields: [
                {
                  name: "mode",
                  type: "radio",
                  defaultValue: "message",
                  label: localizedLabel("Mode", "Način"),
                  admin: {
                    layout: "horizontal",
                  },
                  options: [
                    {
                      label: localizedLabel("Hidden", "Skriveno"),
                      value: "hidden",
                    },
                    {
                      label: localizedLabel("Message", "Poruka"),
                      value: "message",
                    },
                  ],
                },
                {
                  name: "text",
                  type: "text",
                  label: localizedLabel("Text", "Tekst"),
                  admin: {
                    condition: (_, siblingData) => siblingData?.mode === "message",
                  },
                },
              ],
              label: localizedLabel("Announcement", "Obavijest"),
            },
          ],
        },
        {
          label: localizedLabel("Navigation", "Navigacija"),
          fields: [
            {
              name: "primaryNavigation",
              type: "array",
              minRows: 1,
              labels: {
                plural: localizedLabel("Navigation Items", "Navigacijske stavke"),
                singular: localizedLabel("Navigation Item", "Navigacijska stavka"),
              },
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                },
              },
              fields: [
                {
                  name: "mode",
                  type: "radio",
                  label: localizedLabel("Navigation type", "Vrsta navigacije"),
                  defaultValue: "link",
                  admin: {
                    layout: "horizontal",
                  },
                  options: [
                    {
                      label: localizedLabel("Link", "Poveznica"),
                      value: "link",
                    },
                    {
                      label: localizedLabel("Mega menu", "Mega izbornik"),
                      value: "mega-menu",
                    },
                  ],
                },
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: localizedLabel("Label", "Oznaka"),
                },
                ...buildLinkFields({
                  allowEmpty: true,
                  dbNamePrefix: "item_link",
                  namePrefix: "item",
                  relationTo: internalLinkRelationTo,
                }),
                {
                  name: "megaMenu",
                  type: "group",
                  admin: {
                    condition: (_, siblingData) => siblingData?.mode === "mega-menu",
                  },
                  fields: [
                    {
                      name: "layout",
                      type: "radio",
                      defaultValue: "classic",
                      label: localizedLabel("Layout", "Raspored"),
                      admin: {
                        layout: "horizontal",
                      },
                      options: [
                        {
                          label: localizedLabel("Classic", "Klasični"),
                          value: "classic",
                        },
                        {
                          label: localizedLabel("Brands panel", "Panel brendova"),
                          value: "brands-panel",
                        },
                      ],
                    },
                    {
                      name: "columns",
                      type: "array",
                      minRows: 1,
                      maxRows: 4,
                      labels: {
                        plural: localizedLabel("Columns", "Stupci"),
                        singular: localizedLabel("Column", "Stupac"),
                      },
                      admin: {
                        initCollapsed: true,
                        components: {
                          RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                        },
                      },
                      fields: [
                        {
                          name: "title",
                          type: "text",
                          required: true,
                          label: localizedLabel("Title", "Naslov"),
                        },
                        {
                          name: "links",
                          type: "array",
                          minRows: 1,
                          labels: {
                            plural: localizedLabel("Links", "Poveznice"),
                            singular: localizedLabel("Link", "Poveznica"),
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
                            ...buildLinkFields({
                              dbNamePrefix: "link",
                              namePrefix: "link",
                              relationTo: internalLinkRelationTo,
                            }),
                          ],
                        },
                      ],
                    },
                    {
                      name: "featureCard",
                      type: "group",
                      label: localizedLabel("Feature card", "Istaknuta kartica"),
                      admin: {
                        condition: (_, siblingData) => siblingData?.layout !== "brands-panel",
                      },
                      fields: [
                        {
                          type: "row",
                          fields: [
                            {
                              name: "eyebrow",
                              type: "text",
                              label: localizedLabel("Eyebrow", "Nadnaslov"),
                              admin: {
                                width: "35%",
                              },
                            },
                            {
                              name: "title",
                              type: "text",
                              required: true,
                              label: localizedLabel("Title", "Naslov"),
                              admin: {
                                width: "65%",
                              },
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
                        ...buildLinkFields({
                          dbNamePrefix: "feature_link",
                          namePrefix: "feature",
                          relationTo: internalLinkRelationTo,
                        }),
                      ],
                    },
                    {
                      name: "brandPanel",
                      type: "group",
                      label: localizedLabel("Brand panel", "Panel brendova"),
                      admin: {
                        condition: (_, siblingData) => siblingData?.layout === "brands-panel",
                      },
                      fields: [
                        {
                          name: "title",
                          type: "text",
                          required: true,
                          label: localizedLabel("Title", "Naslov"),
                        },
                        {
                          name: "brandLogos",
                          type: "array",
                          minRows: 1,
                          labels: {
                            plural: localizedLabel("Brand logos", "Logotipi brendova"),
                            singular: localizedLabel("Brand logo", "Logotip brenda"),
                          },
                          admin: {
                            initCollapsed: true,
                            components: {
                              RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                            },
                          },
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
                              required: true,
                              label: localizedLabel("Logo", "Logotip"),
                            },
                            ...buildLinkFields({
                              dbNamePrefix: "brand_logo_link",
                              namePrefix: "logo",
                              relationTo: internalLinkRelationTo,
                            }),
                          ],
                        },
                      ],
                    },
                  ],
                  label: localizedLabel("Mega menu", "Mega izbornik"),
                },
              ],
            },
            {
              name: "mobileNavigation",
              type: "array",
              minRows: 1,
              labels: {
                plural: localizedLabel("Mobile Navigation Items", "Stavke mobilne navigacije"),
                singular: localizedLabel("Mobile Navigation Item", "Stavka mobilne navigacije"),
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
                ...buildLinkFields({
                  dbNamePrefix: "link",
                  namePrefix: "link",
                  relationTo: internalLinkRelationTo,
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
  label: localizedLabel("Header", "Zaglavlje"),
};

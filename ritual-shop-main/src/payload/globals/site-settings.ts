import type { Field, GlobalConfig } from "payload";

import { adminGroups, localizedLabel } from "../shared/admin-copy";

type DeliveryMethodGroupOptions = {
  apiBaseUrlLabel?: string;
  apiFields: Field[];
  defaults: {
    description: string;
    disabledLabel: string;
    label: string;
    price: number;
  };
  extraFields?: Field[];
  groupLabel: {
    en: string;
    hr: string;
  };
  name: "boxNow" | "gls";
};

function createAvailabilityAndPriceFields(defaultPrice: number): Field[] {
  return [
    {
      type: "row",
      fields: [
        {
          name: "availability",
          type: "radio",
          defaultValue: "enabled",
          label: localizedLabel("Availability", "Dostupnost"),
          admin: {
            layout: "horizontal",
            width: "50%",
          },
          options: [
            {
              label: localizedLabel("Enabled", "Aktivno"),
              value: "enabled",
            },
            {
              label: localizedLabel("Disabled", "Nedostupno"),
              value: "disabled",
            },
          ],
        },
        {
          name: "price",
          type: "number",
          defaultValue: defaultPrice,
          required: true,
          min: 0,
          label: localizedLabel("Price", "Cijena"),
          admin: {
            width: "50%",
          },
        },
      ],
    },
  ];
}

function createDeliveryMethodGroup({
  apiBaseUrlLabel = "API base URL",
  apiFields,
  defaults,
  extraFields = [],
  groupLabel,
  name,
}: DeliveryMethodGroupOptions): Field {
  return {
    name,
    type: "group",
    label: localizedLabel(groupLabel.en, groupLabel.hr),
    fields: [
      ...createAvailabilityAndPriceFields(defaults.price),
      {
        type: "row",
        fields: [
          {
            name: "label",
            type: "text",
            defaultValue: defaults.label,
            required: true,
            label: localizedLabel("Checkout label", "Naziv u checkoutu"),
            admin: {
              width: "50%",
            },
          },
          {
            name: "disabledLabel",
            type: "text",
            defaultValue: defaults.disabledLabel,
            required: true,
            label: localizedLabel("Disabled label", "Oznaka nedostupnosti"),
            admin: {
              width: "50%",
            },
          },
        ],
      },
      {
        name: "description",
        type: "textarea",
        defaultValue: defaults.description,
        label: localizedLabel("Description", "Opis"),
      },
      {
        type: "row",
        fields: [
          {
            name: "apiBaseUrl",
            type: "text",
            label: localizedLabel(apiBaseUrlLabel, "Osnovni API URL"),
            admin: {
              width: "50%",
            },
          },
          ...apiFields,
        ],
      },
      ...extraFields,
    ],
  };
}

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: adminGroups.content,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("SEO Defaults", "Zadani SEO"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "siteName",
                  type: "text",
                  required: true,
                  label: localizedLabel("Store name", "Naziv trgovine"),
                  admin: {
                    width: "40%",
                  },
                },
                {
                  name: "siteUrl",
                  type: "text",
                  required: true,
                  label: localizedLabel("Store URL", "URL trgovine"),
                  admin: {
                    description: localizedLabel(
                      "Main site URL used for search and sharing previews.",
                      "Glavni URL weba za prikaz u tražilicama i pri dijeljenju.",
                    ),
                    width: "60%",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "defaultTitle",
                  type: "text",
                  label: localizedLabel("Default title", "Zadani naslov"),
                  admin: {
                    width: "50%",
                  },
                },
                {
                  name: "titleSuffix",
                  type: "text",
                  label: localizedLabel("Title suffix", "Dodatak naslovu"),
                  admin: {
                    description: localizedLabel(
                      "Optional suffix added to generated page titles.",
                      "Neobavezni dodatak koji se dodaje generiranim naslovima stranica.",
                    ),
                    width: "50%",
                  },
                },
              ],
            },
            {
              name: "defaultDescription",
              type: "textarea",
              label: localizedLabel("Default description", "Zadani opis"),
              admin: {
                description: localizedLabel(
                  "Default search description used when a page has no custom summary.",
                  "Zadani opis za tražilice kada stranica nema vlastiti sažetak.",
                ),
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "defaultImage",
                  type: "upload",
                  relationTo: "media",
                  label: localizedLabel("Default image", "Zadana slika"),
                  admin: {
                    width: "60%",
                  },
                },
                {
                  name: "robots",
                  type: "text",
                  label: localizedLabel("Robots", "Robots"),
                  admin: {
                    description: localizedLabel(
                      "Optional robots rule, for example index,follow.",
                      'Neobavezno robots pravilo, na primjer "index,follow".',
                    ),
                    width: "40%",
                  },
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Contact", "Kontakt"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "primaryEmail",
                  type: "email",
                  label: localizedLabel("Primary email", "Glavni e-mail"),
                  admin: {
                    width: "33%",
                  },
                },
                {
                  name: "supportEmail",
                  type: "email",
                  label: localizedLabel("Support email", "E-mail podrške"),
                  admin: {
                    width: "33%",
                  },
                },
                {
                  name: "phone",
                  type: "text",
                  label: localizedLabel("Phone", "Telefon"),
                  admin: {
                    width: "34%",
                  },
                },
              ],
            },
            {
              name: "address",
              type: "group",
              label: localizedLabel("Address", "Adresa"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "line1",
                      type: "text",
                      admin: {
                        width: "60%",
                      },
                      label: localizedLabel("Address line 1", "Adresa 1"),
                    },
                    {
                      name: "line2",
                      type: "text",
                      admin: {
                        width: "40%",
                      },
                      label: localizedLabel("Address line 2", "Adresa 2"),
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "city",
                      type: "text",
                      label: localizedLabel("City", "Grad"),
                      admin: {
                        width: "35%",
                      },
                    },
                    {
                      name: "postalCode",
                      type: "text",
                      label: localizedLabel("Postal code", "Poštanski broj"),
                      admin: {
                        width: "25%",
                      },
                    },
                    {
                      name: "country",
                      type: "text",
                      label: localizedLabel("Country", "Država"),
                      admin: {
                        width: "40%",
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: "socialLinks",
              type: "array",
              label: localizedLabel("Social links", "Društvene mreže"),
              labels: {
                plural: localizedLabel("Social Links", "Društvene mreže"),
                singular: localizedLabel("Social Link", "Društvena mreža"),
              },
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "platform",
                      type: "text",
                      required: true,
                      label: localizedLabel("Platform", "Platforma"),
                      admin: {
                        width: "35%",
                      },
                    },
                    {
                      name: "url",
                      type: "text",
                      required: true,
                      label: localizedLabel("URL", "URL"),
                      admin: {
                        width: "65%",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Delivery Methods", "Načini dostave"),
          fields: [
            createDeliveryMethodGroup({
              apiFields: [
                {
                  name: "serviceCode",
                  type: "text",
                  label: localizedLabel("Service code", "Šifra usluge"),
                  admin: {
                    width: "25%",
                  },
                },
                {
                  name: "clientNumber",
                  type: "text",
                  label: localizedLabel("Client number", "Broj klijenta"),
                  admin: {
                    width: "25%",
                  },
                },
              ],
              defaults: {
                description: "Dostava na kućnu ili poslovnu adresu putem GLS kurirske službe.",
                disabledLabel: "Trenutno nedostupno",
                label: "GLS dostava na adresu",
                price: 8.9,
              },
              extraFields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "username",
                      type: "text",
                      label: localizedLabel("Username", "Korisničko ime"),
                      admin: {
                        description: localizedLabel(
                          "GLS API username used for shipment creation.",
                          "GLS API korisničko ime za kreiranje pošiljki.",
                        ),
                        width: "50%",
                      },
                    },
                    {
                      name: "password",
                      type: "text",
                      label: localizedLabel("Password / token", "Lozinka / token"),
                      admin: {
                        description: localizedLabel(
                          "GLS API password or token used for shipment creation.",
                          "GLS API lozinka ili token za kreiranje pošiljki.",
                        ),
                        width: "50%",
                      },
                    },
                  ],
                },
              ],
              groupLabel: {
                en: "GLS configuration",
                hr: "GLS konfiguracija",
              },
              name: "gls",
            }),
            createDeliveryMethodGroup({
              apiFields: [
                {
                  name: "originId",
                  type: "text",
                  label: localizedLabel("Origin ID", "Origin ID"),
                  admin: {
                    width: "25%",
                  },
                },
                {
                  name: "partnerId",
                  type: "text",
                  label: localizedLabel("Partner ID", "Partner ID"),
                  admin: {
                    width: "25%",
                  },
                },
              ],
              defaults: {
                description: "Preuzimanje narudžbe u BOX NOW paketomatu po vašem izboru.",
                disabledLabel: "Trenutno nedostupno",
                label: "BOX NOW paketomat",
                price: 4.5,
              },
              extraFields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "widgetScriptUrl",
                      type: "text",
                      label: localizedLabel("Widget script URL", "URL skripte komponente"),
                      admin: {
                        width: "100%",
                      },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "typeOfService",
                      type: "text",
                      label: localizedLabel("Type of service", "Vrsta usluge"),
                      admin: {
                        description: localizedLabel(
                          "BOX NOW service value used in delivery request creation, for example next-day.",
                          "BOX NOW vrijednost usluge koja se koristi pri kreiranju delivery requesta, na primjer next-day.",
                        ),
                        width: "34%",
                      },
                    },
                    {
                      name: "paymentMode",
                      type: "select",
                      label: localizedLabel("Payment mode", "Način naplate"),
                      defaultValue: "prepaid",
                      options: [
                        {
                          label: localizedLabel("Prepaid", "Prepaid"),
                          value: "prepaid",
                        },
                        {
                          label: localizedLabel("Cash on delivery", "Pouzeće"),
                          value: "cod",
                        },
                      ],
                      admin: {
                        description: localizedLabel(
                          "Payment mode sent to BOX NOW when creating the delivery request.",
                          "Način naplate koji se šalje BOX NOW-u pri kreiranju delivery requesta.",
                        ),
                        width: "33%",
                      },
                    },
                    {
                      name: "compartmentSize",
                      type: "number",
                      min: 1,
                      max: 3,
                      label: localizedLabel("Compartment size", "Veličina pretinca"),
                      admin: {
                        description: localizedLabel(
                          "Required when BOX NOW origin is any-apm. Use 1 small, 2 medium, 3 large.",
                          "Obavezno kada je BOX NOW origin any-apm. Koristi 1 malo, 2 srednje, 3 veliko.",
                        ),
                        width: "33%",
                      },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "clientId",
                      type: "text",
                      label: localizedLabel("Client ID", "Client ID"),
                      admin: {
                        description: localizedLabel(
                          "BOX NOW API client ID used for authentication.",
                          "BOX NOW API client ID za autentikaciju.",
                        ),
                        width: "50%",
                      },
                    },
                    {
                      name: "clientSecret",
                      type: "text",
                      label: localizedLabel("Client secret", "Client secret"),
                      admin: {
                        description: localizedLabel(
                          "BOX NOW API client secret used for authentication.",
                          "BOX NOW API client secret za autentikaciju.",
                        ),
                        width: "50%",
                      },
                    },
                  ],
                },
              ],
              groupLabel: {
                en: "BOX NOW configuration",
                hr: "BOX NOW konfiguracija",
              },
              name: "boxNow",
            }),
          ],
        },
      ],
    },
  ],
  label: localizedLabel("Store Settings", "Postavke trgovine"),
};

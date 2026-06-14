import type { CollectionConfig, Field, PayloadRequest } from "payload";
import { ValidationError } from "payload";

import { isAdmin, publicRead } from "../access";
import { ritualSlugField } from "../fields/ritual-slug-field";
import { fetchMoralisProductByItemID } from "../integrations/moralis/client";
import { mapMoralisProductToOperationalSnapshot } from "../integrations/moralis/mapper";
import {
  MORALIS_SYNC_CONTEXT_KEY,
  moralisSyncStatusOptions,
} from "../shared/moralis";
import { adminGroups, getLocalizedText, localizedLabel } from "../shared/admin-copy";
import {
  beverageTypeOptions,
  burrTypeOptions,
  coffeeFormOptions,
  compatibleSystemOptions,
  equipmentTypeOptions,
  flavorFamilyOptions,
  flavourOptions,
  netContentUnitOptions,
  physicalFormOptions,
  productFormatOptions,
  productFormOptions,
  teaTypeOptions,
  waterConnectionOptions,
} from "../shared/product-detail-options";
import { productTypeOptions, type ProductTypeValue } from "../shared/product-types";

type ProductDetailOption = {
  label: ReturnType<typeof localizedLabel>;
  value: string;
};

const filterOptions = (
  options: ProductDetailOption[],
  values: string[],
) => options.filter((option) => values.includes(option.value));

const productDetailCondition =
  (productType: ProductTypeValue) =>
  (_: unknown, siblingData: { productType?: ProductTypeValue }) =>
    siblingData.productType === productType;

const productDetailGroupAdmin = (productType: ProductTypeValue) => ({
  condition: productDetailCondition(productType),
  hideGutter: true,
});

const selectField = ({
  hasMany,
  label,
  name,
  options,
  width = "50%",
}: {
  hasMany?: boolean;
  label: ReturnType<typeof localizedLabel>;
  name: string;
  options: ProductDetailOption[];
  width?: string;
}): Field => ({
  name,
  type: "select",
  hasMany,
  label,
  options,
  admin: {
    width,
  },
});

const numberField = ({
  label,
  name,
  width = "50%",
}: {
  label: ReturnType<typeof localizedLabel>;
  name: string;
  width?: string;
}): Field => ({
  name,
  type: "number",
  min: 0,
  label,
  admin: {
    width,
  },
});

const formatField = (values: string[]): Field =>
  selectField({
    label: localizedLabel("Format", "Format"),
    name: "format",
    options: filterOptions(productFormatOptions, values),
  });

const formatNetContentDisplay = (
  amount: unknown,
  unit: unknown,
) => {
  const normalizedAmount =
    typeof amount === "number"
      ? String(amount)
      : typeof amount === "string"
        ? amount.trim()
        : "";
  const normalizedUnit = typeof unit === "string" ? unit.trim() : "";

  return normalizedAmount && normalizedUnit
    ? `${normalizedAmount} ${normalizedUnit}`
    : "";
};

const netContentField = (): Field => ({
  name: "netContent",
  type: "group",
  label: false,
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      name: "generateDisplay",
      type: "checkbox",
      defaultValue: true,
      label: localizedLabel("Generate display label", "Generiraj oznaku prikaza"),
      admin: {
        condition: () => false,
      },
    },
    {
      type: "row",
      fields: [
        numberField({
          label: localizedLabel("Amount", "Količina"),
          name: "amount",
          width: "33.333%",
        }),
        selectField({
          label: localizedLabel("Unit", "Jedinica"),
          name: "unit",
          options: netContentUnitOptions,
          width: "33.333%",
        }),
        {
          name: "display",
          type: "text",
          label: localizedLabel("Display label", "Oznaka prikaza"),
          hooks: {
            beforeValidate: [
              ({ siblingData, value }) => {
                if (siblingData?.generateDisplay === false) {
                  return value;
                }

                return formatNetContentDisplay(
                  siblingData?.amount,
                  siblingData?.unit,
                );
              },
            ],
          },
          admin: {
            components: {
              Field:
                "./_components/product-net-content-display-field.tsx#ProductNetContentDisplayField",
            },
            width: "33.333%",
          },
        },
      ],
    },
  ],
});

const packageUnitsField = (): Field =>
  numberField({
    label: localizedLabel("Package units", "Broj komada"),
    name: "packageUnits",
  });

const compatibleSystemsField = (options = compatibleSystemOptions): Field =>
  selectField({
    hasMany: true,
    label: localizedLabel("Compatible systems", "Kompatibilni sustavi"),
    name: "compatibleSystems",
    options,
  });

const flagOptions = [
  {
    label: localizedLabel("Decaf", "Bez kofeina"),
    value: "decaf",
  },
  {
    label: localizedLabel("Organic", "BIO"),
    value: "organic",
  },
];

const flagsField = (flags: Array<"decaf" | "organic">): Field => ({
  name: "flags",
  type: "select",
  hasMany: true,
  label: localizedLabel("Flags", "Oznake"),
  options: flagOptions.filter((option): option is (typeof flagOptions)[number] =>
    flags.includes(option.value as "decaf" | "organic"),
  ),
  admin: {
    width: "50%",
  },
});

const normalizeRelationshipIDs = (value: unknown): (number | string)[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return entry;
      }

      if (entry && typeof entry === "object" && "id" in entry) {
        const id = entry.id;

        return typeof id === "string" || typeof id === "number" ? id : null;
      }

      return null;
    })
    .filter((entry): entry is number | string => entry !== null);
};

const validateProductCategories = async (
  value: unknown,
  {
    req,
    siblingData,
  }: {
    req: PayloadRequest;
    siblingData?: { productType?: ProductTypeValue };
  },
) => {
  if (!Array.isArray(value) || value.length === 0 || !siblingData?.productType) {
    return true;
  }

  const ids = normalizeRelationshipIDs(value);

  if (ids.length === 0) {
    return true;
  }

  const result = await req.payload.find({
    collection: "categories",
    depth: 0,
    limit: ids.length,
    pagination: false,
    req,
    where: {
      id: {
        in: ids,
      },
    },
  });

  const invalidCategories = result.docs.filter((category) => {
    const categoryRecord = category as {
      allowedProductTypes?: unknown;
      title?: unknown;
    };

    if (
      !Array.isArray(categoryRecord.allowedProductTypes) ||
      categoryRecord.allowedProductTypes.length === 0
    ) {
      return false;
    }

    return !categoryRecord.allowedProductTypes.includes(siblingData.productType);
  });

  if (invalidCategories.length === 0) {
    return true;
  }

  return getLocalizedText({
    en: `Selected categories do not support ${siblingData.productType}: ${invalidCategories
      .map((category) =>
        typeof category.title === "string" ? category.title : "Untitled",
      )
      .join(", ")}`,
    hr: `Odabrane kategorije ne podržavaju vrstu ${siblingData.productType}: ${invalidCategories
      .map((category) =>
        typeof category.title === "string" ? category.title : "Bez naziva",
      )
      .join(", ")}`,
    req,
  });
};

const ensurePrimaryCategoryMatchesType: NonNullable<
  CollectionConfig["hooks"]
>["beforeValidate"] = [
  async ({ data, originalDoc, req }) => {
    const productType = (data?.productType ?? originalDoc?.productType) as
      | ProductTypeValue
      | undefined;
    const categories = data?.categories ?? originalDoc?.categories;

    if (!productType || !categories) {
      return data;
    }

    const validationResult = await validateProductCategories(categories, {
      req,
      siblingData: { productType },
    });

    if (validationResult !== true) {
      throw new ValidationError({
        errors: [
          {
            message: validationResult,
            path: "categories",
          },
        ],
      });
    }

    return data;
  },
];

const moralisSyncControlledFields = [
  "sku",
  "price",
  "stockQuantity",
  "isAvailable",
  "barcode",
  "unit",
  "taxRate",
  "lastSyncedAt",
  "lastSyncStatus",
  "lastSyncError",
  "rawOperationalData",
] as const;

const preserveMoralisOperationalFields: NonNullable<
  CollectionConfig["hooks"]
>["beforeChange"] = [
  ({ context, data, originalDoc }) => {
    if (!data?.moralis || context?.[MORALIS_SYNC_CONTEXT_KEY]) {
      return data;
    }

    const nextMoralis = {
      ...data.moralis,
    } as Record<string, unknown>;
    const originalMoralis = (originalDoc?.moralis ?? {}) as Record<string, unknown>;

    for (const field of moralisSyncControlledFields) {
      if (field in originalMoralis) {
        nextMoralis[field] = originalMoralis[field];
        continue;
      }

      if (field === "isAvailable") {
        nextMoralis[field] = false;
        continue;
      }

      if (field === "lastSyncStatus") {
        nextMoralis[field] = "never-synced";
        continue;
      }

      nextMoralis[field] = null;
    }

    data.moralis = nextMoralis;

    return data;
  },
];

const validateAndHydrateMoralisBinding: NonNullable<
  CollectionConfig["hooks"]
>["beforeChange"] = [
  async ({ context, data, operation, originalDoc, req }) => {
    if (context?.[MORALIS_SYNC_CONTEXT_KEY] || !data?.moralis) {
      return data;
    }

    const nextItemID = data.moralis.itemID?.trim();
    const previousItemID = originalDoc?.moralis?.itemID?.trim();
    const shouldValidateBinding =
      !!nextItemID &&
      (operation === "create" || nextItemID !== previousItemID);

    if (!shouldValidateBinding) {
      return data;
    }

    const sourceProduct = await fetchMoralisProductByItemID(nextItemID);

    if (!sourceProduct) {
      throw new ValidationError({
        errors: [
          {
            message: getLocalizedText({
              en: `Moralis item "${nextItemID}" was not found.`,
              hr: `Moralis artikl "${nextItemID}" nije pronađen.`,
              req,
            }),
            path: "moralis.itemID",
          },
        ],
      });
    }

    data.moralis = mapMoralisProductToOperationalSnapshot(sourceProduct);

    return data;
  },
];

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: [
      "title",
      "productType",
      "brand",
      "status",
      "updatedAt",
    ],
    group: adminGroups.catalogue,
    useAsTitle: "title",
  },
  labels: {
    plural: localizedLabel("Products", "Proizvodi"),
    singular: localizedLabel("Product", "Proizvod"),
  },
  hooks: {
    beforeChange: [
      ...preserveMoralisOperationalFields,
      ...validateAndHydrateMoralisBinding,
    ],
    beforeValidate: ensurePrimaryCategoryMatchesType,
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
              label: localizedLabel("Title", "Naziv"),
            },
            {
              type: "row",
              fields: [
                {
                  name: "categories",
                  type: "relationship",
                  relationTo: "categories",
                  hasMany: true,
                  required: true,
                  validate: validateProductCategories,
                  admin: {
                    width: "50%",
                  },
                  label: localizedLabel("Categories", "Kategorije"),
                },
                {
                  name: "badges",
                  type: "select",
                  hasMany: true,
                  options: [
                    {
                      label: localizedLabel("New", "Novo"),
                      value: "new",
                    },
                    {
                      label: localizedLabel("Best Seller", "Najprodavanije"),
                      value: "best-seller",
                    },
                    {
                      label: localizedLabel("Limited Edition", "Ograničeno izdanje"),
                      value: "limited",
                    },
                    {
                      label: localizedLabel("Sale", "Akcija"),
                      value: "sale",
                    },
                  ],
                  admin: {
                    width: "50%",
                  },
                  label: localizedLabel("Badges", "Oznake"),
                },
              ],
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: localizedLabel("Hero image", "Hero slika"),
            },
          ],
        },
        {
          label: localizedLabel("Content", "Sadržaj"),
          fields: [
            {
              name: "notes",
              type: "array",
              label: localizedLabel("Descriptor notes", "Opisne oznake"),
              labels: {
                plural: localizedLabel("Descriptor notes", "Opisne oznake"),
                singular: localizedLabel("Descriptor note", "Opisna oznaka"),
              },
              admin: {
                components: {
                  RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                },
                description: localizedLabel(
                  "Short customer-facing descriptors rendered as PDP pills.",
                  "Kratke kupcu vidljive oznake koje se prikazuju kao PDP pillovi.",
                ),
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: localizedLabel("Label", "Oznaka"),
                },
              ],
            },
            {
              name: "description",
              type: "textarea",
              label: localizedLabel("Description", "Opis"),
            },
            {
              name: "specifications",
              type: "array",
              label: localizedLabel("Specifications", "Specifikacije"),
              labels: {
                plural: localizedLabel("Specifications", "Specifikacije"),
                singular: localizedLabel("Specification", "Specifikacija"),
              },
              admin: {
                components: {
                  RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
                },
                description: localizedLabel(
                  "Customer-facing PDP table rows. These do not drive filters.",
                  "Kupcu vidljivi redovi PDP tablice. Ne koriste se za filtere.",
                ),
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      required: true,
                      label: localizedLabel("Label", "Oznaka"),
                      admin: {
                        width: "50%",
                      },
                    },
                    {
                      name: "value",
                      type: "text",
                      required: true,
                      label: localizedLabel("Value", "Vrijednost"),
                      admin: {
                        width: "50%",
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: "relatedProducts",
              type: "relationship",
              relationTo: "products",
              hasMany: true,
              label: localizedLabel("Related products", "Povezani proizvodi"),
            },
          ],
        },
        {
          label: localizedLabel("Details", "Detalji"),
          fields: [
            {
              name: "singleServeDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("single_serve_beverage"),
              fields: [
                {
                  type: "row",
                  fields: [
                    formatField(["capsules", "pods"]),
                    selectField({
                      label: localizedLabel("Beverage type", "Vrsta napitka"),
                      name: "beverageType",
                      options: filterOptions(beverageTypeOptions, ["coffee", "milk", "tea"]),
                    }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    compatibleSystemsField(
                      filterOptions(compatibleSystemOptions, [
                        "ese_44_mm",
                        "lavazza_a_modo_mio",
                        "lavazza_blue",
                        "lavazza_espresso_point",
                        "tchibo_cafissimo",
                      ]),
                    ),
                    packageUnitsField(),
                  ],
                },
                netContentField(),
                flagsField(["decaf"]),
              ],
            },
            {
              name: "packagedCoffeeDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("packaged_coffee"),
              fields: [
                {
                  type: "row",
                  fields: [
                    formatField(["beans", "ground"]),
                    packageUnitsField(),
                  ],
                },
                netContentField(),
                flagsField(["decaf", "organic"]),
              ],
            },
            {
              name: "equipmentDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("equipment"),
              fields: [
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Equipment type", "Vrsta opreme"),
                      name: "equipmentType",
                      options: equipmentTypeOptions,
                    }),
                    compatibleSystemsField(
                      filterOptions(compatibleSystemOptions, [
                        "animo_optime",
                        "lavazza_blue",
                      ]),
                    ),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Water connection", "Priključak vode"),
                      name: "waterConnection",
                      options: waterConnectionOptions,
                    }),
                    selectField({
                      label: localizedLabel("Burr type", "Vrsta noževa"),
                      name: "burrType",
                      options: burrTypeOptions,
                    }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    numberField({
                      label: localizedLabel("Power (W)", "Snaga (W)"),
                      name: "powerW",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Rated power (W)", "Nazivna snaga (W)"),
                      name: "ratedPowerW",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Water tank (L)", "Spremnik vode (L)"),
                      name: "waterTankL",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Groups", "Broj grupa"),
                      name: "groupCount",
                      width: "25%",
                    }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    numberField({
                      label: localizedLabel("Burr diameter (mm)", "Promjer noževa (mm)"),
                      name: "burrDiameterMm",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Ingredient canisters", "Spremnici za sastojke"),
                      name: "ingredientCanistersCount",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Direct selections", "Direktni odabiri"),
                      name: "directSelections",
                      width: "25%",
                    }),
                    numberField({
                      label: localizedLabel("Hourly capacity (L)", "Satni kapacitet (L)"),
                      name: "hourCapacityL",
                      width: "25%",
                    }),
                  ],
                },
              ],
            },
            {
              name: "accessoryDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("accessory"),
              fields: [
                {
                  type: "row",
                  fields: [
                    compatibleSystemsField(
                      filterOptions(compatibleSystemOptions, ["animo_optime"]),
                    ),
                    packageUnitsField(),
                  ],
                },
                numberField({
                  label: localizedLabel("Power (W)", "Snaga (W)"),
                  name: "powerW",
                }),
              ],
            },
            {
              name: "drinkMixDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("drink_mix_ingredient"),
              fields: [
                {
                  type: "row",
                  fields: [
                    formatField(["powder", "sachets", "syrup"]),
                    selectField({
                      label: localizedLabel("Beverage type", "Vrsta napitka"),
                      name: "beverageType",
                      options: filterOptions(beverageTypeOptions, [
                        "chai_latte",
                        "coffee",
                        "ginseng",
                        "hot_chocolate",
                        "matcha_latte",
                        "milk",
                        "pumpkin_spice_latte",
                        "white_chocolate",
                      ]),
                    }),
                  ],
                },
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Physical form", "Fizički oblik"),
                      name: "physicalForm",
                      options: filterOptions(physicalFormOptions, [
                        "powder",
                        "sachets",
                        "sticks",
                        "syrup",
                      ]),
                    }),
                    selectField({
                      label: localizedLabel("Coffee form", "Oblik kave"),
                      name: "coffeeForm",
                      options: coffeeFormOptions,
                    }),
                  ],
                },
                selectField({
                  label: localizedLabel("Flavour", "Okus"),
                  name: "flavour",
                  options: filterOptions(flavourOptions, [
                    "hazelnut",
                    "salted_caramel",
                    "vanilla",
                  ]),
                }),
                packageUnitsField(),
                netContentField(),
                flagsField(["decaf"]),
              ],
            },
            {
              name: "technicalConsumableDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("technical_consumable"),
              fields: [
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Physical form", "Fizički oblik"),
                      name: "physicalForm",
                      options: filterOptions(physicalFormOptions, ["cartridge"]),
                    }),
                    compatibleSystemsField(
                      filterOptions(compatibleSystemOptions, [
                        "coffee_machines",
                        "combi_steamers",
                        "espresso_machines",
                        "horeca_beverage_equipment",
                        "ovens",
                        "vending_machines",
                      ]),
                    ),
                  ],
                },
                flagsField(["organic"]),
              ],
            },
            {
              name: "teaMatchaDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("tea_matcha"),
              fields: [
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Tea type", "Vrsta čaja"),
                      name: "teaType",
                      options: teaTypeOptions,
                    }),
                    selectField({
                      label: localizedLabel("Flavor family", "Obitelj okusa"),
                      name: "flavorFamily",
                      options: flavorFamilyOptions,
                    }),
                  ],
                },
                packageUnitsField(),
                netContentField(),
                flagsField(["organic"]),
              ],
            },
            {
              name: "coldBeverageDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("cold_beverage_concentrate"),
              fields: [
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Beverage type", "Vrsta napitka"),
                      name: "beverageType",
                      options: filterOptions(beverageTypeOptions, ["juice_concentrate"]),
                    }),
                    selectField({
                      label: localizedLabel("Flavour", "Okus"),
                      name: "flavour",
                      options: filterOptions(flavourOptions, ["apple"]),
                    }),
                  ],
                },
                packageUnitsField(),
                netContentField(),
              ],
            },
            {
              name: "confectioneryDetails",
              type: "group",
              label: false,
              admin: productDetailGroupAdmin("confectionery_snack"),
              fields: [
                {
                  type: "row",
                  fields: [
                    selectField({
                      label: localizedLabel("Product form", "Oblik proizvoda"),
                      name: "productForm",
                      options: productFormOptions,
                    }),
                    packageUnitsField(),
                  ],
                },
                netContentField(),
                flagsField(["decaf"]),
              ],
            },
          ],
        },
        {
          label: localizedLabel("Inventory", "Zaliha"),
          fields: [
            {
              name: "moralis",
              type: "group",
              label: localizedLabel("Moralis", "Moralis"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "itemID",
                      type: "text",
                      unique: true,
                      required: true,
                      label: localizedLabel("Item ID", "ID artikla"),
                      admin: {
                        description: localizedLabel(
                          "Internal Moralis reference mapped to SIF_ART.",
                          "Interna Moralis referenca povezana s SIF_ART.",
                        ),
                        width: "50%",
                      },
                    },
                    {
                      name: "sku",
                      type: "text",
                      unique: true,
                      label: localizedLabel("SKU", "SKU"),
                      admin: {
                        description: localizedLabel(
                          "Synced from Moralis and shown here for reference only.",
                          "Sinkronizirano iz Moralisa i prikazano samo kao referenca.",
                        ),
                        readOnly: true,
                        width: "50%",
                      },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "price",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Price", "Cijena"),
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                    {
                      name: "stockQuantity",
                      type: "number",
                      label: localizedLabel("Stock quantity", "Količina na zalihi"),
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                    {
                      name: "availabilityStatus",
                      type: "select",
                      virtual: true,
                      label: localizedLabel("Availability", "Dostupnost"),
                      options: [
                        {
                          label: localizedLabel("In stock", "Na zalihi"),
                          value: "available",
                        },
                        {
                          label: localizedLabel("Unavailable", "Nedostupno"),
                          value: "unavailable",
                        },
                      ],
                      hooks: {
                        afterRead: [
                          ({ siblingData }) =>
                            siblingData?.isAvailable ? "available" : "unavailable",
                        ],
                      },
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                  ],
                },
                {
                  name: "isAvailable",
                  type: "checkbox",
                  defaultValue: false,
                  label: localizedLabel("Available", "Dostupno"),
                  admin: {
                    condition: () => false,
                    readOnly: true,
                  },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "barcode",
                      type: "text",
                      label: localizedLabel("Barcode", "Barkod"),
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                    {
                      name: "unit",
                      type: "text",
                      label: localizedLabel("Unit", "Jedinica"),
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                    {
                      name: "taxRate",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Tax rate", "Porezna stopa"),
                      admin: {
                        readOnly: true,
                        width: "33.333%",
                      },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "lastSyncStatus",
                      type: "select",
                      defaultValue: "never-synced",
                      label: localizedLabel("Last sync status", "Status zadnje sinkronizacije"),
                      options: moralisSyncStatusOptions,
                      admin: {
                        readOnly: true,
                        width: "50%",
                      },
                    },
                    {
                      name: "lastSyncedAt",
                      type: "date",
                      label: localizedLabel("Last synced at", "Zadnja sinkronizacija"),
                      admin: {
                        date: {
                          pickerAppearance: "dayAndTime",
                        },
                        readOnly: true,
                        width: "50%",
                      },
                    },
                  ],
                },
                {
                  name: "lastSyncError",
                  type: "textarea",
                  label: localizedLabel("Last sync error", "Greška zadnje sinkronizacije"),
                  admin: {
                    condition: () => false,
                    readOnly: true,
                  },
                },
                {
                  name: "rawOperationalData",
                  type: "json",
                  label: localizedLabel("Raw operational data", "Izvorni operativni podaci"),
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        {
          label: localizedLabel("Draft", "Skica"),
          value: "draft",
        },
        {
          label: localizedLabel("Active", "Aktivno"),
          value: "active",
        },
        {
          label: localizedLabel("Archived", "Arhivirano"),
          value: "archived",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Status", "Status"),
    },
    {
      name: "productType",
      type: "select",
      required: true,
      options: productTypeOptions,
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Product type", "Vrsta proizvoda"),
    },
    ritualSlugField({
      position: "sidebar",
      useAsSlug: "title",
    }),
    {
      name: "catalogReviewStatus",
      type: "select",
      required: true,
      defaultValue: "ready",
      options: [
        {
          label: localizedLabel("Ready", "Spremno"),
          value: "ready",
        },
        {
          label: localizedLabel("Review required", "Potrebna provjera"),
          value: "review_required",
        },
        {
          label: localizedLabel("Do not publish", "Ne objavljivati"),
          value: "do_not_publish",
        },
      ],
      admin: {
        description: localizedLabel(
          "Review-required products should use raw Moralis fallback content instead of enriched product facts.",
          "Proizvodi za provjeru koriste izvorni Moralis fallback sadržaj umjesto obogaćenih podataka.",
        ),
        position: "sidebar",
      },
      label: localizedLabel("Catalog review", "Katalog provjera"),
    },
    {
      name: "brand",
      type: "relationship",
      relationTo: "brands",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Brand", "Brend"),
    },
  ],
};

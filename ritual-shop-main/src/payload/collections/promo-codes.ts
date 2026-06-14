import type { CollectionConfig } from "payload";
import { ValidationError } from "payload";

import { isAdmin } from "../access";
import { adminGroups, localizedLabel } from "../shared/admin-copy";
import { normalizePromoCodeInput } from "./carts/promo-contract";

function normalizeRelationshipIDs(value: unknown): Array<number | string> {
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
}

export const PromoCodes: CollectionConfig = {
  slug: "promo-codes",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["code", "name", "status", "updatedAt"],
    group: adminGroups.commerce,
    useAsTitle: "code",
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) {
          return data;
        }

        const application = {
          ...(originalDoc?.application ?? {}),
          ...(data.application ?? {}),
        } as {
          amountOff?: number | null;
          brands?: unknown;
          categories?: unknown;
          discountType?: "fixed" | "percent";
          firstOrderOnly?: "no" | "yes";
          percentOff?: number | null;
          scope?: "brand" | "cart" | "category";
        };
        const errors: Array<{ message: string; path: string }> = [];
        const discountType = application.discountType;
        const scope = application.scope;
        const percentOff = application.percentOff;
        const amountOff = application.amountOff;
        const brands = application.brands;
        const categories = application.categories;

        data.code = normalizePromoCodeInput(data.code) ?? "";
        data.application = application;

        if (
          discountType === "percent" &&
          !(typeof percentOff === "number" && Number.isFinite(percentOff) && percentOff > 0 && percentOff <= 100)
        ) {
          errors.push({
            message: "Percent discount must be between 0 and 100.",
            path: "application.percentOff",
          });
        }

        if (
          discountType === "fixed" &&
          !(typeof amountOff === "number" && Number.isFinite(amountOff) && amountOff > 0)
        ) {
          errors.push({
            message: "Fixed discount must be greater than 0.",
            path: "application.amountOff",
          });
        }

        if (scope === "brand" && normalizeRelationshipIDs(brands).length === 0) {
          errors.push({
            message: "Select at least one brand for a brand promo code.",
            path: "application.brands",
          });
        }

        if (scope === "category" && normalizeRelationshipIDs(categories).length === 0) {
          errors.push({
            message: "Select at least one category for a category promo code.",
            path: "application.categories",
          });
        }

        if (errors.length > 0) {
          throw new ValidationError({
            errors,
          });
        }

        if (discountType !== "percent") {
          data.application.percentOff = null;
        }

        if (discountType !== "fixed") {
          data.application.amountOff = null;
        }

        if (scope !== "brand") {
          data.application.brands = [];
        }

        if (scope !== "category") {
          data.application.categories = [];
        }

        return data;
      },
    ],
  },
  labels: {
    plural: localizedLabel("Promo Codes", "Promo kodovi"),
    singular: localizedLabel("Promo Code", "Promo kod"),
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "code",
          type: "text",
          required: true,
          unique: true,
          admin: {
            width: "50%",
          },
          label: localizedLabel("Code", "Kod"),
        },
        {
          name: "name",
          type: "text",
          required: true,
          admin: {
            width: "50%",
          },
          label: localizedLabel("Name", "Naziv"),
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
          label: localizedLabel("Active", "Aktivno"),
          value: "active",
        },
        {
          label: localizedLabel("Inactive", "Neaktivno"),
          value: "inactive",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Status", "Status"),
    },
    {
      name: "description",
      type: "textarea",
      label: localizedLabel("Description", "Opis"),
    },
    {
      name: "application",
      type: "group",
      label: false,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "discountType",
              type: "select",
              required: true,
              defaultValue: "percent",
              options: [
                {
                  label: localizedLabel("Percent", "Postotak"),
                  value: "percent",
                },
                {
                  label: localizedLabel("Fixed amount", "Fiksni iznos"),
                  value: "fixed",
                },
              ],
              admin: {
                width: "50%",
              },
              label: localizedLabel("Discount type", "Vrsta popusta"),
            },
            {
              name: "percentOff",
              type: "number",
              min: 0.01,
              max: 100,
              admin: {
                condition: (_, siblingData) => siblingData.discountType === "percent",
                width: "50%",
              },
              label: localizedLabel("Percent off", "Postotak popusta"),
            },
            {
              name: "amountOff",
              type: "number",
              min: 0.01,
              admin: {
                condition: (_, siblingData) => siblingData.discountType === "fixed",
                width: "50%",
              },
              label: localizedLabel("Amount off", "Iznos popusta"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "scope",
              type: "select",
              required: true,
              defaultValue: "cart",
              options: [
                {
                  label: localizedLabel("Whole cart", "Cijela košarica"),
                  value: "cart",
                },
                {
                  label: localizedLabel("Brand", "Brend"),
                  value: "brand",
                },
                {
                  label: localizedLabel("Category", "Kategorija"),
                  value: "category",
                },
              ],
              admin: {
                style: {
                  flex: "1 1 0",
                },
              },
              label: localizedLabel("Scope", "Opseg"),
            },
            {
              name: "brands",
              type: "relationship",
              relationTo: "brands",
              hasMany: true,
              admin: {
                condition: (_, siblingData) => siblingData.scope === "brand",
                style: {
                  flex: "1 1 0",
                },
              },
              label: localizedLabel("Eligible brands", "Dopušteni brendovi"),
            },
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              hasMany: true,
              admin: {
                condition: (_, siblingData) => siblingData.scope === "category",
                style: {
                  flex: "1 1 0",
                },
              },
              label: localizedLabel("Eligible categories", "Dopuštene kategorije"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "minimumSubtotal",
              type: "number",
              min: 0,
              admin: {
                width: "50%",
              },
              label: localizedLabel("Minimum subtotal", "Minimalni međuzbroj"),
            },
            {
              name: "firstOrderOnly",
              type: "radio",
              defaultValue: "no",
              admin: {
                layout: "horizontal",
                width: "50%",
              },
              label: localizedLabel("First order only", "Samo prva narudžba"),
              options: [
                {
                  label: localizedLabel("No", "Ne"),
                  value: "no",
                },
                {
                  label: localizedLabel("Yes", "Da"),
                  value: "yes",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "limits",
      type: "group",
      label: false,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "maxUsesPerCustomer",
              type: "number",
              min: 1,
              admin: {
                width: "50%",
              },
              label: localizedLabel("Max uses per customer", "Maksimalno korištenja po kupcu"),
            },
            {
              name: "maxUsesTotal",
              type: "number",
              min: 1,
              admin: {
                width: "50%",
              },
              label: localizedLabel("Max total uses", "Maksimalno ukupnih korištenja"),
            },
          ],
        },
      ],
    },
    {
      name: "schedule",
      type: "group",
      label: false,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "startsAt",
              type: "date",
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
                width: "50%",
              },
              label: localizedLabel("Starts at", "Počinje"),
            },
            {
              name: "endsAt",
              type: "date",
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
                width: "50%",
              },
              label: localizedLabel("Ends at", "Završava"),
            },
          ],
        },
      ],
    },
  ],
};

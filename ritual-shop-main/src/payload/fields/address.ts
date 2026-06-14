import type { Field } from "payload";

import { localizedLabel } from "../shared/admin-copy";

type AddressFieldOptions = {
  includeDefaultFlag?: boolean;
  prefix?: string;
  required?: boolean;
};

const withPrefix = (prefix: string | undefined, name: string) =>
  prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name;

export const addressFields = ({
  includeDefaultFlag = false,
  prefix,
  required = true,
}: AddressFieldOptions = {}): Field[] => {
  const fields: Field[] = [
    {
      type: "row",
      fields: [
        {
          name: withPrefix(prefix, "firstName"),
          type: "text",
          required,
          label: localizedLabel("First name", "Ime"),
        },
        {
          name: withPrefix(prefix, "lastName"),
          type: "text",
          required,
          label: localizedLabel("Last name", "Prezime"),
        },
      ],
    },
    {
      name: withPrefix(prefix, "isBusiness"),
      type: "checkbox",
      defaultValue: false,
      label: localizedLabel("Business invoice", "R1 račun"),
    },
    {
      type: "row",
      fields: [
        {
          name: withPrefix(prefix, "company"),
          type: "text",
          label: localizedLabel("Company", "Tvrtka"),
        },
        {
          name: withPrefix(prefix, "taxId"),
          type: "text",
          label: localizedLabel("Tax ID", "OIB / VAT ID"),
        },
        {
          name: withPrefix(prefix, "phone"),
          type: "text",
          label: localizedLabel("Phone", "Telefon"),
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: withPrefix(prefix, "addressLine1"),
          type: "text",
          required,
          label: localizedLabel("Address line 1", "Adresa 1"),
        },
        {
          name: withPrefix(prefix, "addressLine2"),
          type: "text",
          label: localizedLabel("Address line 2", "Adresa 2"),
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: withPrefix(prefix, "city"),
          type: "text",
          required,
          label: localizedLabel("City", "Grad"),
        },
        {
          name: withPrefix(prefix, "postalCode"),
          type: "text",
          required,
          label: localizedLabel("Postal code", "Poštanski broj"),
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: withPrefix(prefix, "region"),
          type: "text",
          label: localizedLabel("Region", "Regija"),
        },
        {
          name: withPrefix(prefix, "country"),
          type: "text",
          required,
          defaultValue: "Croatia",
          label: localizedLabel("Country", "Država"),
        },
      ],
    },
  ];

  if (includeDefaultFlag) {
    fields.unshift({
      name: withPrefix(prefix, "isDefault"),
      type: "checkbox",
      defaultValue: false,
      label: localizedLabel("Default address", "Zadana adresa"),
    });
  }

  return fields;
};

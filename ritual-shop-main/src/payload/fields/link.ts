import type { Field } from "payload";

import { getLocalizedText, localizedLabel } from "../shared/admin-copy";

type LocalizedValue = ReturnType<typeof localizedLabel>;

type FieldCondition = NonNullable<NonNullable<Field["admin"]>["condition"]>;

type LinkFieldsOptions = {
  allowEmpty?: boolean;
  condition?: FieldCondition;
  dbNamePrefix: string;
  externalDescription?: LocalizedValue | string;
  internalDescription?: LocalizedValue | string;
  namePrefix: string;
  relationTo: string | string[];
};

type LinkSiblingData = {
  [key: string]: unknown;
};

const getFieldName = (namePrefix: string, suffix: string) => `${namePrefix}${suffix}`;

const getLinkType = (namePrefix: string, siblingData?: LinkSiblingData) => {
  const value = siblingData?.[getFieldName(namePrefix, "Type")];

  return typeof value === "string" ? value : undefined;
};

const validateExternalURL =
  (allowEmpty: boolean, namePrefix: string) =>
  (
    value: string | null | undefined,
    { req, siblingData }: { req?: any; siblingData?: LinkSiblingData },
  ) => {
    if (getLinkType(namePrefix, siblingData) !== "external") {
      return true;
    }

    if (allowEmpty) {
      return true;
    }

    if (typeof value !== "string" || value.trim().length === 0) {
      return getLocalizedText({
        en: "This field is required.",
        hr: "Ovo polje je obavezno.",
        req,
      });
    }

    return true;
  };

const validateInternalReference =
  (allowEmpty: boolean, namePrefix: string) =>
  (value: unknown, { req, siblingData }: { req?: any; siblingData?: LinkSiblingData }) => {
    if (getLinkType(namePrefix, siblingData) !== "internal") {
      return true;
    }

    if (allowEmpty) {
      return true;
    }

    if (!value) {
      return getLocalizedText({
        en: "This field is required.",
        hr: "Ovo polje je obavezno.",
        req,
      });
    }

    return true;
  };

export const buildLinkFields = ({
  allowEmpty = false,
  condition,
  dbNamePrefix,
  externalDescription = localizedLabel(
    "Enter a full URL or relative path.",
    "Unesite puni URL ili relativnu putanju.",
  ),
  internalDescription = localizedLabel(
    "Select an internal page.",
    "Odaberite internu stranicu.",
  ),
  namePrefix,
  relationTo,
}: LinkFieldsOptions): Field[] => [
  {
    type: "row",
    admin: {
      condition,
    },
    fields: [
      {
        name: getFieldName(namePrefix, "Type"),
        type: "radio",
        dbName: `${dbNamePrefix}_type`,
        enumName: `${dbNamePrefix}_type_enum`,
        required: true,
        defaultValue: "internal",
        label: localizedLabel("Type", "Vrsta"),
        admin: {
          condition,
          layout: "horizontal",
          width: "50%",
        },
        options: [
          {
            label: localizedLabel("Internal", "Interno"),
            value: "internal",
          },
          {
            label: localizedLabel("External", "Vanjsko"),
            value: "external",
          },
        ],
      },
      {
        name: getFieldName(namePrefix, "OpenInNewTab"),
        type: "checkbox",
        label: localizedLabel("Open in new tab", "Otvori u novoj kartici"),
        admin: {
          condition,
          style: {
            alignSelf: "flex-end",
          },
          width: "50%",
        },
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: getFieldName(namePrefix, "Reference"),
        type: "relationship",
        relationTo: relationTo as any,
        label: localizedLabel("Reference", "Referenca"),
        admin: {
          condition: (data, siblingData: LinkSiblingData, args) =>
            (condition ? condition(data, siblingData, args) : true) &&
            getLinkType(namePrefix, siblingData) === "internal",
          description: internalDescription,
          width: "50%",
        },
        validate: validateInternalReference(allowEmpty, namePrefix),
      },
      {
        name: getFieldName(namePrefix, "Anchor"),
        type: "text",
        label: localizedLabel("Anchor", "Sidro"),
        admin: {
          condition: (data, siblingData: LinkSiblingData, args) =>
            (condition ? condition(data, siblingData, args) : true) &&
            getLinkType(namePrefix, siblingData) === "internal",
          description: localizedLabel(
            "Optional section ID, without the # symbol.",
            "Neobavezni ID sekcije, bez znaka #.",
          ),
          placeholder: localizedLabel("newsletter", "newsletter"),
          width: "50%",
        },
      },
      {
        name: getFieldName(namePrefix, "Url"),
        type: "text",
        label: localizedLabel("URL", "URL"),
        admin: {
          condition: (data, siblingData: LinkSiblingData, args) =>
            (condition ? condition(data, siblingData, args) : true) &&
            getLinkType(namePrefix, siblingData) === "external",
          description: externalDescription,
          width: "100%",
        },
        validate: validateExternalURL(allowEmpty, namePrefix),
      },
    ],
  },
];

import type { Field } from "payload";

import { localizedLabel } from "../shared/admin-copy";

type LocalizedValue = ReturnType<typeof localizedLabel>;

type SectionHeadingFieldsOptions = {
  description?: LocalizedValue | string;
  eyebrowName?: string;
  titleName?: string;
};

export const buildSectionHeadingFields = ({
  description,
  eyebrowName = "eyebrow",
  titleName = "title",
}: SectionHeadingFieldsOptions = {}): Field[] => [
  {
    type: "row",
    fields: [
      {
        name: eyebrowName,
        type: "text",
        admin: {
          description,
          width: "35%",
        },
        label: localizedLabel("Eyebrow", "Nadnaslov"),
      },
      {
        name: titleName,
        type: "text",
        required: true,
        admin: {
          width: "65%",
        },
        label: localizedLabel("Title", "Naslov"),
      },
    ],
  },
];

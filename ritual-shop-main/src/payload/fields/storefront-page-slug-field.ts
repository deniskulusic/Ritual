import { localizedLabel } from "../shared/admin-copy";
import { ritualSlugField } from "./ritual-slug-field";

type StorefrontPageSlugFieldOptions = {
  description?: ReturnType<typeof localizedLabel> | string;
};

export const storefrontPageSlugField = ({
  description = localizedLabel(
    "Keep one document for each live storefront page.",
    "Zadržite jedan dokument za svaku aktivnu stranicu trgovine.",
  ),
}: StorefrontPageSlugFieldOptions = {}) =>
  ritualSlugField({
    position: "sidebar",
    useAsSlug: "title",
    overrides: (field) => ({
      ...field,
      admin: {
        ...field.admin,
        description,
      },
      fields: field.fields.map((subField: any) => {
        if (subField?.name !== "slug") {
          return subField;
        }

        const existingValidate = subField.validate;

        return {
          ...subField,
          unique: true,
          validate: existingValidate,
        };
      }),
    }),
  });

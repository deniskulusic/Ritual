import { slugField } from "payload";

const ritualSlugFieldPath = "./_components/ritual-slug-field.tsx#RitualSlugField";
const transliterationMap: Record<string, string> = {
  Đ: "Dj",
  đ: "dj",
  Ł: "L",
  ł: "l",
  Ø: "O",
  ø: "o",
  Þ: "Th",
  þ: "th",
  Æ: "AE",
  æ: "ae",
  Œ: "OE",
  œ: "oe",
  ß: "ss",
};

type SlugFieldArgs = NonNullable<Parameters<typeof slugField>[0]>;
type PersistedGenerateSlugHookArgs = {
  data?: Record<string, unknown>;
  originalDoc?: Record<string, unknown>;
  req: Parameters<NonNullable<SlugFieldArgs["slugify"]>>[0]["req"];
  value?: boolean | null;
};

const ritualSlugify: NonNullable<SlugFieldArgs["slugify"]> = ({ valueToSlugify }) => {
  if (typeof valueToSlugify !== "string") {
    return undefined;
  }

  return valueToSlugify
    .trim()
    .replace(/[ĐđŁłØøÞþÆæŒœß]/g, (character) => transliterationMap[character] ?? character)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createPersistedGenerateSlugHook = ({
  slugFieldName,
  slugify,
  useAsSlug,
}: {
  slugFieldName: string;
  slugify: NonNullable<SlugFieldArgs["slugify"]>;
  useAsSlug: string;
}) => {
  return async ({ data, originalDoc, req, value }: PersistedGenerateSlugHookArgs) => {
    const isLocked = value === true;

    if (data && isLocked) {
      const valueToSlugify =
        typeof data[useAsSlug] === "string"
          ? data[useAsSlug]
          : typeof originalDoc?.[useAsSlug] === "string"
            ? originalDoc[useAsSlug]
            : undefined;

      data[slugFieldName] =
        (await slugify({
          data,
          req,
          valueToSlugify,
        })) ?? "";
    }

    return isLocked;
  };
};

export const ritualSlugField = (args?: SlugFieldArgs) => {
  const {
    checkboxName = "generateSlug",
    fieldToUse,
    name,
    overrides,
    slugify: customSlugify,
    useAsSlug,
    ...rest
  } = args ?? {};
  const linkedField = fieldToUse || useAsSlug || "title";
  const slugFieldName = name || "slug";
  const resolvedSlugify = customSlugify ?? ritualSlugify;

  return slugField({
    ...rest,
    checkboxName,
    fieldToUse,
    name,
    slugify: resolvedSlugify,
    overrides: (baseField) => {
      const field = (typeof overrides === "function" ? overrides(baseField) : baseField) as any;

      return {
        ...field,
        fields: field.fields.map((subField: any) => {
          if (subField?.name === checkboxName) {
            return {
              ...subField,
              hooks: {
                ...subField.hooks,
                beforeChange: [
                  createPersistedGenerateSlugHook({
                    slugFieldName,
                    slugify: resolvedSlugify,
                    useAsSlug: linkedField,
                  }),
                ],
              },
            };
          }

          if (subField?.name !== slugFieldName) {
            return subField;
          }

          return {
            ...subField,
            admin: {
              ...subField.admin,
              components: {
                ...subField.admin?.components,
                Field: {
                  ...subField.admin?.components?.Field,
                  clientProps: {
                    ...subField.admin?.components?.Field?.clientProps,
                    checkboxName,
                    useAsSlug: linkedField,
                  },
                  path: ritualSlugFieldPath,
                },
              },
            },
          };
        }),
      };
    },
    useAsSlug,
  });
};

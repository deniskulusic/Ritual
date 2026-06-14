"use client";

import { useCallback, useEffect, type MouseEvent } from "react";
import {
  Button,
  FieldLabel,
  TextInput,
  useDocumentInfo,
  useField,
  useForm,
  useFormFields,
  useServerFunctions,
  useTranslation,
} from "@payloadcms/ui";

type RitualSlugFieldProps = {
  checkboxName?: string;
  field: {
    label?: string;
    name: string;
  };
  path?: string;
  readOnly?: boolean;
  useAsSlug: string;
};

export function RitualSlugField({
  field,
  path,
  readOnly: readOnlyFromProps,
  checkboxName = "generateSlug",
  useAsSlug,
}: RitualSlugFieldProps) {
  const { label } = field;
  const { t } = useTranslation();
  const { collectionSlug, globalSlug } = useDocumentInfo();
  const { slugify } = useServerFunctions();
  const resolvedPath = path || field.name;
  const checkboxPath = resolvedPath.includes(".")
    ? `${resolvedPath.slice(0, resolvedPath.lastIndexOf(".") + 1)}${checkboxName}`
    : checkboxName;
  const generateSlugValue = useFormFields(([fields]) => fields?.[checkboxPath]?.value);
  const generateSlugInitialValue = useFormFields(([fields]) => fields?.[checkboxPath]?.initialValue);
  const hasGenerateSlugField =
    typeof generateSlugValue === "boolean" || typeof generateSlugInitialValue === "boolean";
  const isLocked = (generateSlugValue ?? generateSlugInitialValue ?? true) !== false;
  const { setValue, value } = useField<string>({ path: resolvedPath });
  const { setValue: setGenerateSlug } = useField<boolean>({
    path: checkboxPath,
  });
  const { value: sourceValue } = useField<string>({ path: useAsSlug });
  const { getData } = useForm();

  const generateFromSource = useCallback(async () => {
    const formattedSlug = await slugify({
      collectionSlug,
      data: getData(),
      globalSlug,
      path,
      valueToSlugify: sourceValue,
    });

    const nextValue = formattedSlug ?? "";

    if (value !== nextValue) {
      setValue(nextValue);
    }
  }, [
    collectionSlug,
    getData,
    globalSlug,
    path,
    setValue,
    slugify,
    sourceValue,
    value,
  ]);

  useEffect(() => {
    if (!hasGenerateSlugField || readOnlyFromProps || !isLocked) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      const formattedSlug = await slugify({
        collectionSlug,
        data: getData(),
        globalSlug,
        path,
        valueToSlugify: sourceValue,
      });

      if (isCancelled) {
        return;
      }

      const nextValue = formattedSlug ?? "";

      if (value !== nextValue) {
        setValue(nextValue);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    collectionSlug,
    getData,
    globalSlug,
    hasGenerateSlugField,
    isLocked,
    path,
    readOnlyFromProps,
    setValue,
    slugify,
    sourceValue,
    value,
  ]);

  const toggleLock = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      setGenerateSlug(!isLocked);
    },
    [isLocked, setGenerateSlug],
  );

  return (
    <div className="field-type slug-field-component">
      <div className="label-wrapper">
        <FieldLabel htmlFor={`field-${resolvedPath}`} label={label} />
        {!isLocked && (
          <Button buttonStyle="none" className="lock-button" onClick={generateFromSource}>
            {t("authentication:generate")}
          </Button>
        )}
        <Button
          buttonStyle="none"
          className="lock-button"
          onClick={toggleLock}
        >
          {isLocked ? t("general:unlock") : t("general:lock")}
        </Button>
      </div>
      <TextInput
        onChange={setValue}
        path={resolvedPath}
        readOnly={Boolean(readOnlyFromProps || isLocked)}
        value={value}
      />
    </div>
  );
}

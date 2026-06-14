"use client";

import { useCallback, useEffect, type CSSProperties, type MouseEvent } from "react";
import {
  Button,
  FieldLabel,
  TextInput,
  fieldBaseClass,
  useField,
  useFormFields,
  useTranslation,
} from "@payloadcms/ui";

type ProductNetContentDisplayFieldProps = {
  field: {
    admin?: {
      className?: string;
      style?: CSSProperties;
      width?: string;
    };
    label?: false | string | Record<string, string>;
    name: string;
  };
  path?: string;
  readOnly?: boolean;
};

function resolveSiblingPath(path: string, name: string) {
  const lastSeparator = path.lastIndexOf(".");

  return lastSeparator === -1
    ? name
    : `${path.slice(0, lastSeparator + 1)}${name}`;
}

function formatDisplay(amount: unknown, unit: unknown) {
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
}

export function ProductNetContentDisplayField({
  field,
  path,
  readOnly: readOnlyFromProps,
}: ProductNetContentDisplayFieldProps) {
  const { t } = useTranslation();
  const resolvedPath = path || field.name;
  const amountPath = resolveSiblingPath(resolvedPath, "amount");
  const unitPath = resolveSiblingPath(resolvedPath, "unit");
  const generatePath = resolveSiblingPath(resolvedPath, "generateDisplay");
  const generateValue = useFormFields(([fields]) => fields?.[generatePath]?.value);
  const generateInitialValue = useFormFields(
    ([fields]) => fields?.[generatePath]?.initialValue,
  );
  const isLocked = (generateValue ?? generateInitialValue ?? true) !== false;
  const { value: amount } = useField({ path: amountPath });
  const { value: unit } = useField({ path: unitPath });
  const { setValue, value } = useField<string>({ path: resolvedPath });
  const { setValue: setGenerateDisplay } = useField<boolean>({
    path: generatePath,
  });

  const generatedDisplay = formatDisplay(amount, unit);
  const styles = {
    ...(field.admin?.style || {}),
    ...(field.admin?.width
      ? { "--field-width": field.admin.width }
      : { flex: "1 1 auto" }),
    ...(field.admin?.style?.flex ? { flex: field.admin.style.flex } : {}),
  } as CSSProperties;

  const generateFromContent = useCallback(() => {
    if (value !== generatedDisplay) {
      setValue(generatedDisplay);
    }
  }, [generatedDisplay, setValue, value]);

  useEffect(() => {
    if (readOnlyFromProps || !isLocked || value === generatedDisplay) {
      return;
    }

    setValue(generatedDisplay);
  }, [generatedDisplay, isLocked, readOnlyFromProps, setValue, value]);

  const toggleLock = useCallback(
    (event: MouseEvent<Element>) => {
      event.preventDefault();
      setGenerateDisplay(!isLocked);
    },
    [isLocked, setGenerateDisplay],
  );

  return (
    <div
      className={[fieldBaseClass, "slug-field-component", field.admin?.className]
        .filter(Boolean)
        .join(" ")}
      style={styles}
    >
      <div className="label-wrapper">
        <FieldLabel
          htmlFor={`field-${resolvedPath}`}
          label={field.label === false ? undefined : field.label}
        />
        {!isLocked && (
          <Button buttonStyle="none" className="lock-button" onClick={generateFromContent}>
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

"use client";

import { useState } from "react";

import styles from "./quantity-selector.module.css";

type QuantitySelectorProps = {
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  initialValue?: number;
  onChange?: (value: number) => void;
  value?: number;
  variant?: "default" | "product";
};

export function QuantitySelector({
  className,
  disabled = false,
  min = 1,
  max = 12,
  initialValue = 1,
  onChange,
  value,
  variant = "default",
}: QuantitySelectorProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const resolvedValue = value ?? internalValue;

  const decreaseDisabled = disabled || resolvedValue <= min;
  const increaseDisabled = disabled || resolvedValue >= max;

  function updateValue(nextValue: number) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  return (
    <div
      className={[
        styles.wrapper,
        variant === "product" ? styles.productWrapper : "",
        className ?? "",
      ].join(" ").trim()}
    >
      <button
        type="button"
        className={[
          styles.stepper,
          variant === "product" ? styles.productStepper : "",
          decreaseDisabled ? styles.disabled : "",
        ].join(" ").trim()}
        disabled={decreaseDisabled}
        onClick={() => updateValue(Math.max(min, resolvedValue - 1))}
      >
        -
      </button>
      <div className={[styles.value, variant === "product" ? styles.productValue : ""].join(" ").trim()}>
        {resolvedValue}
      </div>
      <button
        type="button"
        className={[
          styles.stepper,
          variant === "product" ? styles.productStepper : "",
          increaseDisabled ? styles.disabled : "",
        ].join(" ").trim()}
        disabled={increaseDisabled}
        onClick={() => updateValue(Math.min(max, resolvedValue + 1))}
      >
        +
      </button>
    </div>
  );
}

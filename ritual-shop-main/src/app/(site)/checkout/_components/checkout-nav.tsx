"use client";

import type { CSSProperties } from "react";

import type { CheckoutStep } from "../../_data/checkout-data";
import styles from "./checkout.module.css";

type CheckoutNavProps = {
  activeStep: CheckoutStep;
};

const steps: Array<{ key: CheckoutStep; label: string; number: string }> = [
  {
    key: "buyer",
    label: "Podaci kupca",
    number: "01",
  },
  {
    key: "shipping",
    label: "Dostava",
    number: "02",
  },
  {
    key: "payment",
    label: "Plaćanje",
    number: "03",
  },
];

export function CheckoutNav({ activeStep }: CheckoutNavProps) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep);
  const progressPercent = activeIndex === -1 ? 0 : ((activeIndex + 1) / steps.length) * 100;

  return (
    <div
      className={styles.checkoutNav}
      style={{ "--checkout-progress": `${progressPercent}%` } as CSSProperties}
    >
      <ul>
        {steps.map((step, index) => {
          const state = index < activeIndex ? "complete" : index === activeIndex ? "active" : "upcoming";

          return (
            <li
              key={step.key}
              className={activeStep === step.key ? styles.active : ""}
              data-state={state}
              aria-current={state === "active" ? "step" : undefined}
            >
              <span className={styles.checkoutNavNumber}>{step.number}</span>
              <span className={styles.checkoutNavLabel}>{step.label}</span>
            </li>
          );
        })}
      </ul>
      <div className={styles.checkoutNavTrack} aria-hidden="true">
        <span className={styles.checkoutNavFill} />
      </div>
    </div>
  );
}

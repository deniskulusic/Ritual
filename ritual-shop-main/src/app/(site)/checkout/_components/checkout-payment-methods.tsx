import Image from "next/image";

import { checkoutPaymentMethods, type CheckoutPaymentMethodId } from "@/payload/collections/carts/contracts";
import styles from "./checkout.module.css";

type CheckoutPaymentMethodsProps = {
  selected: CheckoutPaymentMethodId;
  onSelect: (value: CheckoutPaymentMethodId) => void;
};

export function CheckoutPaymentMethods({ selected, onSelect }: CheckoutPaymentMethodsProps) {
  return (
    <div className={styles.formGrid}>
      {checkoutPaymentMethods.map((method) => (
        <div key={method.id} className={styles.full}>
          <button
            type="button"
            className={`${styles.standardPayment} ${selected === method.id ? styles.selectedPayment : ""}`}
            onClick={() => onSelect(method.id)}
          >
            <Image src={method.icon} alt="" aria-hidden="true" width={28} height={28} />
            <div>{method.label}</div>
          </button>
        </div>
      ))}
    </div>
  );
}

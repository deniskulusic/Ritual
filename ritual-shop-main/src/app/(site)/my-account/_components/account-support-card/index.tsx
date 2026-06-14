import Image from "next/image";

import type { SupportCard } from "../../../_data/account-data";
import styles from "./account-support-card.module.css";

type AccountSupportCardProps = {
  card: SupportCard;
};

export function AccountSupportCard({ card }: AccountSupportCardProps) {
  return (
    <div className={styles.card}>
      {card.icon ? <Image src={card.icon} alt="" aria-hidden="true" width={42} height={42} /> : null}
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  );
}

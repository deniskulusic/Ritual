import { accountTiles, customerProfile } from "../_data/account-data";
import { AccountHeader } from "./_components/account-header";
import { AccountTile } from "./_components/account-tile";
import styles from "./my-account-page.module.css";

export default function MyAccountPage() {
  return (
    <div className={`headerClearance ${styles.page}`}>
      <AccountHeader
        title="Moj račun"
        description={`${customerProfile.firstName} ${customerProfile.lastName}, ${customerProfile.email}`}
        isRoot
      />
      <section className={styles.content}>
        <div className={styles.grid}>
          {accountTiles.map((tile) => (
            <AccountTile key={tile.href} tile={tile} />
          ))}
        </div>
      </section>
    </div>
  );
}

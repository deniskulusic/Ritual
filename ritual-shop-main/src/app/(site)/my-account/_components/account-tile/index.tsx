import Image from "next/image";
import Link from "next/link";

import type { AccountTile as AccountTileData } from "../../../_data/account-data";
import styles from "./account-tile.module.css";

type AccountTileProps = {
  tile: AccountTileData;
};

export function AccountTile({ tile }: AccountTileProps) {
  return (
    <Link href={tile.href} className={styles.tile}>
      <div className={styles.copy}>
        <h2>{tile.title}</h2>
        <h5>{tile.subtitle}</h5>
      </div>
      <div className={styles.media}>
        <Image src={tile.image} alt="" aria-hidden="true" width={320} height={220} className={styles.image} />
      </div>
    </Link>
  );
}

import type { ReactNode } from "react";

import styles from "./account-shell.module.css";

type AccountShellProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function AccountShell({ children, aside }: AccountShellProps) {
  return (
    <section className={styles.shell}>
      <div className={styles.grid}>
        <div className={styles.main}>{children}</div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}

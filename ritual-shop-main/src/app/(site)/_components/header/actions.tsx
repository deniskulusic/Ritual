import Link from "next/link";

import styles from "./header.module.css";

type HeaderActionsProps = {
  itemCount: number;
  onDesktopLanguageToggle: () => void;
  onOpenSearch: () => void;
  searchOpen: boolean;
};

export function HeaderActions({
  itemCount,
  onDesktopLanguageToggle,
  onOpenSearch,
  searchOpen,
}: HeaderActionsProps) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.langDropdown} onClick={onDesktopLanguageToggle}>
        hr
        <img src="/ritual/icons/dropdown-arrow.svg" alt="" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.searchButton}
        aria-label="Pretraži"
        aria-expanded={searchOpen}
        aria-controls="site-search-overlay"
        onClick={onOpenSearch}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.9999 19L14.6499 14.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button type="button" className={styles.iconButton} aria-label="Korisnički račun">
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="M10.5682 8.414C11.7922 7.586 12.6002 6.186 12.6002 4.6C12.6002 2.064 10.5362 0 8.0002 0C5.46419 0 3.4002 2.064 3.4002 4.6C3.4002 6.186 4.20619 7.586 5.4322 8.414C2.3882 9.424 0.200195 12.174 0.200195 15.4V16H15.8002V15.4C15.8002 12.174 13.6122 9.424 10.5682 8.414ZM4.9002 4.6C4.9002 2.89 6.29019 1.5 8.0002 1.5C9.71019 1.5 11.1002 2.89 11.1002 4.6C11.1002 6.31 9.71019 7.7 8.0002 7.7C6.29019 7.7 4.9002 6.31 4.9002 4.6ZM3.44819 14.6C2.5782 14.6 1.9962 13.702 2.3522 12.908C3.2822 10.824 5.46419 9.4 8.0002 9.4C10.5362 9.4 12.7162 10.824 13.6482 12.908C14.0042 13.702 13.4222 14.6 12.5522 14.6H3.44819Z" />
        </svg>
      </button>
      <Link href="/cart" className={styles.cartButton} aria-label="Košarica">
        <svg width="18" height="17" viewBox="0 0 18 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3761 6.36881L9.74312 1.03747C9.57795 0.875911 9.33027 0.714355 9.08257 0.714355C8.83486 0.714355 8.58716 0.795133 8.42202 1.03747L4.78899 6.36881H0.825688C0.330275 6.36881 0 6.69192 0 7.17658C0 7.25736 0 7.33814 0 7.41892L2.06422 14.9313C2.22936 15.5775 2.88991 16.1429 3.63303 16.1429H14.367C15.1101 16.1429 15.7706 15.6583 15.9358 14.9313L18 7.41892C18 7.33814 18 7.25736 18 7.17658C18 6.69192 17.6697 6.36881 17.1743 6.36881H13.3761ZM6.6055 6.36881L9.08257 2.81458L11.5596 6.36881H6.6055Z" />
        </svg>
        <span>{itemCount}</span>
      </Link>
    </div>
  );
}

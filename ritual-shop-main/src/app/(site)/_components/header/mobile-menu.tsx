import { languageOptions } from "./language-options";
import { joinClassNames } from "./helpers";
import { ResolvedLink } from "../resolved-link";
import styles from "./header.module.css";
import type { HeaderData } from "./types";

type MobileMenuProps = {
  mobileLanguageOpen: boolean;
  navigationItems: HeaderData["mobileNavigation"];
  onCloseLanguage: () => void;
  onOpenLanguage: () => void;
};

export function MobileMenu({
  mobileLanguageOpen,
  navigationItems,
  onCloseLanguage,
  onOpenLanguage,
}: MobileMenuProps) {
  return (
    <div className={styles.mobileMenu}>
      <ul>
        {navigationItems.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <ResolvedLink link={item} />
          </li>
        ))}
      </ul>
      <div className={styles.mobileMenuActions}>
        <button type="button" className={styles.mobileLangButton} onClick={onOpenLanguage}>
          eng
          <img src="/ritual/icons/contrast-dropdown-arrow.svg" alt="" aria-hidden="true" />
        </button>
        <button type="button" className={styles.mobileAccountButton} aria-label="Korisnički račun">
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path d="M10.5682 8.414C11.7922 7.586 12.6002 6.186 12.6002 4.6C12.6002 2.064 10.5362 0 8.0002 0C5.46419 0 3.4002 2.064 3.4002 4.6C3.4002 6.186 4.20619 7.586 5.4322 8.414C2.3882 9.424 0.200195 12.174 0.200195 15.4V16H15.8002V15.4C15.8002 12.174 13.6122 9.424 10.5682 8.414ZM4.9002 4.6C4.9002 2.89 6.29019 1.5 8.0002 1.5C9.71019 1.5 11.1002 2.89 11.1002 4.6C11.1002 6.31 9.71019 7.7 8.0002 7.7C6.29019 7.7 4.9002 6.31 4.9002 4.6ZM3.44819 14.6C2.5782 14.6 1.9962 13.702 2.3522 12.908C3.2822 10.824 5.46419 9.4 8.0002 9.4C10.5362 9.4 12.7162 10.824 13.6482 12.908C14.0042 13.702 13.4222 14.6 12.5522 14.6H3.44819Z" />
          </svg>
        </button>
      </div>
      <div
        className={joinClassNames(
          styles.mobileLanguagePanel,
          mobileLanguageOpen ? styles.mobileLanguagePanelOpen : "",
        )}
      >
        <button type="button" className={styles.mobileLanguageBack} onClick={onCloseLanguage}>
          <img src="/ritual/icons/ld-back.svg" alt="" aria-hidden="true" />
          Jezik i regija
        </button>
        <div className={styles.languageList}>
          {languageOptions.map((language, index) => (
            <button
              key={language.code}
              type="button"
              className={index === 0 ? styles.languageActive : ""}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

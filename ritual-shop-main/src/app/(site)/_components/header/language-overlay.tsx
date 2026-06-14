import { languageOptions } from "./language-options";
import { joinClassNames } from "./helpers";
import styles from "./header.module.css";

type LanguageOverlayProps = {
  desktopLanguageOpen: boolean;
  onClose: () => void;
};

export function LanguageOverlay({
  desktopLanguageOpen,
  onClose,
}: LanguageOverlayProps) {
  return (
    <div
      className={joinClassNames(
        styles.desktopLanguageOverlay,
        desktopLanguageOpen ? styles.desktopLanguageOverlayOpen : "",
      )}
      onClick={onClose}
    >
      <div
        className={styles.desktopLanguageCard}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className={styles.desktopLanguageClose}
          aria-label="Zatvori odabir jezika"
          onClick={onClose}
        >
          <span />
          <span />
        </button>
        <h3>Jezik i regija</h3>
        <div className={styles.desktopLanguageGrid}>
          {languageOptions.map((language, index) => (
            <button
              key={language.code}
              type="button"
              className={index === 0 ? styles.desktopLanguageActive : ""}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

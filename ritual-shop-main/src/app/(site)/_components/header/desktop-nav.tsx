import Link from "next/link";
import type { CSSProperties, MutableRefObject, RefObject } from "react";

import { joinClassNames } from "./helpers";
import { ResolvedLink } from "../resolved-link";
import styles from "./header.module.css";
import type { HeaderData } from "./types";

type DesktopNavProps = {
  header: HeaderData;
  itemRefs: MutableRefObject<Array<HTMLLIElement | null>>;
  megaMenuIndex: number | null;
  navListRef: RefObject<HTMLUListElement | null>;
  onMegaMenuClose: () => void;
  onMegaMenuOpen: (index: number) => void;
  onNavEnter: (index: number) => void;
  onNavLeave: (index: number) => void;
  onUnderlineReset: () => void;
  underlineStyle: CSSProperties;
};

export function DesktopNav({
  header,
  itemRefs,
  megaMenuIndex,
  navListRef,
  onMegaMenuClose,
  onMegaMenuOpen,
  onNavEnter,
  onNavLeave,
  onUnderlineReset,
  underlineStyle,
}: DesktopNavProps) {
  return (
    <nav className={styles.nav} aria-label="Glavna navigacija">
      <Link href="/" className={styles.logoLink} aria-label="Ritual Shop naslovnica">
        <img className={styles.logo} src="/ritual/uploads/ritual-logo.png" alt="Ritual Shop" />
      </Link>
      <div className={styles.desktopNavWrap}>
        <ul ref={navListRef} className={styles.desktopNav} onMouseLeave={onUnderlineReset}>
          {header.primaryNavigation.map((item, index) => (
            <li
              key={item.key}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              onMouseEnter={() => onNavEnter(index)}
              onMouseLeave={() => onNavLeave(index)}
            >
              {item.link ? (
                <ResolvedLink className={styles.desktopNavLink} link={item.link} />
              ) : (
                <button type="button" className={styles.desktopNavButton}>
                  {item.label}
                </button>
              )}
              {item.megaMenu ? (
                <div
                  className={joinClassNames(
                    styles.megaMenu,
                    megaMenuIndex === index ? styles.megaMenuVisible : "",
                  )}
                  onMouseEnter={() => onMegaMenuOpen(index)}
                  onMouseLeave={onMegaMenuClose}
                >
                  {item.megaMenu.layout === "brands-panel" && item.megaMenu.brandPanel ? (
                    <div
                      className={joinClassNames(
                        styles.megaMenuContent,
                        styles.megaMenuContentBrandsPanel,
                      )}
                    >
                      <div className={styles.megaMenuColumnsGrid}>
                        {item.megaMenu.columns.map((column) => (
                          <div key={column.title} className={styles.megaMenuColumn}>
                            <h4>{column.title}</h4>
                            {column.links.map((link) => (
                              <ResolvedLink key={`${link.href}-${link.label}`} link={link} />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className={joinClassNames(styles.megaMenuColumn, styles.brandPanelColumn)}>
                        <div className={styles.brandPanelCard}>
                          <h4>{item.megaMenu.brandPanel.title}</h4>
                          <div className={styles.brandLogoGrid}>
                            {item.megaMenu.brandPanel.logos.map((brandLogo) =>
                              brandLogo.link ? (
                                <ResolvedLink
                                  key={`${brandLogo.name}-${brandLogo.imageSrc}`}
                                  className={styles.brandLogoLink}
                                  link={brandLogo.link}
                                >
                                  <img src={brandLogo.imageSrc} alt={brandLogo.imageAlt} />
                                </ResolvedLink>
                              ) : (
                                <div
                                  key={`${brandLogo.name}-${brandLogo.imageSrc}`}
                                  className={styles.brandLogoLink}
                                >
                                  <img src={brandLogo.imageSrc} alt={brandLogo.imageAlt} />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.megaMenuContent}>
                      {item.megaMenu.columns.map((column) => (
                        <div key={column.title} className={styles.megaMenuColumn}>
                          <h4>{column.title}</h4>
                          {column.links.map((link) => (
                            <ResolvedLink key={`${link.href}-${link.label}`} link={link} />
                          ))}
                        </div>
                      ))}
                      {item.megaMenu.feature ? (
                        <div className={joinClassNames(styles.megaMenuColumn, styles.featuredColumn)}>
                          {item.megaMenu.feature.link ? (
                            <ResolvedLink className={styles.featuredLink} link={item.megaMenu.feature.link}>
                              <div className={styles.featuredImageWrap}>
                                <img
                                  src={item.megaMenu.feature.imageSrc}
                                  alt={item.megaMenu.feature.imageAlt}
                                />
                              </div>
                              <span>{item.megaMenu.feature.eyebrow}</span>
                              <h5>{item.megaMenu.feature.title}</h5>
                            </ResolvedLink>
                          ) : (
                            <div className={styles.featuredLink}>
                              <div className={styles.featuredImageWrap}>
                                <img
                                  src={item.megaMenu.feature.imageSrc}
                                  alt={item.megaMenu.feature.imageAlt}
                                />
                              </div>
                              <span>{item.megaMenu.feature.eyebrow}</span>
                              <h5>{item.megaMenu.feature.title}</h5>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </li>
          ))}
          <div className={styles.navUnderline} style={underlineStyle} />
        </ul>
      </div>
    </nav>
  );
}

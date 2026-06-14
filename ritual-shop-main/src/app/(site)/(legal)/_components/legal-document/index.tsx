"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { LegalPageData } from "../../_data/legal-page-data";
import styles from "./legal-document.module.css";

type LegalDocumentProps = {
  page: LegalPageData;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createSectionId(title: string, index: number) {
  const baseId = slugify(title) || "section";

  return `${baseId}-${index + 1}`;
}

export function LegalDocument({ page }: LegalDocumentProps) {
  const items = useMemo(
    () => page.sections.map((section, index) => ({ ...section, id: createSectionId(section.title, index) })),
    [page.sections],
  );
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    setActiveSection(items[0]?.id ?? "");
  }, [items]);

  useEffect(() => {
    const updateActiveSection = () => {
      const offset = 220;
      let nextActive = items[0]?.id ?? "";

      for (const item of items) {
        const element = document.getElementById(item.id);
        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        if (rect.top <= offset) {
          nextActive = item.id;
        }
      }

      setActiveSection(nextActive);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerHeight = 160;
    const offset = element.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: offset, behavior: "smooth" });
    setActiveSection(id);
  };

  return (
    <div className="headerClearance">
      <section className={styles.productPath}>
        <Link href="/">
          <h4>Ritual Shop</h4>
        </Link>
        <img src="/ritual/icons/back-to.svg" alt="" aria-hidden="true" />
        <h4>{page.title}</h4>
      </section>
      <section className={styles.legal}>
        <nav className={styles.legalNav} aria-label="Navigacija pravne stranice">
          <ul>
            {items.map((item) => (
              <li key={item.id} className={activeSection === item.id ? styles.active : ""}>
                <button type="button" onClick={() => scrollToSection(item.id)}>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.legalData}>
          {items.map((item) => (
            <div key={item.id} className={styles.sectionBlock}>
              <h3 id={item.id}>{item.title}</h3>
              {item.paragraphs ? (
                item.paragraphs.map((paragraph, index) => <p key={`${item.id}-${index}`}>{paragraph}</p>)
              ) : (
                <div className={styles.table}>
                  {(item.table ?? []).map((row, index, rows) => (
                    <div key={`${item.id}-${index}`}>
                      <div className={styles.tableRow}>
                        <div>
                          <h4>{row.label}</h4>
                        </div>
                        <div>
                          <h5>{row.value}</h5>
                        </div>
                      </div>
                      {index < rows.length - 1 ? <div className={styles.tableLiner} /> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

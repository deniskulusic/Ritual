"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./home-promo-popup.module.css";

const promoPopupStorageKey = "ritual-home-promo-popup:v1";
const promoPopupDelayMs = 900;
const promoPopupCloseDurationMs = 260;

type HomePromoPopupProps = {
  hero: {
    backgroundImage: {
      alt: string;
      src: string;
    };
    description: string;
    highlights: {
      icon: {
        alt: string;
        src: string;
      };
      label: string;
    }[];
    primaryCtaLabel: string;
    primaryCtaLink: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    title: string;
  };
};

function renderTitle(title: string) {
  return title.split(/\r?\n/g).map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function summarizeDescription(description: string) {
  const trimmed = description.trim();

  if (!trimmed) {
    return "";
  }

  const firstSentence = trimmed.match(/.+?[.!?](?:\s|$)/)?.[0]?.trim() ?? trimmed;

  if (firstSentence.length <= 120) {
    return firstSentence;
  }

  return `${firstSentence.slice(0, 117).trimEnd()}...`;
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(promoPopupStorageKey, "dismissed");
  } catch {}
}

export function HomePromoPopup({ hero }: HomePromoPopupProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const closePopup = useCallback(() => {
    rememberDismissal();
    setIsVisible(false);

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, promoPopupCloseDurationMs);
  }, []);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(promoPopupStorageKey) === "dismissed") {
        return;
      }
    } catch {}

    openTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, promoPopupDelayMs);

    return () => {
      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current);
      }

      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopup, isOpen]);

  if (!isOpen) {
    return null;
  }

  const primaryLink = hero.primaryCtaLink;
  const description = summarizeDescription(hero.description);

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-promo-popup-title"
      aria-describedby="home-promo-popup-description"
      onClick={closePopup}
    >
      <div
        className={`${styles.panel} ${isVisible ? styles.panelVisible : ""}`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          aria-label="Zatvori promotivni prozor"
          onClick={closePopup}
        >
          <span />
          <span />
        </button>

        <div className={styles.copyColumn}>
          <div className={styles.brandMark}>
            <img src="/ritual/uploads/ritual-logo.png" alt="Ritual Shop" />
          </div>
          <h2 id="home-promo-popup-title">{renderTitle(hero.title)}</h2>
          {description ? (
            <p id="home-promo-popup-description" className={styles.description}>
              {description}
            </p>
          ) : null}

          <div className={styles.actions}>
            {primaryLink ? (
              <Link
                href={primaryLink.href}
                className={styles.primaryAction}
                rel={primaryLink.openInNewTab ? "noopener noreferrer" : undefined}
                target={primaryLink.openInNewTab ? "_blank" : undefined}
                onClick={() => {
                  rememberDismissal();
                }}
              >
                {hero.primaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className={styles.visualColumn}>
          <div className={styles.imageFrame}>
            <img src={hero.backgroundImage.src} alt={hero.backgroundImage.alt} />
            <div className={styles.imageTint} />
          </div>
        </div>
      </div>
    </div>
  );
}

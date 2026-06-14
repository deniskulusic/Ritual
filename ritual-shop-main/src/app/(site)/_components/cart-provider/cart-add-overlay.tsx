"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { CartAddOverlayState, CartDisplayItem } from "./types";
import styles from "./cart-add-overlay.module.css";

type CartAddOverlayProps = {
  itemCount: number;
  onClose: () => void;
  overlay: CartAddOverlayState | null;
  product: CartDisplayItem | null;
  subtotalLabel: string;
};

function formatCartItemCount(itemCount: number) {
  const absoluteCount = Math.abs(itemCount);
  const lastDigit = absoluteCount % 10;
  const lastTwoDigits = absoluteCount % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${itemCount} artikl u košarici`;
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${itemCount} artikla u košarici`;
  }

  return `${itemCount} artikala u košarici`;
}

export function CartAddOverlay({
  itemCount,
  onClose,
  overlay,
  product,
  subtotalLabel,
}: CartAddOverlayProps) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isOpen = overlay !== null && product !== null && overlay.phase !== "loading";
  const isAddedPhase = overlay?.phase === "added" || overlay?.phase === "closing-added";
  const isClosingPhase = overlay?.phase === "closing-added" || overlay?.phase === "closing-error";
  const isErrorPhase = overlay?.phase === "error" || overlay?.phase === "closing-error";
  const canInteract = overlay?.phase !== "loading" && !isClosingPhase;
  const shouldShow = isVisible && !isClosingPhase;
  const descriptionId = isAddedPhase ? "cart-add-overlay-summary" : "cart-add-overlay-description";

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
      setIsVisible(false);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !canInteract) {
      return;
    }

    continueButtonRef.current?.focus();
  }, [canInteract, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;

      if (isOpen) {
        onClose();
      }
    }
  }, [isOpen, onClose, pathname]);

  if (!isOpen || !overlay || !product) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-add-overlay-title"
      aria-describedby={descriptionId}
      onClick={onClose}
    >
      <div
        className={[
          styles.panel,
          shouldShow ? styles.panelVisible : "",
          isAddedPhase ? styles.panelAdded : "",
          isClosingPhase ? styles.panelClosing : "",
          isErrorPhase ? styles.panelError : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Zatvori potvrdu dodavanja u košaricu"
        >
          <span />
          <span />
        </button>
        <div className={styles.copy}>
          <h2 id="cart-add-overlay-title">
            {isAddedPhase ? "Dodano u košaricu" : isErrorPhase ? "Nije dodano u košaricu" : "Obrada..."}
          </h2>
          {isErrorPhase ? (
            <p id="cart-add-overlay-description">
              Proizvod trenutno nije moguće dodati. Pokušajte ponovno.
            </p>
          ) : null}
        </div>
        {isAddedPhase ? (
          <div id="cart-add-overlay-summary" className={`${styles.summary} ${styles.summaryVisible}`}>
            <span>{formatCartItemCount(itemCount)}</span>
            <strong>{subtotalLabel}</strong>
          </div>
        ) : null}
        <div className={`${styles.actions} ${canInteract ? styles.actionsVisible : ""}`}>
          <button
            ref={continueButtonRef}
            type="button"
            className={styles.secondaryAction}
            onClick={onClose}
            disabled={!canInteract}
          >
            {isErrorPhase ? "Zatvori" : "Nastavi kupnju"}
          </button>
          {isAddedPhase ? (
            <Link href="/cart" className={styles.primaryAction} onClick={onClose}>
              Idi u košaricu
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

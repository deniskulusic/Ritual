"use client";

import { useEffect, useRef, useState } from "react";

import { accountAddresses } from "../../../../_data/account-data";
import styles from "./address-book.module.css";

const MODAL_EXIT_MS = 350;

export function AddressBook() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const activeAddress = accountAddresses.find((address) => address.id === openId) ?? null;
  const isClosing = Boolean(activeAddress) && !isModalOpen;

  useEffect(() => {
    if (!openId) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsModalOpen(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [openId]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleOpen = (addressId: string) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setOpenId(addressId);
  };

  const handleClose = () => {
    if (!activeAddress) {
      return;
    }

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsModalOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setOpenId(null);
      closeTimerRef.current = null;
    }, MODAL_EXIT_MS);
  };

  return (
    <>
      <div className={styles.grid}>
        {accountAddresses.map((address) => (
          <div key={address.id} className={styles.address}>
            <div className={styles.addressCopy}>
              <div className={styles.addressHeader}>
                <h2>{address.title}</h2>
              </div>
              <div className={styles.addressPrimary}>
                <h3>{address.firstName} {address.lastName}</h3>
                <h3>{address.address1}</h3>
                <h3>{address.address2}</h3>
              </div>
              <div className={styles.addressSecondary}>
                <p>{address.postcode} {address.city}</p>
                <p>{address.state}</p>
                <p>{address.country}</p>
                <p>{address.email}</p>
                <p>{address.phone}</p>
                <p>{address.company}</p>
              </div>
            </div>
            <div className={styles.ctaHolder}>
              <button type="button" className={styles.editButton} onClick={() => handleOpen(address.id)}>
                Uredi
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        className={[
          styles.modal,
          activeAddress ? styles.active : "",
          isModalOpen ? styles.opened : "",
          isClosing ? styles.closing : "",
        ].filter(Boolean).join(" ")}
        aria-hidden={!activeAddress}
      >
        <button type="button" className={styles.overlay} onClick={handleClose} aria-label="Zatvori" />
        {activeAddress ? (
          <div className={styles.formCard}>
            <button type="button" className={styles.exitIcon} onClick={handleClose} aria-label="Zatvori">
              <span />
              <span />
            </button>
            <div className={styles.formCardHeader}>
              <h2>{activeAddress.title}</h2>
              <p>Uredite spremljene podatke za ovu adresu.</p>
            </div>
            <div className={styles.fields}>
              <input className={styles.half} defaultValue={activeAddress.firstName} placeholder="Ime" />
              <input className={styles.half} defaultValue={activeAddress.lastName} placeholder="Prezime" />
              <input className={styles.half} defaultValue={activeAddress.country} placeholder="Država" />
              <input className={styles.half} defaultValue={activeAddress.state} placeholder="Županija" />
              <input className={styles.half} defaultValue={activeAddress.city} placeholder="Grad / mjesto" />
              <input className={styles.half} defaultValue={activeAddress.postcode} placeholder="Poštanski broj" />
              <input className={styles.full} defaultValue={activeAddress.address1} placeholder="Adresa 1" />
              <input className={styles.full} defaultValue={activeAddress.address2} placeholder="Adresa 2" />
              <input className={styles.half} defaultValue={activeAddress.phone} placeholder="Telefon" />
              <input className={styles.half} defaultValue={activeAddress.company} placeholder="Tvrtka" />
            </div>
            <button type="button" className={styles.saveButton}>
              Spremi adresu
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

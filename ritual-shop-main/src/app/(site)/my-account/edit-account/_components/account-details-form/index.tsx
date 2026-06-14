"use client";

import { useState } from "react";

import { customerProfile } from "../../../../_data/account-data";
import styles from "./account-details-form.module.css";

const fields = [
  {
    key: "fullName",
    label: "Ime i prezime",
    value: `${customerProfile.firstName} ${customerProfile.lastName}`,
    inputs: [
      { placeholder: "Ime", defaultValue: customerProfile.firstName, className: styles.half },
      { placeholder: "Prezime", defaultValue: customerProfile.lastName, className: styles.half },
    ],
  },
  {
    key: "phone",
    label: "Broj telefona",
    value: customerProfile.phone,
    inputs: [{ placeholder: "Telefon", defaultValue: customerProfile.phone, className: styles.full }],
  },
  {
    key: "email",
    label: "Email",
    value: customerProfile.email,
    inputs: [],
  },
];

export function AccountDetailsForm() {
  const [editingKey, setEditingKey] = useState<string | null>("fullName");

  return (
    <div className={styles.personalInfo}>
      {fields.map((field) => {
        const isEditing = editingKey === field.key && field.inputs.length > 0;

        return (
          <div key={field.key} className={styles.dataField}>
            <div className={styles.dataFieldHeader}>
              <div className={styles.dataFieldCopy}>
                <h3>{field.label}</h3>
                <h4 className={styles.dataFieldValue}>{field.value}</h4>
              </div>
              {field.inputs.length > 0 ? (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => setEditingKey((current) => (current === field.key ? null : field.key))}
                >
                  {isEditing ? "Odustani" : "Uredi"}
                </button>
              ) : null}
            </div>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.editFields}>
                  {field.inputs.map((input) => (
                    <input key={input.placeholder} className={input.className} defaultValue={input.defaultValue} placeholder={input.placeholder} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      <button type="button" className={styles.saveButton}>
        Spremi
      </button>
    </div>
  );
}

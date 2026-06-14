/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import styles from "./auth-view.module.css";

type AuthViewProps = {
  facebookHref: string;
  facebookLabel: string;
  title: string;
  subtitle: string;
  formTitle: string;
  formAction: string;
  fields: Array<{
    autoComplete?: string;
    name: string;
    required?: boolean;
    type: string;
    placeholder: string;
    className: "half" | "full";
  }>;
  googleHref: string;
  googleLabel: string;
  bodyText?: string;
  helperText?: string;
  submitLabel: string;
  switchText: string;
  switchLabel: string;
  switchHref: string;
  forgotPasswordHref?: string;
};

export function AuthView({
  facebookHref,
  facebookLabel,
  title,
  subtitle,
  formTitle,
  formAction,
  fields,
  googleHref,
  googleLabel,
  bodyText,
  helperText,
  submitLabel,
  switchText,
  switchLabel,
  switchHref,
  forgotPasswordHref,
}: AuthViewProps) {
  return (
    <section className={`headerClearance ${styles.register}`}>
      <h1>{title}</h1>
      <h3>{subtitle}</h3>
      <div className={styles.grid}>
        <div className={styles.form}>
          <h3>{formTitle}</h3>
          <form action={formAction} method="post">
            <div className={styles.formGrid}>
              {fields.map((field) => (
                <input
                  autoComplete={field.autoComplete}
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required ?? true}
                  className={field.className === "half" ? styles.half : styles.full}
                />
              ))}
            </div>
            {bodyText ? <p className={styles.bodyText}>{bodyText}</p> : null}
            <div className={styles.formCta}>
              <button type="submit" className={styles.loginRegisterButton}>
                {submitLabel}
              </button>
            </div>
          </form>
          <p className={styles.switchBlock}>
            {forgotPasswordHref ? (
              <>
                <Link href={forgotPasswordHref}>Zaboravili ste lozinku?</Link>
                <br />
              </>
            ) : null}
            {switchText} <Link href={switchHref}>{switchLabel}</Link>
          </p>
          {helperText ? <h6>{helperText}</h6> : null}
        </div>
        <div className={styles.or}>ili</div>
        <div className={styles.socialRegister}>
          <Link href={facebookHref} className={styles.facebookRegister}>
            <img src="/ritual/icons/facebook.svg" alt="" aria-hidden="true" />
            {facebookLabel}
          </Link>
          <Link href={googleHref} className={styles.googleRegister}>
            <img src="/ritual/icons/google.svg" alt="" aria-hidden="true" />
            {googleLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

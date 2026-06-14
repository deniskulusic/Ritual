const errorMessages: Record<string, string> = {
  invalid_credentials: "Neispravan email ili lozinka.",
  link_with_password:
    "Ovaj email već postoji. Prijavite se lozinkom kako biste prvo potvrdili račun.",
  missing_fields: "Ispunite sva obavezna polja.",
  missing_provider_email:
    "Odabrani provider nije vratio email adresu, pa prijava nije dovršena.",
  oauth_failed: "Prijava putem providera nije uspjela. Pokušajte ponovno.",
  oauth_unavailable: "Provider prijava trenutno nije konfigurirana.",
  password_mismatch: "Lozinke se ne podudaraju.",
  register_failed: "Registracija nije uspjela. Provjerite podatke i pokušajte ponovno.",
};

export function getAuthErrorMessage(code: string | string[] | undefined): string | undefined {
  if (typeof code !== "string") {
    return undefined;
  }

  return errorMessages[code];
}

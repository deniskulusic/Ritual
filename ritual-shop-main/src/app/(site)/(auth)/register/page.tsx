import { AuthView } from "../_components/auth-view";
import { getAuthErrorMessage } from "../_components/auth-view/error-message";

export default async function RegisterPage(props: PageProps<"/register">) {
  const searchParams = await props.searchParams;
  const errorMessage = getAuthErrorMessage(searchParams.error);

  return (
    <AuthView
      facebookHref="/api/auth/oauth/facebook"
      facebookLabel="Registriraj se putem Facebooka"
      title="Register"
      subtitle="Novi račun"
      formTitle="Podaci kupca"
      formAction="/api/auth/register"
      fields={[
        {
          autoComplete: "given-name",
          name: "firstName",
          type: "text",
          placeholder: "Ime",
          className: "half",
        },
        {
          autoComplete: "family-name",
          name: "lastName",
          type: "text",
          placeholder: "Prezime",
          className: "half",
        },
        {
          autoComplete: "email",
          name: "email",
          type: "email",
          placeholder: "Email",
          className: "full",
        },
        {
          autoComplete: "new-password",
          name: "password",
          type: "password",
          placeholder: "Lozinka",
          className: "full",
        },
        {
          autoComplete: "new-password",
          name: "passwordConfirm",
          type: "password",
          placeholder: "Potvrdite lozinku",
          className: "full",
        },
      ]}
      googleHref="/api/auth/oauth/google"
      googleLabel="Registriraj se putem Googlea"
      bodyText={
        errorMessage ??
        "Otvorite račun emailom i lozinkom ili nastavite putem Google/Facebook računa."
      }
      submitLabel="Registriraj se"
      switchText="Već imate račun?"
      switchLabel="Prijavite se"
      switchHref="/login"
    />
  );
}

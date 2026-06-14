import { AuthView } from "../_components/auth-view";
import { getAuthErrorMessage } from "../_components/auth-view/error-message";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const errorMessage = getAuthErrorMessage(searchParams.error);

  return (
    <AuthView
      facebookHref="/api/auth/oauth/facebook"
      facebookLabel="Nastavi putem Facebooka"
      title="Login"
      subtitle="Prijava"
      formTitle="Prijava na račun"
      formAction="/api/auth/login"
      fields={[
        {
          autoComplete: "email",
          name: "email",
          type: "email",
          placeholder: "Email",
          className: "full",
        },
        {
          autoComplete: "current-password",
          name: "password",
          type: "password",
          placeholder: "Lozinka",
          className: "full",
        },
      ]}
      googleHref="/api/auth/oauth/google"
      googleLabel="Nastavi putem Googlea"
      helperText={
        errorMessage ?? "Prijavite se emailom i lozinkom ili nastavite putem Google/Facebook računa."
      }
      submitLabel="Prijavi se"
      switchText="Nemate račun?"
      switchLabel="Registrirajte se"
      switchHref="/register"
    />
  );
}

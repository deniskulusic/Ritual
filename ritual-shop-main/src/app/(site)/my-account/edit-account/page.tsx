import { accountSupportCards } from "../../_data/account-data";
import { AccountHeader } from "../_components/account-header";
import { AccountShell } from "../_components/account-shell";
import { AccountSupportCard } from "../_components/account-support-card";
import { AccountDetailsForm } from "./_components/account-details-form";

export default function EditAccountPage() {
  return (
    <div className="headerClearance">
      <AccountHeader title="Osobni podaci" description="Ažurirajte osnovne podatke računa i zadržite profil ažurnim." />
      <AccountShell aside={<AccountSupportCard card={accountSupportCards.profile} />}>
        <AccountDetailsForm />
      </AccountShell>
    </div>
  );
}

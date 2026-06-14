import { accountSupportCards } from "../../_data/account-data";
import { AccountHeader } from "../_components/account-header";
import { AccountShell } from "../_components/account-shell";
import { AccountSupportCard } from "../_components/account-support-card";
import { AddressBook } from "./_components/address-book";

export default function EditAddressPage() {
  return (
    <div className="headerClearance">
      <AccountHeader title="Adrese" description="Uredite adrese za naplatu i dostavu bez izlaska iz računa." />
      <AccountShell aside={<AccountSupportCard card={accountSupportCards.addresses} />}>
        <AddressBook />
      </AccountShell>
    </div>
  );
}

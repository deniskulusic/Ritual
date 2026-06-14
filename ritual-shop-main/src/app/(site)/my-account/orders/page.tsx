import { accountOrders, accountSupportCards } from "../../_data/account-data";
import { AccountHeader } from "../_components/account-header";
import { AccountShell } from "../_components/account-shell";
import { AccountSupportCard } from "../_components/account-support-card";
import { OrdersPanel } from "./_components/orders-panel";

export default function OrdersPage() {
  return (
    <div className="headerClearance">
      <AccountHeader title="Narudžbe" description="Pregledajte status i detalje svake kupnje na jednom mjestu." />
      <AccountShell aside={<AccountSupportCard card={accountSupportCards.orders} />}>
        <OrdersPanel orders={accountOrders} />
      </AccountShell>
    </div>
  );
}

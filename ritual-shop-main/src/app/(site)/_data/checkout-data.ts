import { accountAddresses, customerProfile } from "./account-data";
import type { AddressRecord } from "./customer-data";

export type CheckoutStep = "buyer" | "shipping" | "payment";

export const checkoutSavedAddresses: AddressRecord[] = [
  accountAddresses[0],
  accountAddresses[1],
  {
    id: "office",
    title: "Ured",
    firstName: "Iva",
    lastName: "Horvat",
    country: "Hrvatska",
    state: "Zagrebačka",
    city: "Velika Gorica",
    postcode: "10410",
    address1: "Industrijska cesta 12",
    address2: "Prizemlje",
    email: customerProfile.email,
    phone: customerProfile.phone,
    company: "Ritual Studio d.o.o.",
  },
];

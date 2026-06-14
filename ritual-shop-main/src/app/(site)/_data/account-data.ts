import { storeProducts } from "../(catalog)/_data/catalog-data";
import type { AddressRecord, CustomerProfile } from "./customer-data";

export type AccountTile = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

export type SupportCard = {
  icon?: string;
  title: string;
  description: string;
};

export type OrderLine = {
  title: string;
  quantity: number;
  priceLabel: string;
};

export type AccountOrder = {
  id: string;
  createdAtLabel: string;
  status: string;
  totalLabel: string;
  paymentMethodLabel: string;
  shippingMethodLabel: string;
  subtotalLabel: string;
  shippingLabel: string;
  customer: CustomerProfile;
  shippingAddress: AddressRecord;
  lines: OrderLine[];
};

export const accountTiles: AccountTile[] = [
  {
    title: "Moje narudžbe",
    subtitle: "Povijest kupnje",
    href: "/my-account/orders",
    image: "/ritual/images/cat-1.png",
  },
  {
    title: "Adrese",
    subtitle: "Za dostavu",
    href: "/my-account/edit-address",
    image: "/ritual/images/cat-5.png",
  },
  {
    title: "Osobni podaci",
    subtitle: "Moj račun",
    href: "/my-account/edit-account",
    image: "/ritual/images/cat-6.png",
  },
];

export const customerProfile: CustomerProfile = {
  firstName: "Iva",
  lastName: "Horvat",
  email: "iva.horvat@example.com",
  phone: "+385 91 555 1234",
};

export const accountSupportCards: Record<"orders" | "profile" | "addresses", SupportCard> = {
  orders: {
    icon: "/ritual/icons/delivery.svg",
    title: "Dostava i povrati",
    description:
      "Pratite status svake narudžbe, provjerite stavke kupnje i brzo pronađite sve detalje dostave.",
  },
  profile: {
    icon: "/ritual/icons/secured-payment.svg",
    title: "Privatnost računa",
    description:
      "Ažurirajte osnovne podatke računa kako bi svaka sljedeća kupnja bila jednostavnija i brža.",
  },
  addresses: {
    icon: "/ritual/icons/location.svg",
    title: "Adrese dostave",
    description:
      "Spremite adrese za naplatu i dostavu kako bi checkout ostao uredan, brz i dosljedan.",
  },
};

export const accountAddresses: AddressRecord[] = [
  {
    id: "billing",
    title: "Adresa za naplatu",
    firstName: "Iva",
    lastName: "Horvat",
    country: "Hrvatska",
    state: "Grad Zagreb",
    city: "Zagreb",
    postcode: "10000",
    address1: "Ilica 10",
    address2: "3. kat",
    email: customerProfile.email,
    phone: customerProfile.phone,
    company: "Ritual Studio d.o.o.",
    isDefault: true,
  },
  {
    id: "shipping",
    title: "Adresa dostave",
    firstName: "Iva",
    lastName: "Horvat",
    country: "Hrvatska",
    state: "Grad Zagreb",
    city: "Zagreb",
    postcode: "10000",
    address1: "Maksimirska 42",
    address2: "Ured 5",
    email: customerProfile.email,
    phone: customerProfile.phone,
    company: "Ritual Studio d.o.o.",
  },
];

export const accountOrders: AccountOrder[] = [
  {
    id: "1042",
    createdAtLabel: "12. travnja 2026.",
    status: "Processing",
    totalLabel: "82 EUR",
    paymentMethodLabel: "Kartično plaćanje",
    shippingMethodLabel: "Dostava unutar Hrvatske",
    subtotalLabel: "77 EUR",
    shippingLabel: "5 EUR",
    customer: customerProfile,
    shippingAddress: accountAddresses[1],
    lines: [
      { title: storeProducts[0].title, quantity: 1, priceLabel: "24 EUR" },
      { title: storeProducts[1].title, quantity: 2, priceLabel: "58 EUR" },
    ],
  },
  {
    id: "0987",
    createdAtLabel: "29. ožujka 2026.",
    status: "Completed",
    totalLabel: "19 EUR",
    paymentMethodLabel: "Plaćanje pouzećem",
    shippingMethodLabel: "Preuzimanje u poslovnici",
    subtotalLabel: "19 EUR",
    shippingLabel: "Besplatno",
    customer: customerProfile,
    shippingAddress: accountAddresses[0],
    lines: [{ title: storeProducts[4].title, quantity: 1, priceLabel: "19 EUR" }],
  },
];

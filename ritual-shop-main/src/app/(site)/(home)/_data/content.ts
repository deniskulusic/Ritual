export const featuredProducts = [
  {
    tag: "Novo",
    country: "Kava",
    title: "Luxury Exclusiv 1/1",
    price: "24 EUR",
    image: "/ritual/uploads/products/0101004.png",
    alt: "Luxury Exclusiv",
  },
  {
    tag: "Top",
    country: "Kapsule",
    title: "Lavazza Point Cream",
    price: "29 EUR",
    image: "/ritual/uploads/products/0101008.png",
    alt: "Lavazza Point Cream",
  },
  {
    tag: "Akcija",
    country: "Kapsule",
    title: "Lavazza Point Espresso",
    price: "34 EUR",
    image: "/ritual/uploads/products/0101009.png",
    alt: "Lavazza Point Espresso",
  },
  {
    country: "Kapsule",
    title: "Lavazza Point Decaf",
    price: "31 EUR",
    image: "/ritual/uploads/products/0101010.png",
    alt: "Lavazza Point Decaf",
  },
  {
    country: "Kava",
    title: "Lavazza Point Aroma",
    price: "39 EUR",
    image: "/ritual/uploads/products/0101011.png",
    alt: "Lavazza Point Aroma",
  },
];

export const productCategories = [
  {
    name: "Kava u zrnu",
    href: "#",
    className: "cat1",
    backgroundImage: "/ritual/images/dalmatia.png",
    bottleImage: "/ritual/images/cat-1.png",
    overlayOpacity: 0.5,
  },
  {
    name: "Kava u kapsulama",
    href: "#",
    className: "cat2",
    backgroundImage: "/ritual/images/istria.png",
    bottleImage: "/ritual/images/cat-2.png",
    overlayOpacity: 0.55,
  },
  {
    name: "Čajevi i matcha",
    href: "#",
    className: "cat3",
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    bottleImage: "/ritual/images/cat-3.png",
    overlayOpacity: 0.15,
  },
  {
    name: "Aparati",
    href: "#",
    className: "cat4",
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    bottleImage: "/ritual/images/cat-4.png",
    overlayOpacity: 0.15,
  },
  {
    name: "Oprema",
    href: "#",
    className: "cat5",
    backgroundImage: "/ritual/images/slavonia.png",
    bottleImage: "/ritual/images/cat-5.png",
    overlayOpacity: 0.2,
  },
  {
    name: "Za ured",
    href: "#",
    className: "cat6",
    backgroundImage: "/ritual/uploads/hero-ritual.webp",
    bottleImage: "/ritual/images/cat-6.png",
    overlayOpacity: 0,
  },
] as const;

export const valueProps = [
  {
    icon: "/ritual/icons/fast-shipping.svg",
    alt: "Brza dostava",
    title: "Brza dostava",
  },
  {
    icon: "/ritual/icons/secured-payment.svg",
    alt: "Sigurno plaćanje",
    title: "Sigurno plaćanje",
  },
  {
    icon: "/ritual/icons/delivery.svg",
    alt: "Prilagođena dostava",
    title: "Pouzdana dostava",
  },
  {
    icon: "/ritual/icons/bottle.svg",
    alt: "Odabrani proizvodi",
    title: "Top selekcija",
  },
];

export const partners = Array.from({ length: 12 }, (_, index) => ({
  src: `/ritual/images/partner${index + 1}.png`,
  alt: `Partner ${index + 1}`,
}));

export const officeProducts = [
  {
    country: "Kava",
    title: "Lavazza Point Mlijeko",
    price: "22 EUR",
    image: "/ritual/uploads/products/0101012.png",
    alt: "Lavazza Point Mlijeko",
  },
  {
    country: "Kapsule",
    title: "Lavazza Point Limun",
    price: "26 EUR",
    image: "/ritual/uploads/products/0101010.png",
    alt: "Lavazza Point Limun",
  },
  {
    country: "Kapsule",
    title: "Lavazza Aroma Club",
    price: "33 EUR",
    image: "/ritual/uploads/products/0101011.png",
    alt: "Lavazza Aroma Club",
  },
  {
    country: "Kava",
    title: "Luxury kava za ured",
    price: "28 EUR",
    image: "/ritual/uploads/products/0101004.png",
    alt: "Luxury kava za ured",
  },
  {
    country: "Kapsule",
    title: "Lavazza Point Classic",
    price: "24 EUR",
    image: "/ritual/uploads/products/0101008.png",
    alt: "Lavazza Point Classic",
  },
  {
    country: "Kapsule",
    title: "Lavazza Point Intenso",
    price: "35 EUR",
    image: "/ritual/uploads/products/0101009.png",
    alt: "Lavazza Point Intenso",
  },
];

export const orderSteps = [
  {
    image: "/ritual/images/index-visual-1.png",
    alt: "Odaberite proizvode",
    title: "Odaberite proizvode",
  },
  {
    image: "/ritual/images/index-visual-2.png",
    alt: "Potvrdite narudžbu",
    title: "Potvrdite narudžbu",
  },
  {
    image: "/ritual/images/index-visual-3.png",
    alt: "Preuzmite dostavu",
    title: "Preuzmite dostavu",
  },
];

export const heroHighlights = [
  {
    image: "/ritual/icons/fast-shipping.svg",
    alt: "Brza dostava",
    label: "Brza dostava",
  },
  {
    image: "/ritual/icons/secured-payment.svg",
    alt: "Sigurno plaćanje",
    label: "Sigurno plaćanje",
  },
  {
    image: "/ritual/icons/delivery.svg",
    alt: "Prilagođena dostava",
    label: "Fleksibilna dostava",
  },
];

export const stories = [
  {
    eyebrow: "O nama",
    title: "Kava, kapsule i dodatci u frontend strukturi spremnoj za Payload",
    description:
      "Sadržaj ostaje privremen, ali raspored, ritam sekcija i vizualna hijerarhija sada prate aktualni WordPress storefront umjesto stare zastarjele varijante.",
    href: "#",
    cta: "Saznaj više",
    image: "/ritual/images/read-more-1.png",
    alt: "O nama",
    reverse: false,
  },
  {
    eyebrow: "Kontakt",
    title: "Operativna podrška za uredske narudžbe i svakodnevne rituale pripreme",
    description:
      "Interaktivni ecommerce tokovi ostaju odgođeni, ali informativni i prodajni blokovi se sada mogu slagati na stabilnoj frontend osnovi bez dodatnog redizajna.",
    href: "#",
    cta: "Kontaktiraj nas",
    image: "/ritual/images/read-more-2.png",
    alt: "Kontakt",
    reverse: true,
  },
];

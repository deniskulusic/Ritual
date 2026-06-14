import "server-only";

export type RecipeImage = {
  alt: string;
  src: string;
};

export type RecipeFact = {
  label: string;
  value: string;
};

export type RecipeIngredient = {
  amount: string;
  name: string;
  note?: string;
};

export type RecipeIngredientGroup = {
  items: RecipeIngredient[];
  title: string;
};

export type RecipeStep = {
  body: string;
  title: string;
};

export type RecipeNote = {
  body: string;
  title: string;
};

export type RecipeProductSpotlight = {
  ctaHref: string;
  ctaLabel: string;
  description: string;
  image: RecipeImage;
  subtitle: string;
  title: string;
};

export type RecipePageData = {
  catalogProductSlug: string;
  difficulty: string;
  equipment: string;
  excerpt: string;
  facts: RecipeFact[];
  featuredProduct: RecipeProductSpotlight;
  heroImage: RecipeImage;
  ingredients: RecipeIngredientGroup[];
  ingredientsImage: RecipeImage;
  metaDescription: string;
  metaTitle: null | string;
  notes: RecipeNote[];
  prepTime: string;
  relatedHeading: {
    eyebrow: null | string;
    title: string;
  };
  servings: string;
  slug: string;
  steps: RecipeStep[];
  stepsImage: RecipeImage;
  title: string;
  typeLabel: string;
};

const recipePages: RecipePageData[] = [
  {
    catalogProductSlug: "baru-matcha-latte-250g",
    difficulty: "Lagano",
    equipment: "Metlica ili milk frother",
    excerpt: "Kremast chai latte za sporiji početak dana i jednostavnu pripremu kod kuće.",
    facts: [
      { label: "Vrijeme", value: "10 min" },
      { label: "Težina", value: "Lagano" },
      { label: "Porcije", value: "1 šalica" },
      { label: "Oprema", value: "Metlica ili milk frother" },
      { label: "Tip", value: "Topli napitak" },
    ],
    featuredProduct: {
      ctaHref: "/shop",
      ctaLabel: "Istraži Baru kolekciju",
      description:
        "Dok kolekcija recepata još nije povezana s pravim CMS odnosima, ovaj blok ostaje spreman za buduće mapiranje proizvoda, pakiranja i dodatne opreme.",
      image: {
        alt: "Baru proizvod kao placeholder za recept",
        src: "/ritual/uploads/brands/baru/4802008-1.png",
      },
      subtitle: "Placeholder product spotlight",
      title: "Baru Chaitastic Chai Latte",
    },
    heroImage: {
      alt: "Baru lifestyle vizual za chai latte recept",
      src: "/ritual/uploads/brands/baru/AZ2A0456-scaled-1.jpg",
    },
    ingredientsImage: {
      alt: "Baru chai proizvod za pripremu recepta",
      src: "/ritual/uploads/brands/baru/4802008-1.png",
    },
    ingredients: [
      {
        items: [
          { amount: "3 žličice", name: "Baru Chaitastic Chai Latte blend" },
          { amount: "60 ml", name: "vrele vode" },
          { amount: "180 ml", name: "zobenog ili punomasnog mlijeka" },
          { amount: "1 žličica", name: "javorovog sirupa", note: "po želji, za zaobljeniji završetak" },
        ],
        title: "Za chai latte",
      },
      {
        items: [
          { amount: "1 prstohvat", name: "cimeta ili chai mješavine" },
          { amount: "nekoliko kapi", name: "ekstrakta vanilije", note: "ako želite mekši, desertniji ton" },
        ],
        title: "Za završetak",
      },
    ],
    metaDescription:
      "Placeholder recept stranica za Baru Chaitastic Chai Latte, s ritual-first rasporedom spremnim za buduće CMS povezivanje.",
    metaTitle: "Baru Chaitastic Chai Latte | Ritual Shop",
    notes: [
      {
        body:
          "Ako želite izraženiji chai potpis, blend prvo razmutite u gustu pastu pa tek onda dodajte ostatak tekućine. Za iced varijantu koristite malo manje mlijeka i prelijte preko leda.",
        title: "Ritual tip",
      },
    ],
    prepTime: "10 min",
    relatedHeading: {
      eyebrow: "Dalje istraži",
      title: "Povezane priče za isti ritual",
    },
    servings: "1 šalica",
    slug: "baru-chaitastic-chai-latte",
    steps: [
      {
        body: "Pomiješajte chai blend s vrelom vodom dok ne dobijete glatku, aromatičnu bazu.",
        title: "Napravite koncentriranu bazu",
      },
      {
        body: "Mlijeko zagrijte i kratko zapjenite kako bi tekstura ostala mekša i punija.",
        title: "Zagrijte i omekšajte mlijeko",
      },
      {
        body: "Ulijte mlijeko u dva navrata i završite laganim slojem pjene na vrhu.",
        title: "Spojite slojeve bez žurbe",
      },
    ],
    stepsImage: {
      alt: "Baru chai latte poslužen u čaši",
      src: "/ritual/uploads/brands/baru/UBE.jpg",
    },
    title: "Baru Chaitastic Chai Latte",
    typeLabel: "Recept",
  },
];

export async function getRecipePageSlugs() {
  return recipePages.map((recipe) => recipe.slug);
}

export async function getRecipePageBySlug(slug: string) {
  return recipePages.find((recipe) => recipe.slug === slug) ?? null;
}

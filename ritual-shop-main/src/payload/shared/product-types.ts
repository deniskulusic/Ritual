import { localizedLabel } from "./admin-copy";

export const productTypeOptions = [
  {
    label: localizedLabel("Single serve beverage", "Jednodozni napitak"),
    value: "single_serve_beverage",
  },
  {
    label: localizedLabel("Packaged coffee", "Pakirana kava"),
    value: "packaged_coffee",
  },
  {
    label: localizedLabel("Equipment", "Oprema"),
    value: "equipment",
  },
  {
    label: localizedLabel("Accessory", "Dodatak"),
    value: "accessory",
  },
  {
    label: localizedLabel("Drink mix ingredient", "Sastojak za napitke"),
    value: "drink_mix_ingredient",
  },
  {
    label: localizedLabel("Technical consumable", "Tehnički potrošni materijal"),
    value: "technical_consumable",
  },
  {
    label: localizedLabel("Tea / matcha", "Čaj / matcha"),
    value: "tea_matcha",
  },
  {
    label: localizedLabel("Cold beverage concentrate", "Koncentrat hladnog napitka"),
    value: "cold_beverage_concentrate",
  },
  {
    label: localizedLabel("Confectionery / snack", "Slatkiš / snack"),
    value: "confectionery_snack",
  },
];

export type ProductTypeValue =
  | "single_serve_beverage"
  | "packaged_coffee"
  | "equipment"
  | "accessory"
  | "drink_mix_ingredient"
  | "technical_consumable"
  | "tea_matcha"
  | "cold_beverage_concentrate"
  | "confectionery_snack";

import { localizedLabel } from "./admin-copy";

export const netContentUnitOptions = [
  { label: localizedLabel("Grams", "g"), value: "g" },
  { label: localizedLabel("Kilograms", "kg"), value: "kg" },
  { label: localizedLabel("Milliliters", "ml"), value: "ml" },
  { label: localizedLabel("Liters", "l"), value: "l" },
  { label: localizedLabel("Pieces", "kom"), value: "kom" },
];

export const productFormatOptions = [
  { label: localizedLabel("Accessory", "Dodatak"), value: "accessory" },
  { label: localizedLabel("Beans", "Kava u zrnu"), value: "beans" },
  { label: localizedLabel("Capsules", "Kapsule"), value: "capsules" },
  { label: localizedLabel("Concentrate", "Koncentrat"), value: "concentrate" },
  { label: localizedLabel("Confectionery", "Slatkiš"), value: "confectionery" },
  { label: localizedLabel("Consumable", "Potrošni materijal"), value: "consumable" },
  { label: localizedLabel("Ground", "Mljevena kava"), value: "ground" },
  { label: localizedLabel("Machine", "Aparat"), value: "machine" },
  { label: localizedLabel("Pods", "Jednodozne doze"), value: "pods" },
  { label: localizedLabel("Powder", "Prah / instant napitak"), value: "powder" },
  { label: localizedLabel("Sachets", "Vrećice / porcije"), value: "sachets" },
  { label: localizedLabel("Syrup", "Sirup"), value: "syrup" },
  { label: localizedLabel("Tea bags", "Čajne vrećice"), value: "tea_bags" },
];

export const compatibleSystemOptions = [
  { label: localizedLabel("Animo OptiMe", "Animo OptiMe"), value: "animo_optime" },
  { label: localizedLabel("Coffee machines", "Aparati za kavu"), value: "coffee_machines" },
  { label: localizedLabel("Combi steamers", "Kombi pećnice"), value: "combi_steamers" },
  { label: localizedLabel("ESE 44 mm", "ESE 44 mm"), value: "ese_44_mm" },
  { label: localizedLabel("Espresso machines", "Espresso aparati"), value: "espresso_machines" },
  {
    label: localizedLabel("Ho.Re.Ca beverage equipment", "Ho.Re.Ca oprema za napitke"),
    value: "horeca_beverage_equipment",
  },
  { label: localizedLabel("Lavazza A Modo Mio", "Lavazza A Modo Mio"), value: "lavazza_a_modo_mio" },
  { label: localizedLabel("Lavazza BLUE", "Lavazza BLUE"), value: "lavazza_blue" },
  { label: localizedLabel("Lavazza Espresso Point", "Lavazza Espresso Point"), value: "lavazza_espresso_point" },
  { label: localizedLabel("Ovens", "Pećnice"), value: "ovens" },
  { label: localizedLabel("Tchibo Cafissimo", "Tchibo Cafissimo"), value: "tchibo_cafissimo" },
  { label: localizedLabel("Vending machines", "Vending aparati"), value: "vending_machines" },
];

export const beverageTypeOptions = [
  { label: localizedLabel("Chai latte", "Chai latte"), value: "chai_latte" },
  { label: localizedLabel("Coffee", "Kava"), value: "coffee" },
  { label: localizedLabel("Ginseng", "Ginseng"), value: "ginseng" },
  { label: localizedLabel("Hot chocolate", "Topla čokolada"), value: "hot_chocolate" },
  { label: localizedLabel("Juice concentrate", "Koncentrat soka"), value: "juice_concentrate" },
  { label: localizedLabel("Matcha latte", "Matcha latte"), value: "matcha_latte" },
  { label: localizedLabel("Milk", "Mlijeko"), value: "milk" },
  { label: localizedLabel("Pumpkin spice latte", "Pumpkin spice latte"), value: "pumpkin_spice_latte" },
  { label: localizedLabel("Tea", "Čaj"), value: "tea" },
  { label: localizedLabel("White chocolate", "Bijela čokolada"), value: "white_chocolate" },
];

export const teaTypeOptions = [
  { label: localizedLabel("Black", "Crni"), value: "black" },
  { label: localizedLabel("Chai", "Chai"), value: "chai" },
  { label: localizedLabel("Fruit infusion", "Voćna infuzija"), value: "fruit_infusion" },
  { label: localizedLabel("Green", "Zeleni"), value: "green" },
  { label: localizedLabel("Herbal", "Biljni"), value: "herbal" },
  { label: localizedLabel("Rooibos", "Rooibos"), value: "rooibos" },
];

export const physicalFormOptions = [
  { label: localizedLabel("Cartridge", "Uložak"), value: "cartridge" },
  { label: localizedLabel("Powder", "Prah"), value: "powder" },
  { label: localizedLabel("Sachets", "Vrećice"), value: "sachets" },
  { label: localizedLabel("Sticks", "Sticks"), value: "sticks" },
  { label: localizedLabel("Syrup", "Sirup"), value: "syrup" },
];

export const coffeeFormOptions = [
  { label: localizedLabel("Instant", "Instant"), value: "instant" },
];

export const flavourOptions = [
  { label: localizedLabel("Apple", "Jabuka"), value: "apple" },
  { label: localizedLabel("Hazelnut", "Lješnjak"), value: "hazelnut" },
  { label: localizedLabel("Salted caramel", "Slani karamel"), value: "salted_caramel" },
  { label: localizedLabel("Vanilla", "Vanilija"), value: "vanilla" },
];

export const flavorFamilyOptions = [
  { label: localizedLabel("Apple / pear", "Jabuka / kruška"), value: "apple_pear" },
];

export const productFormOptions = [
  { label: localizedLabel("Bar", "Pločica"), value: "bar" },
  { label: localizedLabel("Marshmallows", "Marshmallow"), value: "marshmallows" },
];

export const equipmentTypeOptions = [
  { label: localizedLabel("Bean-to-cup machine", "Aparat zrno-šalica"), value: "bean_to_cup_machine" },
  { label: localizedLabel("Capsule machine", "Aparat za kapsule"), value: "capsule_machine" },
  { label: localizedLabel("Cold water dispenser", "Dispenzer hladne vode"), value: "cold_water_dispenser" },
  { label: localizedLabel("Espresso machine", "Espresso aparat"), value: "espresso_machine" },
  { label: localizedLabel("Filter machine", "Filter aparat"), value: "filter_machine" },
  { label: localizedLabel("Grinder", "Mlinac"), value: "grinder" },
  { label: localizedLabel("Hot drinks machine", "Aparat za tople napitke"), value: "hot_drinks_machine" },
  { label: localizedLabel("Instant coffee machine", "Aparat za instant kavu"), value: "instant_coffee_machine" },
  { label: localizedLabel("Milk fridge", "Hladnjak za mlijeko"), value: "milk_fridge" },
  { label: localizedLabel("Vending machine", "Vending aparat"), value: "vending_machine" },
];

export const waterConnectionOptions = [
  { label: localizedLabel("Direct plumb", "Direktni priključak"), value: "direct_plumb" },
  { label: localizedLabel("Manual fill", "Ručno punjenje"), value: "manual_fill" },
  {
    label: localizedLabel("Tank or direct plumb", "Spremnik ili direktni priključak"),
    value: "tank_or_direct_plumb",
  },
];

export const burrTypeOptions = [
  { label: localizedLabel("Conical", "Konusni"), value: "conical" },
  { label: localizedLabel("Flat", "Ravni"), value: "flat" },
];

const allDetailOptions = [
  ...netContentUnitOptions,
  ...productFormatOptions,
  ...compatibleSystemOptions,
  ...beverageTypeOptions,
  ...teaTypeOptions,
  ...physicalFormOptions,
  ...coffeeFormOptions,
  ...flavourOptions,
  ...flavorFamilyOptions,
  ...productFormOptions,
  ...equipmentTypeOptions,
  ...waterConnectionOptions,
  ...burrTypeOptions,
];

export function resolveProductDetailLabel(value: null | string | undefined) {
  if (!value) {
    return "";
  }

  return (
    allDetailOptions.find((option) => option.value === value)?.label.hr ??
    value.replaceAll("_", " ")
  );
}

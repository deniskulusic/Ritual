import { formatEuro } from "@/payload/collections/carts/shipping-contract";

import { getProductBySlug } from "../../(catalog)/_data/catalog-data";

export function getFallbackItem(productSlug: string) {
  const product = getProductBySlug(productSlug);

  if (!product) {
    return {
      image: null,
      priceLabel: formatEuro(0),
      title: productSlug,
      unitPrice: 0,
    };
  }

  return {
    image: product.image,
    priceLabel: product.priceLabel,
    title: product.title,
    unitPrice: product.priceValue,
  };
}

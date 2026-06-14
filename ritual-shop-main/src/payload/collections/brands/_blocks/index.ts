import type { Block } from "payload";

import { CtaBannerBlock } from "./cta-banner";
import { ProductSliderBlock } from "./product-slider";
import { TileGridBlock } from "./tile-grid";

export const brandLayoutBlocks: Block[] = [
  ProductSliderBlock,
  TileGridBlock,
  CtaBannerBlock,
];

export {
  CtaBannerBlock,
  ProductSliderBlock,
  TileGridBlock,
};

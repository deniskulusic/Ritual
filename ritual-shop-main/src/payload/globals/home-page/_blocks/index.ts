import type { Block } from "payload";

import { CategoryGridBlock } from "./category-grid";
import { FeaturedProductsBlock } from "./featured-products";
import { HowToOrderBlock } from "./how-to-order";
import { IconCardGridBlock } from "./icon-card-grid";
import { NewsletterSignupBlock } from "./newsletter-signup";
import { OfficeShopBlock } from "./office-shop";
import { OverlayTileGridBlock } from "./overlay-tile-grid";
import { PartnersGridBlock } from "./partners-grid";
import { StoryPairBlock } from "./story-pair";

export const homeLayoutBlocks: Block[] = [
  FeaturedProductsBlock,
  CategoryGridBlock,
  OverlayTileGridBlock,
  IconCardGridBlock,
  PartnersGridBlock,
  OfficeShopBlock,
  HowToOrderBlock,
  StoryPairBlock,
  NewsletterSignupBlock,
];

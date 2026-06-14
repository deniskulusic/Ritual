import type { Block } from "payload";

import { CalloutBlock } from "./callout-block";
import { ContentBlock } from "./content-block";

export const blogLayoutBlocks: Block[] = [
  CalloutBlock,
  ContentBlock,
];

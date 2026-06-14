import type { Metadata } from "next";

import { NewsletterSignup } from "../_components/newsletter-signup";
import { FeaturedProducts } from "./_components/featured-products";
import { HomeHero } from "./_components/home-hero";
import { HomePromoPopup } from "./_components/home-promo-popup";
import { HowToOrder } from "./_components/how-to-order";
import { IconCardGrid } from "./_components/icon-card-grid";
import { OfficeShop } from "./_components/office-shop";
import { OverlayTileGrid } from "./_components/overlay-tile-grid";
import { PartnersGrid } from "./_components/partners-grid";
import { ProductCategories } from "./_components/product-categories";
import { StoryPair } from "./_components/story-pair";
import { getHomePageData } from "./_data/home-page-data";
import { PreloaderWrapper } from "./_components/preloader/preloader-wrapper";
import { ParallaxSlider } from "./_components/parallax-slider";

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePageData();

  return {
    description: homePage.metaDescription ?? homePage.hero.description,
    title: homePage.metaTitle ?? `Ritual Shop | ${homePage.hero.title}`,
  };
}

export default async function HomePage() {
  const homePage = await getHomePageData();

  let hasRenderedParallax = false;

  return (
    <>
      <PreloaderWrapper />
      <HomePromoPopup hero={homePage.hero} />
      <HomeHero hero={homePage.hero} />
      {homePage.layout.map((block) => {
        switch (block.blockType) {
          case "featured-products":
            return block.products.length > 0 ? (
              <FeaturedProducts key={block.id} section={block} />
            ) : null;

          case "category-grid":
            return block.items.length > 0 ? (
              <ProductCategories key={block.id} section={block} />
            ) : null;

          case "overlay-tile-grid":
            return block.items.length > 0 ? (
              <OverlayTileGrid key={block.id} section={block} />
            ) : null;

          case "icon-card-grid":
          case "partners-grid":
            if (hasRenderedParallax) return null;
            hasRenderedParallax = true;

            const iconBlock = homePage.layout.find((b) => b.blockType === "icon-card-grid");
            const partnersBlock = homePage.layout.find((b) => b.blockType === "partners-grid");

            return (
              <ParallaxSlider key="parallax-slider">
                {iconBlock && iconBlock.blockType === "icon-card-grid" && iconBlock.items.length > 0 ? (
                  <IconCardGrid section={iconBlock} />
                ) : null}
                {partnersBlock && partnersBlock.blockType === "partners-grid" && partnersBlock.items.length > 0 ? (
                  <PartnersGrid section={partnersBlock} />
                ) : null}
              </ParallaxSlider>
            );

          case "office-shop":
            return block.products.length > 0 ? (
              <OfficeShop key={block.id} section={block} />
            ) : null;

          case "how-to-order":
            return block.steps.length > 0 ? (
              <HowToOrder key={block.id} section={block} />
            ) : null;

          case "story-pair":
            return block.stories.length > 0 ? (
              <StoryPair key={block.id} section={block} />
            ) : null;

          case "newsletter-signup":
            return <NewsletterSignup key={block.id} content={block} />;
        }
      })}
    </>
  );
}

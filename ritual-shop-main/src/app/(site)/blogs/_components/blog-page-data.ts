import "server-only";

import { unstable_cache } from "next/cache";

import type {
  Blog as PayloadBlog,
  BlogPage as PayloadBlogPage,
  Media,
} from "../../../../../payload-types";
import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
  getDocumentTag,
  getGlobalTag,
} from "@/payload/cache/tags";
import { getPayloadClient } from "../../_data/payload-client";

type PayloadBlogListDoc = Pick<
  PayloadBlog,
  "category" | "excerpt" | "id" | "image" | "layout" | "publishedAt" | "readingTime" | "slug" | "title"
>;

type PayloadBlogDetailDoc = PayloadBlogListDoc &
  Pick<PayloadBlog, "heroBadges" | "meta"> & {
    relatedBlogs: {
      blogs?: (number | PayloadBlogListDoc)[] | null;
      eyebrow?: null | string;
      title: string;
    };
  };

export type BlogImage = {
  alt: string;
  cardSrc: string;
  src: string;
};

export type BlogListItem = {
  category: string;
  excerpt: string;
  eyebrow: string;
  image: BlogImage;
  preview: string;
  publishedAt: string;
  readingTime: string;
  slug: string;
  title: string;
};

export type FeaturedBlogItem = BlogListItem & {
  ctaLabel: string;
};

export type BlogContentSection = {
  blockType: "content-block";
  caption?: string;
  id: string;
  image?: BlogImage;
  paragraphs: string[];
  title: string;
};

export type BlogCalloutSection = {
  blockType: "callout-block";
  content: string;
  id: string;
};

export type BlogDetailSection = BlogCalloutSection | BlogContentSection;

export type BlogPageData = {
  featuredPosts: FeaturedBlogItem[];
  intro: {
    eyebrow: null | string;
    title: string;
  };
  latestHeading: {
    description: null | string;
    eyebrow: null | string;
    title: string;
  };
  metaDescription: null | string;
  metaTitle: null | string;
  recentPosts: BlogListItem[];
};

export type BlogPostData = BlogListItem & {
  heroBadges: {
    primaryLabel: string;
    stampLabel: string;
  };
  metaDescription: null | string;
  metaTitle: null | string;
  relatedHeading: {
    eyebrow: null | string;
    title: string;
  };
  relatedPosts: BlogListItem[];
  sections: BlogDetailSection[];
};

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function splitTextareaIntoParagraphs(content: null | string | undefined) {
  return (content ?? "")
    .split(/\r?\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function resolveMedia(
  media: Media | number | null | undefined,
  fallbackAlt: string,
): BlogImage | null {
  if (!media || typeof media === "number" || !media.url) {
    return null;
  }

  return {
    alt: media.alt?.trim() || fallbackAlt,
    cardSrc: media.sizes?.card?.url ?? media.url,
    src: media.url,
  };
}

function formatPublishedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function derivePreviewFromParagraphs(paragraphs: string[], fallback: string) {
  const preview = paragraphs
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .slice(0, 2)
    .join(" ");

  return preview || fallback;
}

function mapPayloadListItem(post: PayloadBlogListDoc): BlogListItem | null {
  const image = resolveMedia(post.image, post.title);

  if (!image) {
    return null;
  }

  const preview = derivePreviewFromParagraphs(
    (post.layout ?? [])
      .filter((section) => section.blockType === "content-block")
      .flatMap((section) => splitTextareaIntoParagraphs(section.content)),
    post.excerpt,
  );

  return {
    category: post.category,
    excerpt: post.excerpt,
    eyebrow: "Ritual Journal",
    image,
    preview,
    publishedAt: formatPublishedAt(post.publishedAt),
    readingTime: post.readingTime,
    slug: post.slug,
    title: post.title,
  };
}

function mapPayloadSections(post: PayloadBlogListDoc) {
  return (post.layout ?? []).flatMap<BlogDetailSection>((section, index) => {
    const id = section.id ?? `${section.blockType}-${index}`;

    switch (section.blockType) {
      case "callout-block":
        return [
          {
            blockType: section.blockType,
            content: section.content,
            id,
          },
        ];

      case "content-block":
        return [
          {
            blockType: section.blockType,
            caption: normalizeText(section.caption) ?? undefined,
            id,
            image: section.image ? (resolveMedia(section.image, section.title) ?? undefined) : undefined,
            paragraphs: splitTextareaIntoParagraphs(section.content),
            title: section.title,
          },
        ];
    }

    return [];
  });
}

function mapPayloadPost(post: PayloadBlogDetailDoc): BlogPostData | null {
  const listItem = mapPayloadListItem(post);

  if (!listItem) {
    return null;
  }

  const relatedPosts = (post.relatedBlogs?.blogs ?? []).flatMap((relatedPost) => {
    if (typeof relatedPost === "number") {
      return [];
    }

    const mapped = mapPayloadListItem(relatedPost);

    return mapped ? [mapped] : [];
  });

  return {
    ...listItem,
    heroBadges: {
      primaryLabel: post.heroBadges.primaryLabel,
      stampLabel: post.heroBadges.stampLabel,
    },
    metaDescription: post.meta?.description ?? post.excerpt,
    metaTitle: post.meta?.title ?? null,
    relatedHeading: {
      eyebrow: post.relatedBlogs?.eyebrow ?? "Dalje čitati",
      title: post.relatedBlogs?.title ?? "Još iz Ritual Journala",
    },
    relatedPosts,
    sections: mapPayloadSections(post),
  };
}

function buildFeaturedPosts(
  featuredItems: PayloadBlogPage["featuredBlogs"],
) {
  return (featuredItems ?? []).flatMap<FeaturedBlogItem>((item) => {
    if (typeof item.blog === "number") {
      return [];
    }

    const mapped = mapPayloadListItem(item.blog);

    if (!mapped) {
      return [];
    }

    return [
      {
        ...mapped,
        ctaLabel: item.ctaLabel,
      },
    ];
  });
}

async function readBlogPageData() {
  const payload = await getPayloadClient();
  const [page, postsResult] = await Promise.all([
    payload.findGlobal({
      slug: "blog-page",
      depth: 2,
      select: {
        featuredBlogs: true,
        intro: true,
        latestBlogs: true,
        meta: true,
      },
    }),
    payload.find({
      collection: "blogs",
      depth: 2,
      pagination: false,
      select: {
        category: true,
        excerpt: true,
        image: true,
        layout: true,
        publishedAt: true,
        readingTime: true,
        slug: true,
        title: true,
      },
      sort: "-publishedAt",
    }),
  ]);

  const featuredPosts = buildFeaturedPosts(page.featuredBlogs);
  const featuredSlugs = new Set(featuredPosts.map((post) => post.slug));
  const recentPosts = postsResult.docs
    .filter((post) => !featuredSlugs.has(post.slug))
    .flatMap((post) => {
      const mapped = mapPayloadListItem(post);

      return mapped ? [mapped] : [];
    });

  return {
    featuredPosts,
    intro: {
      eyebrow: page.intro?.eyebrow ?? null,
      title: page.intro.title,
    },
    latestHeading: {
      description: page.latestBlogs.description,
      eyebrow: page.latestBlogs?.eyebrow ?? null,
      title: page.latestBlogs.title,
    },
    metaDescription: page.meta?.description ?? null,
    metaTitle: page.meta?.title ?? null,
    recentPosts,
  } satisfies BlogPageData;
}

async function readBlogPostBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "blogs",
    depth: 2,
    pagination: false,
    select: {
      category: true,
      excerpt: true,
      heroBadges: true,
      image: true,
      layout: true,
      meta: true,
      publishedAt: true,
      readingTime: true,
      relatedBlogs: true,
      slug: true,
      title: true,
    },
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const post = result.docs[0];

  return post ? mapPayloadPost(post) : null;
}

export const getBlogPageData = unstable_cache(readBlogPageData, ["blog-page-data"], {
  tags: [FRONTEND_CACHE_TAG, getGlobalTag("blog-page"), getCollectionTag("blogs")],
});

export async function getBlogPostBySlug(slug: string) {
  return unstable_cache(() => readBlogPostBySlug(slug), ["blog-post", slug], {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("blogs"), getDocumentTag("blogs", slug)],
  })();
}

export const getBlogPostSlugs = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "blogs",
      depth: 0,
      pagination: false,
      select: {
        slug: true,
      },
      sort: "-publishedAt",
    });

    return result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  },
  ["blog-post-slugs"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("blogs")],
  },
);

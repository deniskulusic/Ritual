import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { searchPlugin } from "@payloadcms/plugin-search";
import { s3Storage } from "@payloadcms/storage-s3";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { en } from "@payloadcms/translations/languages/en";
import { hr } from "@payloadcms/translations/languages/hr";
import { revalidateTag } from "next/cache";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";

import { FRONTEND_CACHE_TAG } from "./payload/cache/tags";
import {
  withCollectionRevalidation,
  withGlobalRevalidation,
} from "./payload/cache/revalidation";
import { Brands } from "./payload/collections/brands";
import { Blogs } from "./payload/collections/blogs";
import { Carts } from "./payload/collections/carts";
import { Categories } from "./payload/collections/categories";
import { CustomerIdentities } from "./payload/collections/customer-identities";
import { Customers } from "./payload/collections/customers";
import { LegalPages } from "./payload/collections/legal-pages";
import { ListingPages } from "./payload/collections/listing-pages";
import { Media } from "./payload/collections/media";
import { Orders } from "./payload/collections/orders";
import { Pages } from "./payload/collections/pages";
import { PromoCodes } from "./payload/collections/promo-codes";
import { Products } from "./payload/collections/products";
import {
  searchProducts,
  syncProductSearchDocument,
} from "./payload/collections/products/search-index";
import { adminGroups, localizedLabel } from "./payload/shared/admin-copy";
import { Users } from "./payload/collections/users";
import { Footer } from "./payload/globals/footer";
import { Header } from "./payload/globals/header";
import { BlogPage } from "./payload/globals/blog-page";
import { HomePage } from "./payload/globals/home-page";
import { SiteSettings } from "./payload/globals/site-settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

dotenv.config({
  path: path.resolve(dirname, "../.env.local"),
});

const databaseURL = process.env.DATABASE_URL;
const payloadSecret = process.env.PAYLOAD_SECRET;

if (!databaseURL) {
  throw new Error("DATABASE_URL is required to initialize Payload.");
}

if (!payloadSecret) {
  throw new Error("PAYLOAD_SECRET is required to initialize Payload.");
}

const summarizeMetaDescription = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > 156
    ? `${normalized.slice(0, 153).trim()}...`
    : normalized;
};

export default buildConfig({
  admin: {
    avatar: {
      Component: "./_components/ritual-admin-avatar.tsx#RitualAdminAvatar",
    },
    meta: {
      icons: {
        apple: "/ritual/uploads/icon.jpg",
        icon: "/ritual/uploads/icon.jpg",
        shortcut: "/ritual/uploads/icon.jpg",
      },
    },
    components: {
      graphics: {
        Icon: "./_components/ritual-admin-icon.tsx#RitualAdminIcon",
        Logo: "./_components/ritual-admin-logo.tsx#RitualAdminLogo",
      },
      Nav: "./_components/ritual-nav/index.tsx#RitualNav",
      logout: {
        Button: "./_components/ritual-logout-button.tsx#RitualLogoutButton",
      },
      views: {
        dashboard: {
          Component: "./_components/ritual-dashboard/index.tsx#RitualDashboard",
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname, "./app/(payload)"),
      importMapFile: path.resolve(dirname, "./app/(payload)/admin/importMap.js"),
    },
    user: Users.slug,
  },
  collections: [
    Users,
    withCollectionRevalidation(Media),
    withCollectionRevalidation(Brands),
    withCollectionRevalidation(Blogs),
    withCollectionRevalidation(Categories),
    withCollectionRevalidation(LegalPages),
    withCollectionRevalidation(ListingPages),
    withCollectionRevalidation(Pages),
    withCollectionRevalidation(Products),
    Customers,
    CustomerIdentities,
    PromoCodes,
    Carts,
    Orders,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  editor: lexicalEditor(),
  endpoints: [
    {
      handler: searchProducts,
      method: "get",
      path: "/product-search",
    },
    {
      handler: (req) => {
        if (!req.user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        revalidateTag(FRONTEND_CACHE_TAG, "max");

        return Response.json({
          revalidated: true,
          tag: FRONTEND_CACHE_TAG,
        });
      },
      method: "post",
      path: "/admin/cache/revalidate",
    },
  ],
  globals: [
    withGlobalRevalidation(SiteSettings),
    withGlobalRevalidation(Header),
    withGlobalRevalidation(Footer),
    withGlobalRevalidation(HomePage),
    withGlobalRevalidation(BlogPage),
  ],
  graphQL: {
    disable: true,
  },
  i18n: {
    fallbackLanguage: "hr",
    supportedLanguages: {
      en,
      hr,
    },
  },
  plugins: [
    searchPlugin({
      beforeSync: syncProductSearchDocument,
      collections: ["products"],
      defaultPriorities: {
        products: 10,
      },
      searchOverrides: {
        admin: {
          defaultColumns: ["title", "brand", "categoryName", "updatedAt"],
          group: adminGroups.catalogue,
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: "slug",
            type: "text",
            admin: {
              readOnly: true,
            },
            index: true,
          },
          {
            name: "brand",
            type: "text",
            admin: {
              readOnly: true,
            },
            index: true,
          },
          {
            name: "categoryName",
            type: "text",
            admin: {
              readOnly: true,
            },
            index: true,
          },
          {
            name: "priceLabel",
            type: "text",
            admin: {
              readOnly: true,
            },
          },
          {
            name: "image",
            type: "text",
            admin: {
              readOnly: true,
            },
          },
          {
            name: "searchText",
            type: "textarea",
            admin: {
              readOnly: true,
            },
          },
          {
            name: "status",
            type: "text",
            admin: {
              readOnly: true,
            },
            index: true,
          },
          {
            name: "catalogReviewStatus",
            type: "text",
            admin: {
              readOnly: true,
            },
            index: true,
          },
        ],
        labels: {
          plural: localizedLabel("Search Results", "Rezultati pretrage"),
          singular: localizedLabel("Search Result", "Rezultat pretrage"),
        },
      },
    }),
    seoPlugin({
      collections: ["legal-pages", "blogs", "products"],
      generateDescription: ({ collectionSlug, doc, globalSlug }) => {
        if (globalSlug === "home-page") {
          return typeof doc?.hero?.description === "string" ? doc.hero.description : "";
        }

        if (globalSlug === "blog-page") {
          return "Ritual Journal okuplja priče o pripremi, prostoru, okusu i svakodnevnim ritualima brenda.";
        }

        if (collectionSlug === "blogs") {
          return typeof doc?.excerpt === "string" ? doc.excerpt : "";
        }

        if (collectionSlug === "products") {
          const description = summarizeMetaDescription(doc?.description);

          if (description) {
            return description;
          }

          return typeof doc?.title === "string"
            ? `${doc.title} dostupan je u Ritual Shop ponudi.`
            : "Proizvod iz Ritual Shop ponude.";
        }

        return typeof doc?.title === "string" ? `Informacije za stranicu ${doc.title}.` : "";
      },
      generateTitle: ({ collectionSlug, doc, globalSlug }) => {
        if (globalSlug === "blog-page") {
          return "Blog | Ritual Shop";
        }

        if (collectionSlug === "blogs") {
          return typeof doc?.title === "string" ? `${doc.title} | Ritual Shop` : "Blog | Ritual Shop";
        }

        if (collectionSlug === "products") {
          return typeof doc?.title === "string"
            ? `${doc.title} | Ritual Shop`
            : "Proizvod | Ritual Shop";
        }

        const titleSource =
          globalSlug === "home-page"
            ? typeof doc?.hero?.title === "string"
              ? doc.hero.title
              : null
            : typeof doc?.title === "string"
              ? doc.title
              : null;

        return titleSource ? `Ritual Shop | ${titleSource}` : "Ritual Shop";
      },
      globals: ["home-page", "blog-page"],
      tabbedUI: true,
      uploadsCollection: "media",
    }),
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: (args) => {
            return `${process.env.S3_HOSTNAME}/${args.filename}`;
          },
        },
      },
      bucket: process.env.S3_BUCKET as string,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
  routes: {
    admin: "/admin",
    api: "/api",
  },
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "../payload-types.ts"),
  },
});

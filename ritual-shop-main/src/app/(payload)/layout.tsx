import {
  RootLayout,
  handleServerFunctions,
  metadata as payloadMetadata,
} from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import type { ServerFunctionClient } from "payload";
import React from "react";

import config from "@payload-config";

import "./custom.scss";
import { importMap } from "./admin/importMap.js";

export const metadata: Metadata = {
  ...payloadMetadata,
  icons: {
    apple: "/ritual/uploads/icon.jpg",
    icon: "/ritual/uploads/icon.jpg",
    shortcut: "/ritual/uploads/icon.jpg",
  },
};

const recoleta = localFont({
  src: [
    {
      path: "../../../public/ritual/fonts/Recoleta/Recoleta SemiBold.otf",
      style: "normal",
      weight: "600",
    },
    {
      path: "../../../public/ritual/fonts/Recoleta/Recoleta Bold.otf",
      style: "normal",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-heading",
});

const mulish = Mulish({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return RootLayout({
    children,
    config,
    htmlProps: {
      className: `${recoleta.variable} ${mulish.variable}`,
      lang: "hr",
    },
    importMap,
    serverFunction,
  });
}

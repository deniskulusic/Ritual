import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import type { CSSProperties, ReactNode } from "react";

import "../globals.css";
import { CartProvider } from "./_components/cart-provider";
import { Footer } from "./_components/footer";
import { getFooterData } from "./_components/footer/data";
import { getHeaderData } from "./_components/header/data";
import { Header } from "./_components/header";
import { SmoothScrollProvider } from "./_components/smooth-scroll-provider";
import { EntranceProvider } from "./_components/entrance-provider";

const recoleta = localFont({
  src: [
    {
      path: "../../../public/ritual/fonts/Recoleta/Recoleta SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/ritual/fonts/Recoleta/Recoleta Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ritual Shop",
  description: "Frontend reconstruction of the Ritual Shop storefront in Next.js.",
  icons: {
    apple: "/ritual/uploads/icon.jpg",
    icon: "/ritual/uploads/icon.jpg",
    shortcut: "/ritual/uploads/icon.jpg",
  },
};

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [header, footer] = await Promise.all([getHeaderData(), getFooterData()]);
  const bodyStyle = {
    ["--site-promo-bar-height" as string]: header.announcementText ? "46px" : "0px",
  } satisfies CSSProperties;

  return (
    <html lang="hr" className={`${recoleta.variable} ${mulish.variable}`} suppressHydrationWarning>
      <body style={bodyStyle} suppressHydrationWarning>
        <SmoothScrollProvider>
          <EntranceProvider>
            <CartProvider>
              <Header header={header} />
              {children}
            </CartProvider>
            <Footer footer={footer} />
          </EntranceProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

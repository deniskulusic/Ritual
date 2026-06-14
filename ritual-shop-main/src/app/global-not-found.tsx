import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import { NotFoundView } from "./(site)/_components/not-found-view";

const recoleta = localFont({
  src: [
    {
      path: "../../public/ritual/fonts/Recoleta/Recoleta SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/ritual/fonts/Recoleta/Recoleta Bold.otf",
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
  title: "Not Found | Ritual Shop",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="hr" className={`${recoleta.variable} ${mulish.variable}`}>
      <body>
        <NotFoundView includeHeaderClearance={false} />
      </body>
    </html>
  );
}

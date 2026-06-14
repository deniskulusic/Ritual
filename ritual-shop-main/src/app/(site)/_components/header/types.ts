import type { ResolvedLinkData } from "../../_helpers/resolve-payload-link";

export type HeaderNavItem = {
  key: string;
  label: string;
  link: ResolvedLinkData | null;
  megaMenu?: {
    brandPanel: {
      logos: Array<{
        imageAlt: string;
        imageSrc: string;
        link: ResolvedLinkData | null;
        name: string;
      }>;
      title: string;
    } | null;
    columns: Array<{
      links: ResolvedLinkData[];
      title: string;
    }>;
    feature: {
      eyebrow: string | null;
      imageAlt: string;
      imageSrc: string;
      link: ResolvedLinkData | null;
      title: string;
    } | null;
    layout: "brands-panel" | "classic";
  };
};

export type HeaderData = {
  announcementText: string | null;
  mobileNavigation: ResolvedLinkData[];
  primaryNavigation: HeaderNavItem[];
};

export type HeaderProps = {
  header: HeaderData;
};

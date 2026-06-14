import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { ResolvedLinkData } from "../_helpers/resolve-payload-link";

type ResolvedLinkProps = {
  children?: ReactNode;
  className?: string;
  link: ResolvedLinkData;
  style?: CSSProperties;
};

export function ResolvedLink({ children, className, link, style }: ResolvedLinkProps) {
  return (
    <Link
      className={className}
      href={link.href}
      prefetch={link.kind === "internal" ? undefined : false}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      style={style}
      target={link.openInNewTab ? "_blank" : undefined}
    >
      {children ?? link.label}
    </Link>
  );
}

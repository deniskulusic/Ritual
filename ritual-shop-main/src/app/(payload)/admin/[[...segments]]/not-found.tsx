import type { Metadata } from "next";
import { NotFoundPage, generatePageMetadata } from "@payloadcms/next/views";

import config from "@payload-config";

import { importMap } from "../importMap.js";

type NotFoundProps = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({
  params,
  searchParams,
}: NotFoundProps): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params,
    searchParams,
  });

const NotFound = ({ params, searchParams }: NotFoundProps) =>
  NotFoundPage({
    config,
    importMap,
    params,
    searchParams,
  });

export default NotFound;

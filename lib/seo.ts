import type { Metadata } from "next";

import { getPublicEnv } from "@/lib/env";

export type PageSeo = {
  description: string;
  openGraphDescription: string;
  title: string;
};

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getPublicEnv().NEXT_PUBLIC_SITE_URL).toString();
}

export function buildPageMetadata({
  pathname,
  seo,
}: {
  pathname: string;
  seo: PageSeo;
}): Metadata {
  const url = absoluteUrl(pathname);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seo.title,
      description: seo.openGraphDescription,
      url,
      locale: "nb_NO",
      siteName: "Senja Malere",
      type: "website",
    },
  };
}

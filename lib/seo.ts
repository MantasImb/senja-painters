import type { Metadata } from "next";

import { getPublicEnv } from "@/lib/env";

const publicEnv = getPublicEnv();

export type PageSeo = {
  description: string;
  openGraphDescription: string;
  title: string;
};

const defaultOpenGraphImage = {
  alt: "Moderne enebolig med lys fasade i skumringen",
  height: 960,
  pathname: "/hero.jpg",
  width: 1440,
};

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, publicEnv.NEXT_PUBLIC_SITE_URL).toString();
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
      images: [
        {
          url: absoluteUrl(defaultOpenGraphImage.pathname),
          width: defaultOpenGraphImage.width,
          height: defaultOpenGraphImage.height,
          alt: defaultOpenGraphImage.alt,
        },
      ],
      locale: "nb_NO",
      siteName: "Senja Malere",
      type: "website",
    },
  };
}

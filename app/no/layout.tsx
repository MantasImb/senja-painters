import type { ReactNode } from "react";

import { buildPublicJsonLd, serializeJsonLd } from "@/lib/structured-data";

export default function PublicNorwegianLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <script
        data-testid="public-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildPublicJsonLd()),
        }}
      />
      {children}
    </>
  );
}

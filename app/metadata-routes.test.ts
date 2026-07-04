import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("metadata routes", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://senjamalere.no";
  });

  it("lists every V1 public page in the sitemap", async () => {
    const sitemap = (await import("@/app/sitemap")).default();

    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://senjamalere.no/no",
      "https://senjamalere.no/no/senja",
      "https://senjamalere.no/no/finnsnes",
      "https://senjamalere.no/no/innvendig-maling",
      "https://senjamalere.no/no/utvendig-maling",
      "https://senjamalere.no/no/mobelmaling",
      "https://senjamalere.no/no/kontakt",
      "https://senjamalere.no/no/personvern",
    ]);
    expect(sitemap.every((entry) => entry.changeFrequency === "monthly")).toBe(
      true,
    );
  });

  it("allows public crawling while excluding admin routes", async () => {
    const robots = (await import("@/app/robots")).default();

    expect(robots).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
      sitemap: "https://senjamalere.no/sitemap.xml",
    });
  });

  it("exposes generated favicon assets and the web app manifest from root metadata", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata).toMatchObject({
      applicationName: "Senja Malere",
      manifest: "/site.webmanifest",
      icons: {
        icon: [
          { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
          { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: [
          {
            url: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
    });
  });

  it("describes Senja Malere in the public web app manifest", () => {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "public/site.webmanifest"), "utf8"),
    );

    expect(manifest).toMatchObject({
      name: "Senja Malere",
      short_name: "Senja Malere",
      description: "Malerhjelp for hjem på Senja og i Finnsnes.",
      lang: "nb",
      start_url: "/no",
      scope: "/",
      display: "standalone",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });
  });
});

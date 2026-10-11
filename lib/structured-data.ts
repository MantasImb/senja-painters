import { absoluteUrl } from "@/lib/seo";
import { publicContactInfo } from "@/lib/content/public-pages";

export function buildPublicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Senja Malere",
        url: absoluteUrl("/no"),
        inLanguage: "nb-NO",
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Senja Malere",
        url: absoluteUrl("/no"),
        telephone: publicContactInfo.phoneDisplay,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: publicContactInfo.phoneDisplay,
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "08:00",
            closes: "22:00",
          },
        },
        areaServed: [
          {
            "@type": "Place",
            name: "Senja",
          },
          {
            "@type": "Place",
            name: "Finnsnes",
          },
        ],
        makesOffer: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Innvendig maling",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Utvendig maling",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Møbelmaling",
            },
          },
        ],
      },
    ],
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

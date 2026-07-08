import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  launchFaq,
  publicContactInfo,
  publicHomePage,
  publicPages,
  requestProcessSteps,
} from "@/lib/content/public-pages";

const cityPages = [
  { name: publicPages.senja.title, href: publicPages.senja.pathname },
  { name: publicPages.finnsnes.title, href: publicPages.finnsnes.pathname },
];

export function RequestProcess() {
  return (
    <section aria-labelledby="request-process-heading">
      <h2
        className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600"
        id="request-process-heading"
      >
        Slik fungerer forespørselen
      </h2>
      <div className="mt-5 grid gap-4">
        {requestProcessSteps.map((step) => (
          <article
            className="border-l-2 border-neutral-950 pl-5"
            key={step.title}
          >
            <h3 className="text-lg font-semibold tracking-normal">
              {step.title}
            </h3>
            <p className="mt-2 leading-7 text-neutral-600">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SecondaryContact({ inverse }: { inverse: boolean }) {
  return (
    <div
      className={[
        "border-l-2 px-5 py-4",
        inverse
          ? "border-white/45 bg-white/8 text-white"
          : "border-neutral-300 bg-white text-neutral-950",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm font-semibold uppercase tracking-[0.16em]",
          inverse ? "text-white/60" : "text-neutral-500",
        ].join(" ")}
      >
        Du kan også ringe
      </p>
      <a
        className={[
          "mt-3 inline-flex text-xl font-semibold underline-offset-4 hover:underline",
          inverse ? "text-white" : "text-neutral-950",
        ].join(" ")}
        href={publicContactInfo.phoneHref}
      >
        {publicContactInfo.phoneDisplay}
      </a>
      <p
        className={[
          "mt-2 text-sm",
          inverse ? "text-white/65" : "text-neutral-600",
        ].join(" ")}
      >
        Kontakt tilgjengelig {publicContactInfo.hours.toLowerCase()}.
      </p>
    </div>
  );
}

export function LaunchFaq() {
  return (
    <section
      aria-labelledby="launch-faq-heading"
      className="border-t border-neutral-300 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600">
            FAQ
          </p>
          <h2
            className="mt-4 text-4xl font-semibold leading-tight tracking-normal"
            id="launch-faq-heading"
          >
            Ofte stilte spørsmål
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {launchFaq.map((item) => (
            <article
              className="border-l-2 border-neutral-950 bg-neutral-100 px-6 py-5"
              key={item.question}
            >
              <h3 className="text-xl font-semibold tracking-normal">
                {item.question}
              </h3>
              <p className="mt-3 leading-7 text-neutral-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-300 bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.85fr_0.85fr_0.9fr]">
        <div>
          <p className="text-3xl font-semibold">Senja Malere</p>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            {publicHomePage.footerText}
          </p>
        </div>
        <FooterLinkColumn
          ariaLabel="Bunnmeny områder"
          title="Områder"
          links={cityPages}
          inverse
        />
        <FooterLinkColumn
          ariaLabel="Bunnmeny tilbud"
          title="Tjenester"
          links={[
            ...publicHomePage.services.map((service) => ({
              name: service.title,
              href: service.pathname,
            })),
          ]}
          inverse
        />
        <SecondaryContact inverse />
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  ariaLabel,
  title,
  links,
  inverse = false,
}: {
  ariaLabel: string;
  title: string;
  links: { name: string; href: string }[];
  inverse?: boolean;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <p
        className={[
          "text-sm font-semibold uppercase tracking-[0.16em]",
          inverse ? "text-white/55" : "text-neutral-500",
        ].join(" ")}
      >
        {title}
      </p>
      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Button
            asChild
            key={link.href}
            variant={inverse ? "siteLinkInverse" : "siteLink"}
          >
            {link.href.startsWith("/") ? (
              <Link href={link.href}>{link.name}</Link>
            ) : (
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.name}
              </a>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}

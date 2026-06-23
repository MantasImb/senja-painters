import Link from "next/link";
import { ArmchairIcon, HouseIcon, PaintbrushIcon } from "lucide-react";

import { LeadForm, type LeadFormAction } from "@/components/forms/LeadForm";
import { PageViewBeacon } from "@/components/site/PageViewBeacon";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  publicHomePage,
  publicPages,
  type PublicHomePageContent,
} from "@/lib/content/public-pages";

const cityPages = [
  { name: publicPages.senja.title, href: publicPages.senja.pathname },
  { name: publicPages.finnsnes.title, href: publicPages.finnsnes.pathname },
];

export function SenjaHomePage({
  leadAction,
}: {
  leadAction: LeadFormAction;
}) {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <PageViewBeacon page="/no" />
      <SiteHeader overlay />
      <Hero />
      <Services />
      <ContactSection leadAction={leadAction} />
      <SeoFooter />
    </main>
  );
}

function Hero() {
  const { hero } = publicHomePage;

  return (
    <section className="relative flex min-h-[78vh] items-end overflow-hidden bg-neutral-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(135deg,transparent_0_48%,rgba(255,255,255,0.06)_48%_50%,transparent_50%_100%)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 lg:pb-20">
        <div className="max-w-3xl text-white">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
              {hero.eyebrow}
            </p>
            <span className="h-px w-12 bg-white/35" />
            <p className="text-sm font-medium text-white/80">{hero.kicker}</p>
          </div>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/84">
            {hero.text}
          </p>
          <CtaButtons />
          <AreaTags className="mt-10" />
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="tjenester" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionIntro {...publicHomePage.servicesIntro} />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {publicHomePage.services.map((service) => (
          <ServiceCard key={service.pathname} service={service} />
        ))}
      </div>
    </section>
  );
}

function ContactSection({ leadAction }: { leadAction: LeadFormAction }) {
  const { contact } = publicHomePage;

  return (
    <section id="foresporsel" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-xl pt-2">
          <SectionIntro {...contact} />
        </div>
        <LeadForm
          action={leadAction}
          sourcePage="/no"
          title="Start forespørselen"
        />
      </div>
    </section>
  );
}

function SeoFooter() {
  return (
    <footer className="border-t border-neutral-300 bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="text-3xl font-semibold">Senja Malere</p>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            {publicHomePage.footerText}
          </p>
        </div>
        <FooterLinkColumn title="Områder" links={cityPages} inverse />
        <FooterLinkColumn
          title="Tjenester"
          links={[
            ...publicHomePage.services.map((service) => ({
              name: service.title,
              href: service.pathname,
            })),
          ]}
          inverse
        />
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
  inverse = false,
}: {
  title: string;
  links: { name: string; href: string }[];
  inverse?: boolean;
}) {
  return (
    <nav aria-label={title}>
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
              <a href={link.href}>{link.name}</a>
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-neutral-600">{text}</p>
    </div>
  );
}

function CtaButtons() {
  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      <Button
        asChild
        className="min-h-12 rounded-[6px] px-6 text-sm font-semibold"
        size="lg"
        variant="heroPrimary"
      >
        <a href="#foresporsel">Be om kontakt</a>
      </Button>
      <Button
        asChild
        className="min-h-12 rounded-[6px] px-6 text-sm font-semibold"
        size="lg"
        variant="heroOutline"
      >
        <a href="#tjenester">Se tjenester</a>
      </Button>
    </div>
  );
}

function AreaTags({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "flex flex-wrap gap-3 text-sm font-medium text-white/90",
        className,
      ].join(" ")}
    >
      {publicHomePage.areas.map((area) => (
        <Badge
          key={area}
          className="rounded-full border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white/90"
          variant="outline"
        >
          {area}
        </Badge>
      ))}
    </div>
  );
}

function ServiceCard({
  service,
}: {
  service: PublicHomePageContent["services"][number];
}) {
  const Icon =
    service.icon === "interior"
      ? PaintbrushIcon
      : service.icon === "exterior"
        ? HouseIcon
        : ArmchairIcon;

  return (
    <Card className="rounded-[8px] border-neutral-300 bg-white shadow-sm shadow-black/5">
      <CardContent className="p-6">
        <div className="flex size-12 items-center justify-center rounded-[6px] bg-neutral-950 text-white">
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <h3 className="mt-5 text-xl font-semibold">{service.title}</h3>
        <p className="mt-4 leading-7 text-neutral-600">{service.text}</p>
        <Button asChild className="mt-6 px-0" variant="link">
          <Link href={service.pathname}>Les om {service.title.toLowerCase()}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

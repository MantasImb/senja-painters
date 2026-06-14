import Image from "next/image";
import Link from "next/link";

import { LeadForm, type LeadFormAction } from "@/components/forms/LeadForm";
import { PageViewBeacon } from "@/components/site/PageViewBeacon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const areas = ["Senja", "Finnsnes", "Silsand", "Gibostad"];

const cityPages = [
  { name: "Senja", href: "/no/senja" },
  { name: "Finnsnes", href: "/no/finnsnes" },
];

const serviceCards = [
  {
    title: "Innvendig maling",
    image: "/interior.jpg",
    imageAlt: "Nymalt interiør med rene veggflater",
    text: "Vegger, tak, listverk og rom som trenger en ryddig overflate og et pent sluttresultat.",
  },
  {
    title: "Utvendig maling",
    image: "/exterior.jpg",
    imageAlt: "Utvendig malt boligfasade",
    text: "Fasader, kledning og detaljer der underlag, vær og forarbeid må vurderes før jobben planlegges.",
  },
  {
    title: "Møbler og detaljer",
    image: "/furniture.jpg",
    imageAlt: "Malt møbel med detaljert finish",
    text: "Maling av møbler, skap, dører og detaljer som trenger nytt uttrykk eller bedre finish.",
  },
];

export function SenjaHomePage({
  leadAction,
}: {
  leadAction: LeadFormAction;
}) {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <PageViewBeacon page="/no" />
      <PictureHero
        eyebrow="Senja Painters"
        kicker="Senja og Finnsnes"
        title="Malerhjelp for hjem på Senja og i Finnsnes."
        text="Lokalt malerarbeid starter best med en enkel avklaring. Fortell oss kort om prosjektet, så tar Senja Painters kontakt om omfang, tidspunkt og neste steg."
        align="bottom"
      />
      <ServicesImageCards />
      <ContactSection leadAction={leadAction} />
      <SeoFooter />
    </main>
  );
}

function PictureHero({
  eyebrow,
  kicker,
  title,
  text,
  align,
}: {
  eyebrow: string;
  kicker: string;
  title: string;
  text: string;
  align: "bottom" | "center";
}) {
  return (
    <section
      className={[
        "relative flex min-h-[88vh] overflow-hidden",
        align === "bottom" ? "items-end" : "items-center",
      ].join(" ")}
    >
      <Image
        src="/hero.jpg"
        alt="Illustrert kysthus med fjell og fjord"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-black/12" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-24 sm:px-8 lg:pb-20">
        <div className="max-w-3xl text-white">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
              {eyebrow}
            </p>
            <span className="h-px w-12 bg-white/35" />
            <p className="text-sm font-medium text-white/80">{kicker}</p>
          </div>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/84">
            {text}
          </p>
          <CtaButtons />
          <AreaTags className="mt-10" />
        </div>
      </div>
    </section>
  );
}

function ServicesImageCards() {
  return (
    <section id="tjenester" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionIntro
        eyebrow="Tjenester"
        title="Tre tydelige tjenester for hjem og detaljer."
        text="Tjenestene er presentert med tydelige bildekort, slik at besøkende raskt kan skanne hva Senja Painters kan hjelpe med."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {serviceCards.map((service) => (
          <ImageServiceCard key={service.title} service={service} />
        ))}
      </div>
    </section>
  );
}

function ContactSection({ leadAction }: { leadAction: LeadFormAction }) {
  return (
    <section id="foresporsel" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-xl pt-2">
          <SectionIntro
            eyebrow="Be om kontakt"
            title="Fortell oss kort om malejobben."
            text="Skjemaet samler det viktigste for en god første samtale. E-post er valgfritt, og kontakt går gjennom forespørselen."
          />
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
          <p className="text-3xl font-semibold">Senja Painters</p>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            Norsk først, lokalt rettet og bygget rundt forespørsler fra
            boligeiere i Senja-regionen.
          </p>
        </div>
        <FooterLinkColumn title="Områder" links={cityPages} inverse />
        <FooterLinkColumn
          title="Tjenester"
          links={[
            { name: "Innvendig maling", href: "/no/innvendig-maling" },
            { name: "Utvendig maling", href: "/no/utvendig-maling" },
            { name: "Møbler og detaljer", href: "/no/mobelmaling" },
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
      {areas.map((area) => (
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

function ImageServiceCard({ service }: { service: (typeof serviceCards)[number] }) {
  return (
    <Card className="overflow-hidden rounded-[8px] border-neutral-300 bg-white py-0 shadow-sm shadow-black/5">
      <div className="relative aspect-[5/4] bg-neutral-200">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold">{service.title}</h3>
        <p className="mt-4 leading-7 text-neutral-600">{service.text}</p>
      </CardContent>
    </Card>
  );
}

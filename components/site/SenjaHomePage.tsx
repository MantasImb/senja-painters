import Image from "next/image";
import Link from "next/link";

import { LeadForm, type LeadFormAction } from "@/components/forms/LeadForm";
import { PageViewBeacon } from "@/components/site/PageViewBeacon";
import {
  LaunchFaq,
  RequestProcess,
  SecondaryContact,
  SiteFooter,
} from "@/components/site/PublicSupportSections";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  publicHomePage,
  type PublicHomePageContent,
} from "@/lib/content/public-pages";

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
      <About />
      <ContactSection leadAction={leadAction} />
      <LaunchFaq />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  const { hero } = publicHomePage;

  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-neutral-950">
      <Image
        alt={hero.imageAlt}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={hero.image}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-black/12" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-24 sm:px-8 lg:pb-20">
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

function About() {
  return (
    <section className="border-y border-neutral-300 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <SectionIntro {...publicHomePage.about} />
      </div>
    </section>
  );
}

function ContactSection({ leadAction }: { leadAction: LeadFormAction }) {
  const { contact } = publicHomePage;

  return (
    <section id="foresporsel" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="grid max-w-xl gap-8 pt-2">
          <SectionIntro {...contact} />
          <RequestProcess />
          <SecondaryContact inverse={false} />
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
  return (
    <Card className="overflow-hidden rounded-[8px] border-neutral-300 bg-white py-0 shadow-sm shadow-black/5">
      <div className="relative aspect-[5/4] bg-neutral-200">
        <Image
          alt={service.imageAlt}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          src={service.image}
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold">{service.title}</h3>
        <p className="mt-4 leading-7 text-neutral-600">{service.text}</p>
        <Button asChild className="mt-6 px-0" variant="link">
          <Link href={service.pathname}>Les om {service.title.toLowerCase()}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

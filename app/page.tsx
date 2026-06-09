import Image from "next/image";

const services = [
  "Innvendig maling",
  "Utvendig maling",
  "Møbler og detaljer",
];

const areas = ["Senja", "Finnsnes", "Silsand", "Gibostad"];

const cityPages = [
  { name: "Senja", href: "/senja" },
  { name: "Finnsnes", href: "/finnsnes" },
  { name: "Silsand", href: "/silsand" },
  { name: "Gibostad", href: "/gibostad" },
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

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <PictureHero
        eyebrow="Senja Painters"
        kicker="Senja og Finnsnes"
        title="Malerhjelp for hjem på Senja og i Finnsnes."
        text="Lokalt malerarbeid starter best med en enkel avklaring. Fortell oss kort om prosjektet, så tar Senja Painters kontakt om omfang, tidspunkt og neste steg."
        align="bottom"
      />
      <ServicesImageCards />
      <ContactSection />
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
        title="Tre tydelige tjenester, vist med ekte visuelle spor."
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

function ContactSection() {
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
        <LeadForm title="Start forespørselen" />
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
        <FooterLinkColumn
          title="Områder"
          links={cityPages}
          inverse
        />
        <FooterLinkColumn
          title="Tjenester"
          links={[
            { name: "Innvendig maling", href: "/innvendig-maling" },
            { name: "Utvendig maling", href: "/utvendig-maling" },
            { name: "Møbler og detaljer", href: "/mobler-og-detaljer" },
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
          <a
            key={link.href}
            href={link.href}
            className={[
              "text-base font-medium transition",
              inverse
                ? "text-white/86 hover:text-white"
                : "text-neutral-700 hover:text-neutral-950",
            ].join(" ")}
          >
            {link.name}
          </a>
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
      <a
        href="#foresporsel"
        className="inline-flex min-h-12 items-center justify-center rounded-[6px] bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
      >
        Be om kontakt
      </a>
      <a
        href="#tjenester"
        className="inline-flex min-h-12 items-center justify-center rounded-[6px] border border-white/35 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
      >
        Se tjenester
      </a>
    </div>
  );
}

function AreaTags({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-wrap gap-3 text-sm font-medium text-white/90",
        className,
      ].join(" ")}
    >
      {areas.map((area) => (
        <span
          key={area}
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2"
        >
          {area}
        </span>
      ))}
    </div>
  );
}

function ImageServiceCard({ service }: { service: (typeof serviceCards)[number] }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-neutral-300 bg-white shadow-sm shadow-black/5">
      <div className="relative aspect-[5/4] bg-neutral-200">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{service.title}</h3>
        <p className="mt-4 leading-7 text-neutral-600">{service.text}</p>
      </div>
    </article>
  );
}

function LeadForm({ title }: { title: string }) {
  return (
    <form className="rounded-[8px] border border-neutral-300 bg-white p-5 shadow-xl shadow-black/10 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Forespørsel
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
          Kontakt
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Navn *" placeholder="Ola Nordmann" />
        <Field label="Telefon *" placeholder="900 00 000" />
        <Field label="E-post" placeholder="valgfritt" />
        <Field label="Område/by *" placeholder="Finnsnes" />
        <label className="grid gap-2 text-sm font-medium">
          Tjeneste *
          <select className={fieldClassName}>
            <option>Velg tjeneste</option>
            {services.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Boligtype
          <select className={fieldClassName}>
            <option>Valgfritt</option>
            <option>Enebolig</option>
            <option>Leilighet</option>
            <option>Hytte</option>
            <option>Annet</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Ønsket tidspunkt
          <input className={fieldClassName} placeholder="f.eks. våren 2027" />
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Prosjektbeskrivelse *
          <textarea
            className={`${fieldClassName} min-h-28 resize-none`}
            placeholder="Fortell kort hva som skal males, omtrent størrelse og underlag."
          />
        </label>
      </div>
      <label className="mt-5 flex gap-3 text-sm leading-6 text-neutral-600">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-neutral-950" />
        <span>
          Jeg samtykker til at Senja Painters kan kontakte meg om denne
          forespørselen. *
        </span>
      </label>
      <button
        type="button"
        className="mt-5 h-12 w-full rounded-[6px] bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
      >
        Send forespørsel
      </button>
    </form>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className={fieldClassName} placeholder={placeholder} />
    </label>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-[6px] border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-950 outline-none transition placeholder:text-neutral-500 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/15";

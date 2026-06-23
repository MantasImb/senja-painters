import type { PageSeo } from "@/lib/seo";

export type PublicRouteSeo = {
  pathname: string;
  seo: PageSeo;
};

export type PublicHomePageContent = PublicRouteSeo & {
  areas: string[];
  contact: {
    eyebrow: string;
    text: string;
    title: string;
  };
  footerText: string;
  hero: {
    eyebrow: string;
    kicker: string;
    text: string;
    title: string;
  };
  services: {
    icon: "interior" | "exterior" | "furniture";
    pathname: string;
    text: string;
    title: string;
  }[];
  servicesIntro: {
    eyebrow: string;
    text: string;
    title: string;
  };
};

export type PublicPageContent = {
  eyebrow: string;
  formTitle?: string;
  intro: string;
  pathname: string;
  sections: {
    title: string;
    text: string;
  }[];
  seo: PageSeo;
  title: string;
  type: "location" | "service" | "contact" | "privacy";
};

export const publicHomePage = {
  areas: ["Senja", "Finnsnes"],
  contact: {
    eyebrow: "Be om kontakt",
    text: "Skjemaet samler det viktigste for en god første samtale. E-post er valgfritt, og kontakt går gjennom forespørselen.",
    title: "Fortell oss kort om malejobben.",
  },
  footerText:
    "Norsk først, lokalt rettet og bygget rundt forespørsler fra boligeiere på Senja og i Finnsnes.",
  hero: {
    eyebrow: "Senja Malere",
    kicker: "Senja og Finnsnes",
    text: "Lokalt malerarbeid starter best med en enkel avklaring. Fortell oss kort om prosjektet, så tar Senja Malere kontakt om omfang, tidspunkt og neste steg.",
    title: "Malerhjelp for hjem på Senja og i Finnsnes.",
  },
  pathname: "/no",
  seo: {
    title: "Senja Malere | Malerhjelp på Senja og i Finnsnes",
    description:
      "Senja Malere tar imot forespørsler om innvendig maling, utvendig maling og møbelmaling for hjem på Senja og i Finnsnes.",
    openGraphDescription:
      "Malerhjelp for hjem på Senja og i Finnsnes, med en enkel forespørselsvei.",
  },
  services: [
    {
      icon: "interior",
      pathname: "/no/innvendig-maling",
      text: "Vegger, tak, listverk og rom som trenger en ryddig overflate og et pent sluttresultat.",
      title: "Innvendig maling",
    },
    {
      icon: "exterior",
      pathname: "/no/utvendig-maling",
      text: "Fasader, kledning og detaljer der underlag, vær og forarbeid må vurderes før jobben planlegges.",
      title: "Utvendig maling",
    },
    {
      icon: "furniture",
      pathname: "/no/mobelmaling",
      text: "Maling av møbler, skap, dører og detaljer som trenger nytt uttrykk eller bedre finish.",
      title: "Møbler og detaljer",
    },
  ],
  servicesIntro: {
    eyebrow: "Tjenester",
    text: "Velg tjenesten som passer prosjektet for å lese mer om hva som bør avklares før Senja Malere tar kontakt.",
    title: "Malerhjelp for hjem og detaljer.",
  },
} satisfies PublicHomePageContent;

export const publicPages = {
  finnsnes: {
    eyebrow: "Område",
    formTitle: "Be om malerhjelp i Finnsnes",
    intro:
      "Senja Malere tar imot forespørsler fra Finnsnes og nærområdene for boliger som trenger maling, oppfrisking eller en ryddig vurdering.",
    pathname: "/no/finnsnes",
    sections: [
      {
        title: "Malerarbeid for Finnsnes og nærområdene",
        text: "For boliger rundt Finnsnes handler en god malejobb ofte om å avklare rom, overflater, tilgang og tidspunkt før arbeidet planlegges. Forespørselen gir et enkelt grunnlag for den avklaringen.",
      },
      {
        title: "Samme kontaktvei for små og større prosjekter",
        text: "Enten det gjelder et enkelt rom, fasadedetaljer eller møbler som skal få nytt uttrykk, samler skjemaet informasjonen Senja Malere trenger for å ta neste steg.",
      },
    ],
    seo: {
      title: "Maler i Finnsnes | Senja Malere",
      description:
        "Be om malerhjelp i Finnsnes og nærområdene. Senja Malere tar imot forespørsler om innvendig maling, utvendig maling og møbelmaling.",
      openGraphDescription:
        "Lokal malerhjelp for boliger i Finnsnes og nærområdene.",
    },
    title: "Maler i Finnsnes",
    type: "location",
  },
  innvendigMaling: {
    eyebrow: "Tjeneste",
    formTitle: "Beskriv innvendig maling",
    intro:
      "Innvendig maling dekker vegger, tak og listverk i hjem som trenger nye overflater, bedre finish eller en roligere helhet.",
    pathname: "/no/innvendig-maling",
    sections: [
      {
        title: "Ryddig avklaring før rommet males",
        text: "Vegger, tak og listverk kan kreve ulikt forarbeid. Skjemaet ber derfor om rom, underlag, omfang og ønsket tidspunkt før Senja Malere vurderer neste steg.",
      },
      {
        title: "For oppholdsrom, soverom og gangsoner",
        text: "Innvendig arbeid handler både om uttrykk og praktisk gjennomføring i et hjem som ofte er i bruk. Derfor er en enkel første avklaring viktig.",
      },
    ],
    seo: {
      title: "Innvendig maling | Senja Malere",
      description:
        "Be om hjelp med innvendig maling av vegger, tak og listverk. Senja Malere tar imot forespørsler fra Senja og Finnsnes.",
      openGraphDescription:
        "Innvendig maling for rom, vegger, tak og listverk i Senja-regionen.",
    },
    title: "Innvendig maling",
    type: "service",
  },
  kontakt: {
    eyebrow: "Kontakt",
    formTitle: "Send forespørsel",
    intro:
      "Kontakt Senja Malere via skjema som eneste offentlige kontaktvei i V1. Telefonnummer og e-post vises ikke offentlig før de er klare for bruk.",
    pathname: "/no/kontakt",
    sections: [
      {
        title: "Én tydelig kontaktvei",
        text: "Skjemaet samler navn, telefon, område, tjeneste, prosjektbeskrivelse og samtykke slik at forespørselen kan vurderes uten at personopplysninger spres i flere kanaler.",
      },
      {
        title: "Hva skjer etter innsending",
        text: "Senja Malere bruker opplysningene til å kontakte deg om prosjektet, avklare omfang og vurdere praktiske neste steg. Det gis ingen automatisk lovnad om svartid.",
      },
    ],
    seo: {
      title: "Kontakt Senja Malere | Forespørsel om malerhjelp",
      description:
        "Kontakt Senja Malere via skjema for malerhjelp på Senja og i Finnsnes.",
      openGraphDescription:
        "Send forespørsel om malerhjelp til Senja Malere via skjema.",
    },
    title: "Kontakt Senja Malere",
    type: "contact",
  },
  mobelmaling: {
    eyebrow: "Tjeneste",
    formTitle: "Beskriv møbelmalingen",
    intro:
      "Møbelmaling er for møbler, skap og detaljer som trenger ny finish, nytt uttrykk eller en mer helhetlig plass i hjemmet.",
    pathname: "/no/mobelmaling",
    sections: [
      {
        title: "Detaljer fortjener en egen vurdering",
        text: "Møbler, skap og detaljer har ofte andre krav til håndtering, overflate og finish enn vegger og fasader. Forespørselen bør derfor beskrive materialet og ønsket uttrykk.",
      },
      {
        title: "Ingen før- og etterpå-løfter uten ekte prosjektgrunnlag",
        text: "V1 bruker ikke uekte prosjektbilder eller før- og etterpå-påstander. Siden er laget slik at ekte bilder kan legges inn senere når Senja Malere har egne prosjekter å vise.",
      },
    ],
    seo: {
      title: "Møbelmaling | Senja Malere",
      description:
        "Be om hjelp med møbelmaling, skap, dører og detaljer som trenger ny finish. Senja Malere tar imot forespørsler i Senja-regionen.",
      openGraphDescription:
        "Møbelmaling og detaljmaling for hjem på Senja og i Finnsnes.",
    },
    title: "Møbelmaling",
    type: "service",
  },
  personvern: {
    eyebrow: "Personvern",
    intro:
      "Personvernsiden forklarer hvilke opplysninger Senja Malere samler inn, hvorfor de samles inn, og hvordan analytics og rate limiting unngår lagring av rå IP-adresser.",
    pathname: "/no/personvern",
    sections: [
      {
        title: "Opplysninger i forespørselsskjemaet",
        text: "Når du sender inn skjemaet, lagres navn, telefon, område eller by, tjenestetype, prosjektbeskrivelse, samtykke og eventuelle valgfrie felt som e-post, boligtype og ønsket tidspunkt.",
      },
      {
        title: "Hvorfor opplysningene brukes",
        text: "Opplysningene brukes til å kontakte deg om maleprosjektet, avklare omfang og følge opp forespørselen internt. De brukes ikke til et offentlig kunderegister, publiseres ikke og deles ikke gjennom en partnerflyt i V1.",
      },
      {
        title: "Analytics, rate limiting og IP",
        text: "Siden kan registrere enkle hendelser som sidevisning, landingsside, anonym besøks-ID for nettleserfanen, besøksøkt og innsendt forespørsel. Analytics-ID-er lagres som øktdata i nettleseren og brukes som beste estimat, ikke som sikre persontall. Senja Malere lagrer ikke rå IP-adresser for analytics eller rate limiting; IP brukes bare midlertidig til å lage en anonymisert eller hash-basert identitet.",
      },
    ],
    seo: {
      title: "Personvern | Senja Malere",
      description:
        "Les hvordan Senja Malere behandler forespørsler, samtykke, enkel analytics og rate limiting uten å lagre rå IP-adresser.",
      openGraphDescription:
        "Personvern for forespørsler, analytics og rate limiting hos Senja Malere.",
    },
    title: "Personvern",
    type: "privacy",
  },
  senja: {
    eyebrow: "Område",
    formTitle: "Be om malerhjelp på Senja",
    intro:
      "Senja Malere hjelper boligeiere på Senja med ryddig malerarbeid inne, ute og på detaljer som trenger ny finish.",
    pathname: "/no/senja",
    sections: [
      {
        title: "Lokalt arbeid starter med en god avklaring",
        text: "På Senja kan vær, avstander og underlag påvirke hvordan en malejobb bør planlegges. Derfor starter forespørselen med noen enkle opplysninger om boligen, området og hva som skal males.",
      },
      {
        title: "For hjem, hytter og detaljer",
        text: "Senja-siden samler kontaktveien for innvendig maling, utvendig maling og møbelmaling uten å love mer enn det som kan avklares etter at prosjektet er beskrevet.",
      },
    ],
    seo: {
      title: "Maler på Senja | Senja Malere",
      description:
        "Be om malerhjelp på Senja for innvendig maling, utvendig maling og møbelmaling. Send en enkel forespørsel til Senja Malere.",
      openGraphDescription:
        "Lokal malerhjelp for hjem, hytter og detaljer på Senja.",
    },
    title: "Maler på Senja",
    type: "location",
  },
  utvendigMaling: {
    eyebrow: "Tjeneste",
    formTitle: "Beskriv utvendig maling",
    intro:
      "Utvendig maling handler om fasade, kledning og detaljer der vær og kledning må vurderes før arbeid og tidspunkt planlegges.",
    pathname: "/no/utvendig-maling",
    sections: [
      {
        title: "Forarbeid og vær betyr mye",
        text: "På Senja og i Finnsnes må utvendig arbeid planlegges med hensyn til vær, underlag og tilgjengelighet. Forespørselen hjelper Senja Malere å forstå hva som bør vurderes først.",
      },
      {
        title: "Fasade, kledning og detaljer",
        text: "Utvendig maling kan gjelde hele flater eller mindre detaljer. Beskriv gjerne hva som skal males, om det finnes slitasje, og hvor enkelt det er å komme til.",
      },
    ],
    seo: {
      title: "Utvendig maling | Senja Malere",
      description:
        "Be om hjelp med utvendig maling av fasade, kledning og detaljer der vær, underlag og tilgjengelighet må vurderes.",
      openGraphDescription:
        "Utvendig maling for fasade, kledning og detaljer i Senja-regionen.",
    },
    title: "Utvendig maling",
    type: "service",
  },
} satisfies Record<string, PublicPageContent>;

export const publicSeoRoutes = [
  publicHomePage,
  publicPages.senja,
  publicPages.finnsnes,
  publicPages.innvendigMaling,
  publicPages.utvendigMaling,
  publicPages.mobelmaling,
  publicPages.kontakt,
  publicPages.personvern,
] satisfies PublicRouteSeo[];

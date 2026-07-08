import Image from "next/image";

import { LeadForm, type LeadFormAction } from "@/components/forms/LeadForm";
import { PageViewBeacon } from "@/components/site/PageViewBeacon";
import {
  LaunchFaq,
  RequestProcess,
  SecondaryContact,
  SiteFooter,
} from "@/components/site/PublicSupportSections";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { PublicPageContent } from "@/lib/content/public-pages";

export function PublicPage({
  leadAction,
  page,
}: {
  leadAction: LeadFormAction;
  page: PublicPageContent;
}) {
  const showForm = page.type !== "privacy";

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-950">
      <PageViewBeacon page={page.pathname} />
      <SiteHeader />
      <section className="border-b border-neutral-300 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
              {page.title}
            </h1>
          </div>
          <div className="grid gap-6">
            <p className="max-w-2xl text-lg leading-8 text-neutral-600">
              {page.intro}
            </p>
            {page.image ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-neutral-200">
                <Image
                  alt={page.image.alt}
                  className="object-cover"
                  fill
                  preload
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  src={page.image.src}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6 lg:content-start">
          {page.sections.map((section) => (
            <article
              className="border-l-2 border-neutral-950 bg-white px-6 py-5"
              key={section.title}
            >
              <h2 className="text-2xl font-semibold tracking-normal">
                {section.title}
              </h2>
              <p className="mt-4 leading-7 text-neutral-600">{section.text}</p>
            </article>
          ))}
          {showForm ? <RequestProcess /> : null}
          {showForm ? (
            <div className="hidden lg:block">
              <SecondaryContact inverse={false} />
            </div>
          ) : null}
        </div>
        {showForm ? (
          <div className="grid gap-6">
            <LeadForm
              action={leadAction}
              sourcePage={page.pathname}
              title={page.formTitle ?? "Start forespørselen"}
            />
            <div className="lg:hidden">
              <SecondaryContact inverse={false} />
            </div>
          </div>
        ) : null}
      </section>
      {page.type === "contact" ? <LaunchFaq /> : null}
      <SiteFooter />
    </main>
  );
}

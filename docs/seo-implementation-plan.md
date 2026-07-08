# SEO Implementation Plan

This plan turns the content and local SEO decisions for Senja Malere into an implementation checklist. It is intentionally documentation-only; code and page changes should happen in a later implementation pass.

## Decisions Already Made

- Public business name: **Senja Malere**.
- Business type: service-area business, not a storefront or showroom.
- Primary business category: painter.
- Launch service areas: Senja and Finnsnes only.
- Future service-area expansion is expected, but new location pages require distinct useful content.
- Launch audience: private residential homeowners, not commercial or property-management customers.
- Preferred customer intake path: lead form.
- Secondary contact path: verified public phone number.
- Public email is not part of launch.
- Verified public contact hours: Monday-Sunday 08:00-22:00, described as contact availability, not walk-in hours.
- Google Business Profile and local SEO profiles should link to the Norwegian homepage `/no`.
- Do not publish organization number for launch.
- Do not show reviews, ratings, testimonials, review schema, or review sections until real reviews exist.
- Do not emphasize that the business is new.
- Do not claim years in business, certifications, guarantees, free quotes, free inspections, fixed prices, or specific response times.
- Keep FAQs minimal and useful; avoid form-field explanations and generic SEO filler.
- Add a short homepage about section, not a separate about page.
- Describe the public process as: send request, clarify the painting project, plan next steps.
- Keep seasonality/weather guidance brief; detailed exterior planning happens privately after a request.
- Finalize verified page images before adding a work examples section.
- Add work examples only after there are at least 4-6 strong verified project photos.

## Phase 1: Google Business Profile

1. Create or claim the Google Business Profile for **Senja Malere**.
2. Configure it as a service-area business with no customer-visit location.
3. Set primary category to painter.
4. Set service areas to Senja and Finnsnes only.
5. Add the public phone number.
6. Set contact availability to Monday-Sunday 08:00-22:00 if those hours remain reliable.
7. Link the profile to the Norwegian homepage `/no`.
8. Add the same launch service groups as the website: innvendig maling, utvendig maling, and møbelmaling.
9. Use a plain, service-focused business description rather than a brand/story-heavy description.
10. Do not add organization number, reviews, ratings, certifications, or address claims unless they become verified public facts.
11. Upload real photos that satisfy `docs/seo-photo-brief.md`.
12. After the profile is live, save the direct Google review link for future manual review requests after completed work.

## Phase 2: Verified Business Facts

Collect the exact facts needed before implementation:

- Verified public phone number.
- Final Google Business Profile URL.
- Verified Monday-Sunday 08:00-22:00 public contact availability.
- Final list of launch services shown in Google Business Profile.
- Verified photos with source notes and publication permission.

Facts intentionally excluded for launch:

- Public email.
- Organization number.
- Customer-visit address.
- Reviews or ratings.
- Certifications.
- Years in business.
- Free estimate, free quote, or response-time promises.

## Phase 3: Website Content Updates

Update public content later to reflect the decided SEO model:

- Keep the form as the primary CTA and preferred customer intake path.
- Add the verified public phone number as a secondary contact option in the contact section and footer.
- Introduce the phone option with language like "du kan også ringe" so it supports, but does not compete with, the form.
- Do not add a prominent phone CTA in the header or hero for launch.
- Update contact page language away from "form-only" without making the phone number feel like the primary funnel.
- Add a short homepage about section framed as local painting help for homeowners, not as a founder biography or company-history section.
- Add a compact request-process section with every public form: send request, clarify project, plan next steps.
- Place the request process above the form on mobile and next to the form on desktop where the layout allows.
- Add one shared minimal FAQ block on the homepage and contact page only.
- Keep pages focused on private homeowners and residential painting work.
- Keep Senja and Finnsnes as the only launch location pages.
- Keep nearby city expansion out of launch pages until distinct local content exists.
- Do not add a service-area map for launch; use text and navigation for Senja and Finnsnes.

These are content rules, not architectural decisions. Keep them in this plan and domain context rather than creating an ADR; Phase 3 copy is expected to stay fluid and may be adjusted repeatedly before final launch.

Launch FAQ topics:

- Which areas Senja Malere serves.
- What kinds of painting projects homeowners can send in.
- Whether smaller projects like doors, cabinets, kitchen fronts, built-ins, or furniture are relevant.
- What happens after a request is submitted.

Keep the launch FAQ to these four questions. It may expand later when there is a clear homeowner-facing reason.

The service-area FAQ answer should name Senja and Finnsnes only. Do not mention nearby deferred locations as "you can ask" areas until they become real launch service areas with distinct useful content.

The smaller-project FAQ answer may mention doors, cabinets, kitchen fronts, built-ins, and furniture as examples under the existing møbelmaling/detail-work service group. Do not turn these examples into separate launch service pages.

Do not mention photos in the shared FAQ unless there is a clear homeowner-facing reason later.

Do not use the shared FAQ for phone number or contact-hours content; show those facts near the form and in the footer instead.

Avoid FAQ topics that are only form mechanics, such as whether email is required. Do not repeat the full FAQ on service or location pages; keep those pages focused on their specific service or area intent.

## Phase 4: Service Content

Preserve the three launch service groups:

- Innvendig maling: walls, ceilings, trim, rooms, and similar interior surfaces.
- Utvendig maling: exterior walls, facades, trim, staining, wood treatment, and other weather-exposed surfaces.
- Møbelmaling: furniture, cabinets, kitchen fronts, doors, built-ins, and detail surfaces.

Do not split these into more service pages until there is enough distinct content and demand to avoid thin pages.

## Phase 5: Photo Handling

Use `docs/seo-photo-brief.md` as the source brief.

Implementation direction:

1. Treat images kept on the website after photo finalization as verified publishable assets, not placeholders.
2. Use verified project photos that are safe to publish, including one suitable provided photo for each launch service page when available.
3. Do not create a separate category for generic publishable service illustrations; service-page imagery should belong to the same verified-photo set.
4. Do not imply an image shows more than the verified source notes support.
5. Do not add before-and-after claims unless the image pair is real, same-project, and clearly comparable.
6. Add a work examples section only after 4-6 strong verified photos are available.

## Phase 6: Structured Data And Metadata

After verified facts are available:

- Add public phone to visible page content before adding it to structured data.
- Add public contact hours to visible page content before adding them to structured data.
- Keep Open Graph image handling simple: use one verified branded or homepage image if ready; otherwise keep the existing metadata and defer custom social preview work.
- Keep LocalBusiness schema restrained and consistent with visible website facts.
- Keep service-area framing; do not add a customer-visit address.
- Do not add FAQ structured data for launch; keep FAQ content visible only.
- Do not add breadcrumb navigation or breadcrumb structured data for launch; the site is shallow.
- Do not add review, aggregateRating, certification, organization number, or founding-date structured data for launch.
- Keep canonical URLs and sitemap entries aligned with existing `/no` public routes.

## Phase 7: Launch Validation

Before launch:

- Set up Google Search Console and verify the domain.
- Prefer Search Console domain verification with a DNS TXT record when DNS access is available. If not, use the best available URL-prefix method, such as an HTML tag or verification file.
- Submit the sitemap in Google Search Console.
- Inspect `/no`, `/no/senja`, `/no/finnsnes`, and the three service pages before or immediately at launch.
- Verify internal analytics records page views and lead submissions by source page so SEO traffic can be compared with lead quality.
- Verify homepage, service pages, location pages, contact page, privacy page, sitemap, robots, metadata, and structured data.
- Verify service-area NAP consistency: business name, phone number, website URL, service areas, and contact hours should match across the website and Google Business Profile, without exposing a private address.
- Confirm public SEO pages remain prerendered/static where practical.
- Confirm the public phone number and contact hours match Google Business Profile exactly.
- Confirm no unsupported claims appear in page copy, metadata, image captions, alt text, or structured data.

After launch:

- Test structured data with Google's rich results tooling.
- Confirm Google Business Profile links to `/no`.
- Monitor indexing and early lead quality before expanding location pages.

## Implementation Split

Use two implementation PRs:

1. Business facts and local SEO: public phone, contact hours, Google Business Profile alignment, structured data, metadata, Search Console launch checklist, and consistency checks.
2. Content and imagery: homepage about section, request process, minimal FAQ, finalized photos, alt text, and service/location copy refinements.

## Pre-Launch Acceptance Checklist

- Business name is consistently **Senja Malere**.
- Website, Google Business Profile, and visible content agree on phone number, contact hours, service areas, and website URL.
- No private address is exposed or implied as a customer-visit location.
- No public email is added.
- No organization number is published.
- No reviews, ratings, testimonials, review schema, or aggregate rating claims are shown.
- No years-in-business, certification, guarantee, free quote, free inspection, fixed-price, or response-time promises are made.
- No price guidance is published.
- Photos kept on the website are verified publishable assets.
- Alt text describes actual images naturally and does not stuff keywords.
- Sitemap includes the intended launch public pages.
- Robots excludes admin routes and allows public crawling.
- Canonical URLs point to the intended `/no` routes.
- Public SEO pages remain static/prerendered where practical.
- Search Console is verified and sitemap is submitted.

## Deferred SEO Work

- More city/location pages.
- English `/en` routes.
- Hreflang alternates, added with English `/en` routes.
- Bing Webmaster Tools.
- FAQ structured data.
- Review section.
- Website review display after real public Google reviews exist.
- Third-party local directories and citations.
- Work examples or portfolio section.
- Blog/content marketing.
- Separate about page.
- Organization number publication.
- Certifications or stronger trust claims.
- Third-party analytics.

Each deferred item needs verified facts, useful distinct content, or real business demand before implementation.

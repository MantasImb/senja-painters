# Senja Malere

This context records the domain language for the Senja Malere website. The site presents a new local painting business, collects painting leads, and gives the site owner a minimal way to review those leads.

## Language

**Senja Malere**:
A local painting business serving homeowners in the Senja and Finnsnes market.

**Public Business Name**:
The business name shown on the website, Google Business Profile, and local SEO surfaces.
_Avoid_: Keyword-stuffed business name, alternate brand spelling

**Homeowner**:
A person looking for painting help for a home, room, exterior surface, piece of furniture, or similar private property.
_Avoid_: Generic user, account

**Launch Audience**:
Private homeowners looking for residential painting help, including homes and cabins.
_Avoid_: Commercial customer, property manager, business account

**Visitor**:
A person browsing the public website before or without submitting a painting lead.
_Avoid_: Customer, user

**Site Owner**:
The internal operator who reviews painting leads and updates their status.
_Avoid_: Admin user, staff account

**Painting Lead**:
A submitted request from a homeowner asking Senja Malere to contact them about possible painting work.
_Avoid_: Booking, quote, order, job

**Painting Project**:
The potential work described by a homeowner in a painting lead.
_Avoid_: Ticket, task

**Refresh Work**:
Smaller painting, maintenance, or surface-improvement work that does not require a full repainting project.
_Avoid_: Emergency repair, guaranteed small-job availability

**Service Area**:
A location where Senja Malere wants to receive relevant painting leads. Initial service areas are Senja and Finnsnes; nearby cities are planned but deferred until each can have distinct, useful content.
_Avoid_: Branch, office, franchise

**Service-Area Business**:
A business that serves homeowners at their properties and does not present a customer-visit location.
_Avoid_: Storefront, showroom, office location

**Painting Service**:
A category of painting work that the public site presents as available.
_Avoid_: Product, SKU

**Business Category**:
The public category used to describe Senja Malere in local search profiles.
_Avoid_: General contractor, referral marketplace

**Innvendig maling**:
Indoor painting work such as walls, ceilings, trim, or similar interior surfaces.

**Utvendig maling**:
Outdoor work such as exterior walls, facades, trim, staining, wood treatment, or similar weather-exposed surfaces.

**Møbelmaling**:
Furniture, cabinets, kitchen fronts, doors, built-ins, and detail surfaces that need a new finish.

**Public Contact Path**:
The public ways a homeowner can contact Senja Malere, with the lead form as the preferred intake path and phone as a direct-contact alternative.
_Avoid_: Hidden-only contact, unmonitored contact channel

**Public Phone Number**:
A verified phone number that homeowners may use to contact Senja Malere directly.
_Avoid_: Private phone number, placeholder phone number

**Public Contact Hours**:
The hours when homeowners can reasonably expect Senja Malere to receive calls or contact requests.
_Avoid_: Store opening hours, walk-in hours

**Lead Status**:
The current operational state of a painting lead as tracked by the site owner.

**New Lead**:
A painting lead that has been received but not yet handled.

**Contacted Lead**:
A painting lead where the homeowner has been contacted about the request.

**Sent Onward Lead**:
A painting lead manually marked as sent onward outside the website workflow.
_Avoid_: Partner assignment, partner workflow

**Closed Lead**:
A painting lead that no longer needs active follow-up.

**Spam Lead**:
A painting lead that the site owner treats as irrelevant, abusive, or not genuine demand.

**Honeypot Submission**:
A form submission treated as likely automated spam because a hidden field was filled.
_Avoid_: Painting lead

**Verified Business Fact**:
A public business detail that is real, available, and safe for Senja Malere to show or claim.
_Avoid_: Assumption, placeholder claim

**Verified Project Photo**:
A photo that truthfully shows Senja Malere work or materials and is safe to publish publicly.
_Avoid_: Stock photo, decorative image, unverified before-and-after

**Work Example**:
A public example of Senja Malere work supported by verified project photos or other truthful project evidence.
_Avoid_: Portfolio filler, stock example, implied completed project

**Launch FAQ**:
A small set of practical public questions that help homeowners decide whether to submit a painting lead.
_Avoid_: Form-field explanation, generic SEO filler

**Request Process**:
The simple public explanation of what happens from submitted request to next-step planning.
_Avoid_: Booking process, quote workflow, guaranteed response time

**Launch About Section**:
A short public explanation of who Senja Malere serves and what painting help the business offers.
_Avoid_: Separate about page, years-in-business claim, certification claim

## Relationships

- A **Homeowner** may submit zero or more **Painting Leads**.
- The **Public Business Name** is Senja Malere.
- The **Launch Audience** is private residential homeowners, not commercial or property-management customers.
- A **Painting Lead** describes exactly one **Painting Project**.
- A **Painting Project** may be full repainting, detail painting, maintenance, or **Refresh Work**.
- A **Painting Lead** has exactly one current **Lead Status**.
- A **Painting Lead** may have one or more historical status changes.
- Senja Malere is a **Service-Area Business** with one or more **Service Areas**.
- Senja Malere's primary **Business Category** is painter.
- A **Service Area** can have public location content and can produce many **Painting Leads**.
- A **Painting Service** can have public service content and can produce many **Painting Leads**.
- The **Public Contact Path** includes the lead form and may include a **Public Phone Number** when that number is a **Verified Business Fact**.
- **Public Contact Hours** may be shown as Monday-Sunday 08:00-22:00 when they describe real contact availability, not a customer-visit location.
- A **Honeypot Submission** is separate from **Painting Leads** and should not become one.
- A **Verified Business Fact** is required before the site claims reviews, ratings, opening hours, public contact details, certifications, years in business, an organization number, a physical address, or Google Business Profile links.
- **Verified Project Photos** are required before the site presents images as Senja Malere projects, completed work, local properties, or before-and-after evidence.
- After the photo-finalization stage, images kept on the website are treated as verified publishable assets, not placeholders.
- **Work Examples** should be added only after there are enough strong **Verified Project Photos** to avoid thin or misleading proof sections.
- **Launch FAQ** content should stay minimal and answer real project or buying uncertainty, not obvious form mechanics.
- The **Request Process** should be described as: send request, clarify the painting project, then plan next steps.
- The **Launch About Section** belongs on the homepage; a separate about page is deferred until there is more verified business story to tell.
- Exterior timing, weather, season, and surface condition can be mentioned briefly, but detailed planning should be handled privately with the homeowner after a request.
- Google Business Profile and local SEO profiles should link to the Norwegian homepage, not directly to the contact page.
- Senja Malere should not publish an organization number for launch.

## Example Dialogue

> **Developer:** "When a visitor submits the form, should we create a booking?"
> **Domain expert:** "No. It is a **Painting Lead** only. Senja Malere still needs to contact the **Homeowner** to clarify the **Painting Project** and next steps."

> **Developer:** "Does `sent_to_partner` mean we need partner accounts?"
> **Domain expert:** "No. A **Sent Onward Lead** is only a manual status in V1; it does not create a partner workflow."

## Flagged Ambiguities

- "Customer" can imply an accepted job or commercial relationship; use **Homeowner** before a request becomes actual work.
- "Lead" and "request" both appear in planning language; use **Painting Lead** for the tracked submitted request.
- "Sent to partner" is a status label only in V1; it does not imply partner accounts, assignment, notifications, or external workflow.
- "Address" should not imply a customer-visit location; Senja Malere should be presented as a **Service-Area Business** unless a real visitable office or showroom becomes part of the business.
- Public phone should support trust and urgent direct contact, but should not replace the lead form as the preferred intake path.
- Senja Malere is a new business for launch; do not show website reviews, ratings, review schema, testimonials, or review sections until real reviews exist.
- Launch copy should not emphasize that Senja Malere is new; focus on local availability, services, and the request process without inventing maturity claims.
- Do not promise free inspections, free estimates, free quotes, fixed prices, or specific response times unless those business processes are explicitly defined and reliable.
- Do not publish price guidance for launch; pricing is situational and should be handled individually after the painting project is clarified.
- Do not name paint brands or imply fixed material choices for launch; materials, paint, stain, and treatment should be described generally and clarified per project.
- Do not include homeowner photo uploads in the launch form; project photos can be requested privately after initial contact when needed.
- Do not position Senja Malere as an emergency or urgent-response painting service for launch.
- Launch SEO should focus on business facts, service areas, core painting services, trust, and conversion paths rather than narrow job-detail variants.
- The public site is shallow for launch; avoid complicated navigation, schema, or content features with little current value.
- Public business claims must be limited to **Verified Business Facts**; do not invent unavailable details for credibility, SEO, metadata, or structured data.

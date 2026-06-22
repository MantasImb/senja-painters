# Senja Malere

This context records the domain language for the Senja Malere website. The site presents a new local painting business, collects painting leads, and gives the site owner a minimal way to review those leads.

## Language

**Senja Malere**:
A local painting business serving homeowners in the Senja and Finnsnes market.

**Homeowner**:
A person looking for painting help for a home, room, exterior surface, piece of furniture, or similar private property.
_Avoid_: Generic user, account

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

**Service Area**:
A location where Senja Malere wants to receive relevant painting leads. V1 service areas are Senja and Finnsnes; nearby areas are deferred until they can have distinct, useful content.
_Avoid_: Branch, office, franchise

**Painting Service**:
A category of painting work that the public site presents as available.
_Avoid_: Product, SKU

**Innvendig maling**:
Indoor painting work such as walls, ceilings, trim, or similar interior surfaces.

**Utvendig maling**:
Outdoor painting work such as exterior walls, facades, trim, or similar weather-exposed surfaces.

**Møbelmaling**:
Furniture, cabinets, doors, and detail surfaces that need a new finish.

**Public Contact Path**:
The form-only public route for contacting Senja Malere in V1.
_Avoid_: Public phone, public email

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

## Relationships

- A **Homeowner** may submit zero or more **Painting Leads**.
- A **Painting Lead** describes exactly one **Painting Project**.
- A **Painting Lead** has exactly one current **Lead Status**.
- A **Painting Lead** may have one or more historical status changes.
- A **Service Area** can have public location content and can produce many **Painting Leads**.
- A **Painting Service** can have public service content and can produce many **Painting Leads**.
- A **Honeypot Submission** is separate from **Painting Leads** and should not become one.
- A **Verified Business Fact** is required before the site claims reviews, ratings, opening hours, public contact details, certifications, years in business, an organization number, a physical address, or Google Business Profile links.

## Example Dialogue

> **Developer:** "When a visitor submits the form, should we create a booking?"
> **Domain expert:** "No. It is a **Painting Lead** only. Senja Malere still needs to contact the **Homeowner** to clarify the **Painting Project** and next steps."

> **Developer:** "Does `sent_to_partner` mean we need partner accounts?"
> **Domain expert:** "No. A **Sent Onward Lead** is only a manual status in V1; it does not create a partner workflow."

## Flagged Ambiguities

- "Customer" can imply an accepted job or commercial relationship; use **Homeowner** before a request becomes actual work.
- "Lead" and "request" both appear in planning language; use **Painting Lead** for the tracked submitted request.
- "Sent to partner" is a status label only in V1; it does not imply partner accounts, assignment, notifications, or external workflow.
- Public business claims must be limited to **Verified Business Facts**; do not invent unavailable details for credibility, SEO, metadata, or structured data.

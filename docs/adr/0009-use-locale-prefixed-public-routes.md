# Use locale-prefixed public routes

Status: accepted

Senja Painters V1 will publish public routes under the Norwegian locale prefix, such as `/no`, `/no/senja`, `/no/finnsnes`, `/no/innvendig-maling`, `/no/utvendig-maling`, `/no/mobelmaling`, `/no/kontakt`, and `/no/personvern`, while keeping admin routes unlocalized under `/admin`. Starting with locale-prefixed public URLs avoids moving Norwegian pages when English is added later with `next-intl`, keeps canonical URLs stable, and lets future hreflang alternates pair `/no/...` with `/en/...`; `/` should redirect to `/no` in V1. Page identity should use internal keys that are separate from public pathnames, so future English pages can use localized slugs such as `/en/interior-painting` and `/en/furniture-painting` instead of reusing Norwegian slug text.

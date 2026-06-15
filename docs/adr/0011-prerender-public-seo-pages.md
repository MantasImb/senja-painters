# Prerender public SEO pages

Status: accepted

Senja Malere V1 will keep public SEO pages as static and prerenderable as possible. Public page rendering must avoid request-time database reads, cookies, headers, or analytics writes that force dynamic rendering. Interactive behavior should be isolated into small Client Components, and page-view analytics should use a first-party client beacon or another mechanism that records on the server without making the page itself dynamic. Admin pages and mutation endpoints may remain dynamic.

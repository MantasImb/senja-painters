import { submitLeadAction } from "@/lib/actions/lead-actions";
import { SenjaHomePage } from "@/components/site/SenjaHomePage";
import { publicHomePage } from "@/lib/content/public-pages";
import { buildPageMetadata } from "@/lib/seo";
import { type Metadata } from "next";

export const metadata: Metadata = buildPageMetadata(publicHomePage);

export default function NorwegianHomePage() {
  return <SenjaHomePage leadAction={submitLeadAction} />;
}

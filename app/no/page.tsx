import { submitLeadAction } from "@/lib/actions/lead-actions";
import { SenjaHomePage } from "@/components/site/SenjaHomePage";
import { publicHomePage } from "@/lib/content/public-pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata(publicHomePage);

export default function NorwegianHomePage() {
  return <SenjaHomePage leadAction={submitLeadAction} />;
}

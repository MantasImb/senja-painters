import { PublicPage } from "@/components/site/PublicPage";
import { submitLeadAction } from "@/lib/actions/lead-actions";
import { publicPages } from "@/lib/content/public-pages";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata(publicPages.utvendigMaling);

export default function ExteriorPaintingPage() {
  return (
    <PublicPage
      leadAction={submitLeadAction}
      page={publicPages.utvendigMaling}
    />
  );
}

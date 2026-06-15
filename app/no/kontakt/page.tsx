import { PublicPage } from "@/components/site/PublicPage";
import { submitLeadAction } from "@/lib/actions/lead-actions";
import { publicPages } from "@/lib/content/public-pages";

export default function ContactPage() {
  return <PublicPage leadAction={submitLeadAction} page={publicPages.kontakt} />;
}

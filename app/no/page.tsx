import { submitLeadAction } from "@/lib/actions/lead-actions";
import { SenjaHomePage } from "@/components/site/SenjaHomePage";

export default function NorwegianHomePage() {
  return <SenjaHomePage leadAction={submitLeadAction} />;
}

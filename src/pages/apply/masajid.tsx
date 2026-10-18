import FormRedirect from "@/components/FormRedirect";
import { FORM_URLS } from "@/lib/constants";

export default function ApplyMasajidPage() {
  return (
    <FormRedirect
      title="Redirecting to Masjid / Musallah Application Form..."
      url={FORM_URLS.masajid}
    />
  );
}

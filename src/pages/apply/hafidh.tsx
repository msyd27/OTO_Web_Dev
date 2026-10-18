import FormRedirect from "@/components/FormRedirect";
import { FORM_URLS } from "@/lib/constants";

export default function ApplyHafidhPage() {
  return (
    <FormRedirect
      title="Redirecting to Hafidh Application Form..."
      url={FORM_URLS.hafidh}
    />
  );
}

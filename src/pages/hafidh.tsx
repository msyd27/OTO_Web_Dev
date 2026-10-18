import FormRedirect from "@/components/FormRedirect";
import { FORM_URLS } from "@/lib/constants";

export default function HafidhPage() {
  return (
    <FormRedirect
      title="Redirecting to Hafidh Application Form..."
      url={FORM_URLS.hafidh}
    />
  );
}

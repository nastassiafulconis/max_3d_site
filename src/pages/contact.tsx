import { ContactForm } from "@/components/ContactForm";
import { useLanguage } from "../contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center w-screen">
      <h1 className="text-3xl font-bold mb-4">{t("nav.contact")}</h1>
      <ContactForm />
    </div>
  );
}

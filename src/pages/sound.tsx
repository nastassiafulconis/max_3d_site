import { useLanguage } from "../contexts/LanguageContext";

export default function Sound() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-screen">
      <h1 className="text-3xl font-bold mb-4">{t("nav.sound")}</h1>
    </div>
  );
}

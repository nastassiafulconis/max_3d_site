import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-screen">
      <div className="flex flex-col md:flex-row items-center justify-center w-screen gap-8 p-4 min-h-[calc(100vh-8rem)]">
        <p className="text-lg text-center md:text-left md:w-1/2">
          {t("about.description")}
        </p>
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden">
          <img
            src="/about.jpeg"
            alt="Maxence Fulconis"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

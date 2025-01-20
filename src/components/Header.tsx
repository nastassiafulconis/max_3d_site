import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { Logo } from "./Logo";

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="flex justify-between items-center w-full p-4">
      <div className="flex justify-start w-full align-center space-x-4">
        <Logo />
        <h1 className="hidden md:block text-white uppercase tracking-wider p-3">
          <b>Maxence Fulconis</b> - {t("website.title")}
        </h1>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <button
                onClick={() => setLanguage("fr")}
                className={`text-gray-400 hover:text-primary ${
                  language === "fr" && "text-primary font-medium"
                }`}
              >
                FR
              </button>
            </li>
            <li>
              <button
                onClick={() => setLanguage("en")}
                className={`text-gray-400 hover:text-primary" ${
                  language === "en" && "text-primary font-medium"
                }`}
              >
                EN
              </button>
            </li>
          </ul>
        </nav>
        {/* <button className="md:hidden text-gray-400 hover:text-primary">
                        <menu className="h-6 w-6" />
                        <span className="sr-only">Menu</span>
                    </button> */}
      </div>
    </header>
  );
};

import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { Logo } from "./Logo";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.about', href: '/about' },
    { key: 'nav.projects', href: '/projects' },
    { key: 'nav.sound', href: '/sound' },
    { key: 'nav.contact', href: '/contact' },
  ];

  const currentPage = usePathname();

  return (
    <header className="flex justify-between items-center w-full p-4">
      <div className="flex justify-start w-full align-center space-x-4">
        <Link href="/">
          <Logo />
        </Link>
        <h1 className="hidden md:block text-white uppercase tracking-wider p-3">
          <b>Maxence Fulconis</b> - {t("website.title")}
        </h1>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
          {navItems.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={`text-white hover:text-primary whitespace-nowrap ${currentPage === item.href ? 'font-bold' : ''}`}>
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li className="ml-6 border-l border-gray-600 pl-6">
              <button
                onClick={() => setLanguage("fr")}
                className={`hover:text-primary ${
                  language === "fr" ? "text-primary font-medium" : "text-gray-400"
                }`}
              >
                FR
              </button>
            </li>
            <li>
              <button
                onClick={() => setLanguage("en")}
                className={`hover:text-primary ${
                  language === "en" ? "text-primary font-medium" : "text-gray-400"
                }`}
              >
                EN
              </button>
            </li>
          </ul>
        </nav>

        {/* Desktop Menu */}
        <nav className="">
        </nav>

        {/* Mobile Menu */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
        >
          <MenuIcon className="text-2xl"/>
        </button>

        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-gray-900 rounded-lg shadow-lg p-4 md:hidden">
            <nav>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link 
                      href={item.href}
                      className=    {`text-white hover:text-primary block ${currentPage === item.href ? 'font-bold' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-gray-700">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setLanguage("fr");
                        setIsMenuOpen(false);
                      }}
                      className={`hover:text-primary ${
                        language === "fr" ? "text-primary font-medium" : "text-gray-400"
                      }`}
                    >
                      FR
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsMenuOpen(false);
                      }}
                      className={`hover:text-primary ${
                        language === "en" ? "text-primary font-medium" : "text-gray-400"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

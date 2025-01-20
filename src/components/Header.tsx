import Link from "next/link";
import { useLanguage } from '../contexts/LanguageContext'
import { Logo } from "./Logo";

export const Header = () => {
    const { language, setLanguage, t } = useLanguage()

    return (
        <header>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="text-primary">
                        <div className="bg-white p-2 rounded-md"></div>
                    </Link>
                    <Logo />
                    <h1 className="hidden md:block text-[#ff6b6b] uppercase text-sm tracking-wider">{t("website.title")}</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <nav className="hidden md:block">
                        <ul className="flex space-x-6">
                            <li>
                                <button onClick={() => setLanguage("fr")} className={`text-gray-400 hover:text-primary ${language === "fr" && "text-primary font-medium"}`}>
                                    FR
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setLanguage("en")} className={`text-gray-400 hover:text-primary" ${language === "en" && "text-primary font-medium"}`}>
                                    EN
                                </button>
                            </li>
                        </ul>
                    </nav>
                    <button className="md:hidden text-gray-400 hover:text-primary">
                        <menu className="h-6 w-6" />
                        <span className="sr-only">Menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

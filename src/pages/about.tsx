import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
    const { t } = useLanguage()
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{t('nav.about')}</h1>
            <p className="text-lg">{t('about.description')}</p>
        </div>
    )
}
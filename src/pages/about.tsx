import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
    const { t } = useLanguage()
    return (
        <div>
            <h1>{t('nav.about')}</h1>
        </div>
    )
}
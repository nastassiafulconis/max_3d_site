import { useLanguage } from "../contexts/LanguageContext";

export default function Contact() {
    const { t } = useLanguage()
    return (
        <div>
            <h1>{t('nav.contact')}</h1>
        </div>
    )
}
import { useLanguage } from "../contexts/LanguageContext";

export default function Sound() {
    const { t } = useLanguage()
    return (
        <div>
            <h1>{t('nav.sound')}</h1>
        </div>
    )
}
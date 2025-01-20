import { useLanguage } from "../contexts/LanguageContext";

export default function Projects() {
    const { t } = useLanguage()
    return (
        <div>
            <h1>{t('nav.projects')}</h1>
        </div>
    )
}
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  fr: {
    'website.title': 'Conception Musicale et Instrumentale',
    'nav.home': 'ACCUEIL',
    'nav.about': 'A PROPOS',
    'nav.projects': 'PROJETS',
    'nav.sound': 'SON',
    'nav.contact': 'CONTACT',
  },
  en: {
    'website.title': 'Musical and Instrumental Design',
    'nav.home': 'HOME',
    'nav.about': 'ABOUT',
    'nav.projects': 'PROJECTS',
    'nav.sound': 'SOUND',
    'nav.contact': 'CONTACT',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}


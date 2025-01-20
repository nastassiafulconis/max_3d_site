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
    'project.pen': 'Stylo',
    'project.pen-2': 'Stylo 2',
    'project.pen.description': 'Ca c\'est un stylo',
    'project.pen-2.description': 'Ca c\'est un stylo 2',
  },
  en: {
    'website.title': 'Musical and Instrumental Design',
    'nav.home': 'HOME',
    'nav.about': 'ABOUT',
    'nav.projects': 'PROJECTS',
    'nav.sound': 'SOUND',
    'nav.contact': 'CONTACT',
    'project.pen': 'Pen',
    'project.pen-2': 'Pen 2',
    'project.pen.description': 'This is a pen and it looks pretty cool. You can play around with it! It was designed as a 3d model for a school project.',
    'project.pen-2.description': 'This is a pen and it looks pretty cool. You can play around with it! It was designed as a 3d model for a school project.',
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


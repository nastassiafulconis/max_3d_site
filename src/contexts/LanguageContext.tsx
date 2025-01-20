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
    'website.title': 'Maxence Fulconis - Conception Musicale et Instrumentale',
    'nav.portfolio': 'PORTFOLIO',
    'nav.current_projects': 'PROJETS EN COURS',
    'portfolio.title': 'Mon Portfolio',
    'portfolio.description': 'Découvrez mes créations musicales et instrumentales',
    'current_projects.title': 'Projets Actuels',
    'current_projects.description': 'Explorez mes projets en cours de développement',
    'read.more': 'Lire la suite',
  },
  en: {
    'website.title': 'Maxence Fulconis - Musical and Instrumental Design',
    'nav.portfolio': 'PORTFOLIO',
    'nav.current_projects': 'CURRENT PROJECTS',
    'portfolio.title': 'My Portfolio',
    'portfolio.description': 'Discover my musical and instrumental creations',
    'current_projects.title': 'Current Projects',
    'current_projects.description': 'Explore my ongoing development projects',
    'read.more': 'Read more',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
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


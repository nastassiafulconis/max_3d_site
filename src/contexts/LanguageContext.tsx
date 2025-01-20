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
    'about.description': 'Maxence Fulconis est un designer et ingénieur du son.',
    'nav.projects': 'PROJETS',
    'nav.sound': 'SON',
    'nav.contact': 'CONTACT',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.success': 'Message envoyé avec succès !',
    'contact.error': 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
    'project.pen': 'Stylophone - Réinventer le téléphone mobile (modèle 3D imprimable)',
    'project.pen.description': 'Le Stylophone est un projet de réflexion mené sur quelques jours à l’ENSCI les Ateliers par Hérétique (https://heretique.fr/), studio de design voulant repenser le numérique.',
    'project.mecanisme-flexible': 'Mécanisme flexible dans la conception des clés d’instruments à vent (prototype fonctionnel)',
    'project.mecanisme-flexible.description': 'Un projet en cours visant à intégrer des mécanismes flexibles dans la conception des clés d’instruments à vent. Ces mécanismes réduisent la complexité, l’usure, et augmentent ainsi la durée de vie des clés. Ils ont été pensés pour des instruments à vent électroniques afin de les doter de clés agréables à utiliser tout en étant abordables à fabriquer et simples à installer, mais peuvent également fonctionner pour des instruments acoustiques.',
    'project.la-chose': 'La Chose - Synthétiseur FM (Prototype Fonctionnel)',
    'project.la-chose.description': 'La Chose est née du constat que la plupart des synthétiseurs d’aujourd’hui sont soit trop complexes pour être utilisés facilement, soit trop simples pour réellement effectuer de la recherche sonore. C’est donc un synthétiseur simple, mais dont les paramètres cachés sont complexes et se multiplient entre eux, donnant à un musicien un potentiel presque infini de recherche sonore, contenu dans 6 potentiomètres linéaires ! Le projet entier à été conçu et fabriqué main à Barcelone dans le cadre de la Fab Academy, des circuits électroniques fraisés dans des plaques de cuivres, à la boîte en bois et acrylique découpé au laser avec les côtés imprimés en 3D, en passant par le capuchon du potentiomètre de volume moulé en époxy. Le projet est disponible entièrement en open-source ici (https://fabacademy.org/2024/labs/barcelona/students/maxence-fulconis/final-project.html) !',
    'project.fox': 'Renard cellulaire - statuette (modèle 3D imprimable)',
    'project.fox.description': 'Un travail sur l’animalité et la géométrie à donné ce renard cellulaire, démarré premièrement comme un dessin enfantin d’un renard, tout en triangles, il a muté pour devenir cette statue évoquant la forme cellulaire et animale.',
    'project.olympus': 'Scan 3D - Olympus OM-1 (modèle 3D)',
    'project.olympus.description': 'Un scan 3D d’un appareil photo Olympus OM-1.',
  },
  en: {
    'website.title': 'Musical and Instrumental Design',
    'nav.home': 'HOME',
    'about.description': 'Maxence Fulconis is a designer and sound engineer.',
    'nav.projects': 'PROJECTS',
    'nav.sound': 'SOUND',
    'nav.contact': 'CONTACT',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.success': 'Message sent successfully!',
    'contact.error': 'Error sending message. Please try again.',
    'project.pen': 'Stylophone - Reinventing the mobile phone (printable 3D model)',
    'project.pen.description': 'The Stylophone is a brainstorming project carried out over a few days at ENSCI les Ateliers by Hérétique (https://heretique.fr/), a design studio seeking to rethink digital technology.',
    'project.mecanisme-flexible': 'Compliant mechanisms in wind Instrument key design (functional prototype)',
    'project.mecanisme-flexible.description': 'An ongoing project to incorporate compliant mechanisms into the design of wind instrument keys. These mechanisms reduce complexity and wear, thereby increasing the lifespan of the keys. They have been designed for electronic wind instruments to provide keys that are pleasant to use while being affordable to manufacture and simple to install, but can also work for acoustic instruments.',
    'project.la-chose': 'La Chose (The Thing) - FM Synthesizer (Functional Prototype)',
    'project.la-chose.description': "La Chose was born out of the realisation that most of today\'s synthesizers are either too complex to be used easily, or too simple to do any real sound research. It's a simple synthesiser, but its hidden parameters are complex and multiply with each other, giving a musician almost infinite potential for sound research, contained in 6 linear potentiometers! The entire project was designed and hand-built in Barcelona as part of the Fab Academy, from the electronic circuits milled from copper plates, to the laser-cut wood and acrylic box with 3D-printed sides, to the epoxy-moulded volume potentiometer cap. The entire project is available open-source here (https://fabacademy.org/2024/labs/barcelona/students/maxence-fulconis/final-project.html)!",
    'project.fox': 'Cellular fox - small statue (printable 3D model)',
    'project.fox.description': 'Working on animality and geometry gave rise to this cellular fox, which started out as a child\'s drawing of a fox, made from all triangles, and mutated to become this statue evoking the cellular and animal form.',
    'project.olympus': '3D Scan - Olympus OM-1 (3D Model)',
    'project.olympus.description': 'A 3D scan of an Olympus OM-1 camera.',
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


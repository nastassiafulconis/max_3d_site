"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    "website.title": "Conception Musicale et Instrumentale",
    "nav.home": "ACCUEIL",
    "about.description":
      "Je suis créateur d'objets et d'instruments inspirés par la musique et la pratique musicale instrumentale. J'ai travaillé notamment chez Buffet Crampon (ClariMate) et Aodyo Instruments (Sylphyo, Anyma Phi) avant d'intégrer le Fablab Barcelona pour un diplôme postgraduate en prototypage rapide et fabrication numérique en collaboration avec le MIT Center for Bits and Atoms de Neil Gershenfeld. J'ai ensuite rejoint l'Ecole Nationale Supérieure de Création Industrielle (l'ENSCI les Ateliers) pour le mastère spécialisé Création et Technologie Contemporaine (MS CTC).\n\nJ'accompagne ma pratique de créateur par une pratique musicale de composition et de jeu en tant que multi-instrumentiste à vent. Avec le Studio Porte Bleue, je propose également des services d'ingénieur du son (Académie du Climat, Simon Denizart, Zenrei, etc.)\n\nMû par ma passion pour les technologies du fablab et de l'open-source, j'anime des ateliers d'Openlab (modélisation 3D, fabrication numérique, Robotique Lego) à destination de jeunes publiques au FabLab Le Temps des Cerises à Issy-Les-Moulineaux.",
    "nav.projects": "PROJETS",
    "nav.sound": "CRÉATION SONORE",
    "nav.contact": "CONTACT",
    "contact.name": "Nom",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Envoyer",
    "contact.success": "Message envoyé avec succès !",
    "contact.error": "Erreur lors de l'envoi du message. Veuillez réessayer.",
  },
  en: {
    "website.title": "Musical and Instrumental Creation",
    "nav.home": "HOME",
    "about.description":
      "I create objects and instruments inspired by music and instrumental music-making. I worked at Buffet Crampon (ClariMate) and Aodyo Instruments (Sylphyo, Anyma Phi) before joining Fablab Barcelona for a postgraduate diploma in rapid prototyping and digital fabrication in collaboration with Neil Gershenfeld's MIT Center for Bits and Atoms. I then joined the Ecole Nationale Supérieure de Création Industrielle (ENSCI les Ateliers) for a specialised master's in Contemporary Creation and Technology (MS CTC).\n\nI combine my creative practice with musical composition and playing as a wind multi-instrumentalist. With Studio Porte Bleue, I also provide sound engineering services (Académie du Climat, Simon Denizart, Zenrei, etc.).\n\nDriven by my passion for fablab and open-source technologies, I run Openlab workshops (3D modelling, digital fabrication, Lego robotics) for young audiences at the FabLab Le Temps des Cerises in Issy-Les-Moulineaux.",
    "nav.projects": "PROJECTS",
    "nav.sound": "SOUND DESIGN",
    "nav.contact": "CONTACT",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send",
    "contact.success": "Message sent successfully!",
    "contact.error": "Error sending message. Please try again.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["fr"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

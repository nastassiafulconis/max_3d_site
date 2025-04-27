import { useLanguage } from "../contexts/LanguageContext";
import { Sound } from "../components/Sound";
import { useState } from "react";
import { useEffect } from "react";
import { ProjectItem } from "@/types";

export default function SoundPage() {
  const [sounds, setSounds] = useState<ProjectItem[]>([]);

  useEffect(() => {
    fetch('/api/projects?type=sound')
      .then((res) => res.json())
      .then((data: ProjectItem[]) => setSounds(data))
      .catch(console.error);
  }, []);

  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-screen">
      <h1 className="text-3xl font-bold mb-4">{t("nav.sound")}</h1>
      {sounds.map((sound) => (
        <Sound key={sound.id} {...sound} />
      ))}
    </div>
  );
}

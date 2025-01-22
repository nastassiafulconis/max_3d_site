import { useLanguage } from "../contexts/LanguageContext";
import { Sound } from "../components/Sound";

const sounds = [
    {
        id: "Dunes",
        fileName: "Dunes.wav",
        fileType: "wav",
    },
    {
        id: "Flute chords",
        fileName: "Flute chords.mp3",
        fileType: "mp3",
    },
    {
        id: "Nils Frahmesque",
        fileName: "Nils Frahmesque.mp3",
        fileType: "mp3",
    },
    {
        id: "Creation bactérienne",
        fileName: "creation_bacterienne.mp3",
        fileType: "mp3",
    },
]

export default function SoundPage() {
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

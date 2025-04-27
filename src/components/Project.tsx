import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";
import { ProjectItem } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectProps extends ProjectItem {
  side: "left" | "right";
}

export const Project = (props: ProjectProps) => {
    const { language } = useLanguage();
  const { file_type, id, side, name_en, name_fr, description_en, description_fr, signedUrl } = props;

  const name = language === 'en' ? name_en : name_fr;
  const description = language === 'en' ? description_en : description_fr;

  useEffect(() => {
    if (file_type === 'glb' && signedUrl) {
      threeRenderer(signedUrl, id)
    }
  }, [file_type, signedUrl, id])

  const renderDescription = (text: string) => {
    // Match pattern: word (https://...)
    const parts = text.split(/(\S+\s*\(https:\/\/[^)]+\))/g);

    return parts.map((part, index) => {
      const match = part.match(/(\S+)\s*\((https:\/\/[^)]+)\)/);
      if (match) {
        const [, word, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
          >
            {word}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex flex-col md:flex-row w-screen min-h-[50vh] items-center ${side === 'left' ? '' : 'md:flex-row-reverse'}`}>
      <div className={`w-full md:w-1/2 flex flex-col p-8 md:p-0 ${side === 'left' ? 'md:items-start md:text-left md:pl-12' : 'md:items-end md:text-right md:pr-12'} items-center text-center`}>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-lg">{renderDescription(description || '')}</p>
      </div>
      {file_type === 'mp4' ? (
        <div className="w-full md:w-1/2 h-[40vh] flex items-center justify-center">
          <video
            className="max-h-full max-w-full"
            controls
            muted
            loop
          >
            <source src={signedUrl} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div id={id} className="w-full md:w-1/2 h-[50vh]"></div>
      )}
    </div>
  )
}
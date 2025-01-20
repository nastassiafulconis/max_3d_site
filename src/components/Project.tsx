import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";
import { Project as ProjectType } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectProps extends ProjectType {
  side: "left" | "right";
}

export const Project = (props: ProjectProps) => {
    const { t } = useLanguage();
  const { fileType, fileName, id, side } = props;
  
  useEffect(() => {
    if (fileType === 'glb') {
      threeRenderer(fileName, id, side)
    }
  }, [fileType, fileName, id, side])

  return (
    <div className={`flex flex-col md:flex-row w-screen min-h-[50vh] items-center ${side === 'left' ? '' : 'md:flex-row-reverse'}`}>
      <div className={`w-full md:w-1/2 flex flex-col p-8 md:p-0 ${side === 'left' ? 'md:items-start md:text-left md:pl-12' : 'md:items-end md:text-right md:pr-12'} items-center text-center`}>
        <h1 className="text-3xl font-bold mb-4">{t(`project.${id}`)}</h1>
        <p className="text-lg">{t(`project.${id}.description`)}</p>
      </div>
      <div id={id} className="w-full md:w-1/2 h-[50vh]"></div>
    </div>
  )
}
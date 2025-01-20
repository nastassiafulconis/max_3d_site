import { useLanguage } from "../contexts/LanguageContext";
import { Project } from "@/components/Project";
import { Project as ProjectType } from "@/types";

const projects: ProjectType[] = [
    {
        fileType: "mp4",
        fileName: "la-chose.mp4",
        id: "la-chose",
    },
    {
        fileType: "glb",
        fileName: "mecanisme-flexible.glb",
        id: "mecanisme-flexible",
    },
    {
        fileType: "glb",
        fileName: "fox.glb",
        id: "fox",
    },
    {
        fileType: "glb",
        fileName: "pen.glb",
        id: "pen",
    },
    {
        fileType: "glb",
        fileName: "olympus.glb",
        id: "olympus"
    }
];

export default function Projects() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{t("nav.projects")}</h1>
      {projects.map((project, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        return <Project key={project.id} {...project} side={side} />;
      })}
    </div>
  );
}

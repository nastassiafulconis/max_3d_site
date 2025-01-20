import { useLanguage } from "../contexts/LanguageContext";
import { Project } from "@/components/Project";
import { Project as ProjectType } from "@/types";

const projects: ProjectType[] = [
  {
    fileType: "glb",
    fileName: "GLTFSiteTest.glb",
    id: "pen",
  },
  {
    fileType: "glb",
    fileName: "GLTFSiteTest.glb",
    id: "pen-2",
  },
];

export default function Projects() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{t("nav.projects")}</h1>
      {projects.map((project, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        return <Project {...project} side={side} />;
      })}
    </div>
  );
}

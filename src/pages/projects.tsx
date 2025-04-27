import { useLanguage } from "../contexts/LanguageContext";
import { Project } from "@/components/Project";
import { ProjectItem } from "@/types";
import { useState } from "react";
import { useEffect } from "react";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    fetch('/api/projects?type=project')
      .then((res) => res.json())
      .then((data: ProjectItem[]) => setProjects(data))
      .catch(console.error);
  }, []);

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

import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";
import { Project as ProjectType } from "@/types";

interface ProjectProps extends ProjectType {
  side: "left" | "right";
}

export const Project = (props: ProjectProps) => {
  const { fileType, fileName, id, name, description, side } = props;
  useEffect(() => {
    if (fileType === 'glb') {
      threeRenderer(fileName, id, side)
    }
  })
  return (
    <div className={`flex flex-row w-screen min-h-[50vh] items-center ${side === 'left' ? '' : 'flex-row-reverse'}`}>
      <div className={`w-1/2 flex flex-col ${side === 'left' ? 'items-start text-left pl-12' : 'items-end text-right pr-12'}`}>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-lg">{description}</p>
      </div>
      <div id={id} className="w-1/2 h-[50vh]"></div>
    </div>
  )
}
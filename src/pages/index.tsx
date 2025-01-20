import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    threeRenderer('GLTFSiteTest.glb', 'pen')
  })
    return (
      <div className='flex flex-col justify-center items-center min-h-screen min-w-screen'>
        <div id='pen' 
        className='h-screen w-screen'
        ></div>
      </div>
    );
}

"use client"

import Image from "next/image";
import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    threeRenderer('GLTFSiteTest.glb', 'pen')
  })
    return (
        <div className='flex flex-col justify-center align-center items-center'>
            <h1 className='text-5xl'>Max's 3D Models</h1>
            <div id='pen' className='h-[100vh] w-[100vh]'></div>
        </div>
    );
}

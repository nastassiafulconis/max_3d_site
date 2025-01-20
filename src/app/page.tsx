"use client"

import { threeRenderer } from "@/helpers/threeRenderer";
import { useEffect } from "react";
import { Header } from "@/components/Header";

export default function Home() {
  useEffect(() => {
    threeRenderer('GLTFSiteTest.glb', 'pen')
  })
    return (
        <div className='flex flex-col justify-center align-center items-center'>
            <Header/>
            <div id='pen' className='h-[100vh] w-[100vh]'></div>
        </div>
    );
}

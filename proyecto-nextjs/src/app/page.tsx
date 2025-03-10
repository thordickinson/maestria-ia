'use client'

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";

export default function Home() {
  const Map = useMemo(() => dynamic(
    () => import('@/app/components/Map'),
    { 
      loading: () => <p>A map is loading</p>,
      ssr: false
    }
  ), [])
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
       <Map zoom={15} position={{lat: 4.71, lng: -74.13 }} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}

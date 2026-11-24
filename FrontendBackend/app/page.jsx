"use client";
import dynamic from "next/dynamic";
const SupplementLanding = dynamic(() => import("../src/main.jsx"), { ssr: false });
export default function HomePage() { return <SupplementLanding />; }

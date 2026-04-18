"use client";

import dynamic from "next/dynamic";

const Biblioteca = dynamic(() => import("@/modules/Biblioteca"), {
  ssr: false,
});

export default function BibliotecaPage() {
  return <Biblioteca />;
}
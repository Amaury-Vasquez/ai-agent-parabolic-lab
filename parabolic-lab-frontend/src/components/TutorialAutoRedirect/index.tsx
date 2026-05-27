"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/queries/useMe";

export const tutorialStorageKey = (idusuario: string) =>
  `tutorial_visto_${idusuario}`;

const TutorialAutoRedirect = () => {
  const { data: me } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!me?.idusuario) return;
    if (pathname?.startsWith("/alumno/tutorial")) return;

    const key = tutorialStorageKey(me.idusuario);
    if (!localStorage.getItem(key)) {
      router.push("/alumno/tutorial");
    }
  }, [me?.idusuario, pathname, router]);

  return null;
};

export default TutorialAutoRedirect;

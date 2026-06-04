"use client";
import { HelpCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const ImagenPlaceholder = ({ descripcion }: { descripcion: string }) => (
  <div className="w-full rounded-xl bg-base-200 border border-dashed border-base-300 flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
    <HelpCircle className="size-8 opacity-30" />
    <p className="text-sm opacity-40 italic">{descripcion}</p>
  </div>
);

interface TutorialImageProps {
  src: string;
  alt: string;
  descripcion: string;
}

// Captura de pantalla dentro de los tutoriales; si la imagen falla en
// cargar, muestra un placeholder con la descripción.
const TutorialImage = ({ src, alt, descripcion }: TutorialImageProps) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <ImagenPlaceholder descripcion={`Imagen pendiente: ${descripcion}`} />
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-base-300">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 768px"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default TutorialImage;

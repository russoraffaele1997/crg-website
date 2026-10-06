"use client";

import { useState } from "react";
import ClientImage from "@/components/ClientImage";
import Lightbox from "./Lightbox";

/**
 * Clickable thumbnails opening the lightbox. `layout="gallery"` makes the
 * first photo big (project gallery), `layout="strip"` is a compact row
 * (diary entries, construction phases).
 */
export default function PhotoGrid({
  images,
  alt,
  layout = "strip",
  fallbackClass = "w-full h-full bg-light-gray",
}: {
  images: string[];
  alt: string;
  layout?: "gallery" | "strip";
  fallbackClass?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className={layout === "gallery" ? "grid grid-cols-2 md:grid-cols-4 gap-2" : "grid grid-cols-3 sm:grid-cols-4 gap-2"}>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Apri foto ${i + 1} di ${images.length}`}
            className={`relative overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-crg-red aspect-square ${
              layout === "gallery" && i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <ClientImage
              src={src}
              alt={`${alt}: foto ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              fallbackClass={fallbackClass}
            />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox images={images} startIndex={open} alt={alt} onClose={() => setOpen(null)} />}
    </>
  );
}

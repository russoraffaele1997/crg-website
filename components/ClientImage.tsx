"use client";

import { useState } from "react";

interface ClientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClass?: string;
}

export default function ClientImage({
  src,
  alt,
  className = "",
  fallbackClass = "",
}: ClientImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={fallbackClass || className}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

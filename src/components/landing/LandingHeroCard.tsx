"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMG = "https://placehold.co/400x500/1a1a2e/6366f1?text=JW+PARFUM";

interface LandingHeroCardProps {
  img: string;
  alt: string;
  className: string;
  style?: React.CSSProperties;
}

export function LandingHeroCard({
  img,
  alt,
  className,
  style,
}: LandingHeroCardProps) {
  const [src, setSrc] = useState(img);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setSrc(FALLBACK_IMG);
    }
  };

  return (
    <div
      className={`overflow-hidden ${className} shrink-0 shadow-lg`}
      style={style}
    >
      <Image
        src={src}
        alt={alt}
        width={400}
        height={500}
        className="w-full h-full object-cover object-top"
        sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 180px"
        onError={handleError}
        unoptimized={src.startsWith("https://placehold.co")}
      />
    </div>
  );
}

"use client";

import LightRays from "@/components/LightRays";

export function HeroLightRaysBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={1}
        rayLength={2}
        pulsating={false}
        fadeDistance={1}
        saturation={1}
        followMouse
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
      />
    </div>
  );
}

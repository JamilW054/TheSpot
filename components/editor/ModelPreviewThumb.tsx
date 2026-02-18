"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, Suspense } from "react";

function StaticModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const obj = scene.clone ? scene.clone() : scene;
  const scale = MODEL_SCALE[modelPath] ?? DEFAULT_SCALE;
  return (
    <Center>
      <primitive object={obj} scale={scale} />
    </Center>
  );
}

class ThumbErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/** Distancia de cámara por modelo (z): más alto = más zoom out, modelo más lejos */
const CAMERA_DISTANCE: Record<string, number> = {
  "/models/tshirt/scene.gltf": 6,
  "/models/male_tshirt.glb": 6,
  "/models/robe_cloth_for_iclone_and_character_creator.glb": 6,
};

const DEFAULT_CAMERA_DISTANCE = 2.2;

/** Escala por modelo (Sketchfab en unidades grandes) */
const MODEL_SCALE: Record<string, number> = {
  "/models/tshirt/scene.gltf": 0.0008,
};
const DEFAULT_SCALE = 1;

export interface ModelPreviewThumbProps {
  modelPath: string;
  className?: string;
}

/**
 * Vista fija del modelo 3D (sin rotar ni interactuar). Solo para preview en la card de prendas.
 * Cámara frontal, sin OrbitControls; solo clic para seleccionar la card.
 */
const ThumbFallback = () => (
  <div className="flex size-full min-h-[120px] items-center justify-center rounded-t-xl bg-muted/60 text-muted-foreground">
    <span className="text-xs">Sin vista previa</span>
  </div>
);

export function ModelPreviewThumb({ modelPath, className }: ModelPreviewThumbProps) {
  const cameraZ = CAMERA_DISTANCE[modelPath] ?? DEFAULT_CAMERA_DISTANCE;
  return (
    <ThumbErrorBoundary fallback={<ThumbFallback />}>
      <div className={`pointer-events-none relative size-full min-h-[120px] overflow-hidden rounded-t-xl bg-muted/80 ${className ?? ""}`}>
        <Canvas
          camera={{ position: [0, 0, cameraZ], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="!size-full"
          frameloop="always"
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <directionalLight position={[-1, 1, 0.5]} intensity={0.4} />
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#888" />
              </mesh>
            }
          >
            <StaticModel modelPath={modelPath} />
          </Suspense>
        </Canvas>
      </div>
    </ThumbErrorBoundary>
  );
}

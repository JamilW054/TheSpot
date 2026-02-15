"use client";

import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { ClampToEdgeWrapping, TextureLoader } from "three";
import type { BufferAttribute, Object3D } from "three";
import type { Mesh, MeshStandardMaterial, Texture } from "three";
import type { DesignZoneUV } from "@/config/texture-uv";
import { clampUVBounds } from "@/config/texture-uv";

interface TShirtModelProps {
  modelPath: string;
  textureUrl: string | null;
}

function TShirtModel({ modelPath, textureUrl }: TShirtModelProps) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!textureUrl) return;

    const loader = new TextureLoader();
    loader.load(
      textureUrl,
      (tex: Texture) => {
        tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
        tex.anisotropy = 4;
        tex.flipY = true;
        scene.traverse((child) => {
          if (child.type === "Mesh") {
            const mesh = child as Mesh;
            const mat = mesh.material;
            const materials = Array.isArray(mat) ? mat : [mat];
            for (const m of materials) {
              const std = m as MeshStandardMaterial;
              if (std.map !== undefined) {
                if (std.map) std.map.dispose();
                std.map = tex;
                std.needsUpdate = true;
              }
            }
          }
        });
      },
      undefined,
      () => {}
    );
  }, [textureUrl, scene]);

  return (
    <Center>
      <primitive object={scene} scale={1} />
    </Center>
  );
}

/**
 * Lee geometry.attributes.uv del modelo y calcula el bounding box en espacio UV.
 * Three.js: cada vértice tiene (u,v) en [0,1] que apunta a un píxel en la textura.
 * Usamos esos bounds para dibujar el diseño en la zona correcta de la textura.
 */
function readUVBoundsFromScene(scene: Object3D): DesignZoneUV | null {
  let minU = 1;
  let maxU = 0;
  let minV = 1;
  let maxV = 0;
  let found = false;

  scene.traverse((child) => {
    if (child.type !== "Mesh") return;
    const mesh = child as Mesh;
    const geo = mesh.geometry;
    if (!geo?.attributes?.uv) return;
    const uv = geo.attributes.uv as BufferAttribute;
    const arr = uv.array;
    for (let i = 0; i < arr.length; i += 2) {
      const u = arr[i]!;
      const v = arr[i + 1]!;
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
      found = true;
    }
  });

  if (!found || minU >= maxU || minV >= maxV) return null;
  return clampUVBounds({ u0: minU, v0: minV, u1: maxU, v1: maxV });
}

function UVBoundsReader({
  modelPath,
  onBounds,
}: {
  modelPath: string;
  onBounds: (bounds: DesignZoneUV) => void;
}) {
  const { scene } = useGLTF(modelPath);
  useEffect(() => {
    const bounds = readUVBoundsFromScene(scene);
    if (bounds) onBounds(bounds);
  }, [scene, onBounds]);
  return null;
}

export const ROTATION_STEP_3D = 15;
export const ZOOM_STEP_3D = 0.25;
export const MIN_ZOOM_3D = 0.005;
export const MAX_ZOOM_3D = 4;

export interface MockupViewer3DProps {
  modelPath: string;
  textureUrl: string | null;
  fullSize?: boolean;
  /** Controles externos (cuando fullSize, se muestran en el panel derecho) */
  rotation?: number;
  zoom?: number;
  /** Llamado cuando el modelo carga: bounds UV leídos de geometry.attributes.uv */
  onUVBoundsDetected?: (bounds: DesignZoneUV) => void;
}

export function MockupViewer3D({
  modelPath,
  textureUrl,
  fullSize = false,
  rotation = 0,
  zoom = 1,
  onUVBoundsDetected,
}: MockupViewer3DProps) {
  const rotationNorm = ((rotation % 360) + 360) % 360;

  return (
    <div
      className={`flex flex-col bg-transparent ${
        fullSize ? "h-full min-h-[300px]" : "h-[280px]"
      }`}
    >
      <div className="relative size-full min-h-0 flex-1 overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          className="!h-full !w-full"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 3, 3]} intensity={1.2} />
          <directionalLight position={[-2, 2, -1]} intensity={0.5} />
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            }
          >
            {onUVBoundsDetected && (
              <UVBoundsReader modelPath={modelPath} onBounds={onUVBoundsDetected} />
            )}
            <group
              position={[0, -0.08, 0]}
              rotation={[0, (rotationNorm * Math.PI) / 180, 0]}
              scale={zoom}
            >
              <TShirtModel modelPath={modelPath} textureUrl={textureUrl} />
            </group>
          </Suspense>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.8}
            maxDistance={20}
          />
        </Canvas>
      </div>
      {!fullSize && (
        <p className="border-t border-border p-2 text-xs text-muted-foreground">
          Arrastra para rotar · Rueda para zoom
        </p>
      )}
    </div>
  );
}

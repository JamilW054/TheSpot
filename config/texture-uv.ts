/**
 * UV mapping for 3D models: define where the "design zone" (canvas 400x300)
 * is drawn on the texture so it appears on the correct part of the mesh
 * (pecho, espalda, cuello, etc.).
 *
 * Coordinates in 0-1 (UV space). The canvas content is drawn into this rectangle.
 * Texture export is 1024x1024; al cargar esa imagen en el mismo modelo, el diseño
 * se posiciona en la ubicación correcta.
 *
 * Si tu GLB tiene otro mapeo UV, ajusta u0,v0,u1,v1 (por ejemplo espalda podría
 * ser otro rectángulo en la textura).
 */

export interface DesignZoneUV {
  /** Left (U min) */
  u0: number;
  /** Bottom (V min) */
  v0: number;
  /** Right (U max) */
  u1: number;
  /** Top (V max) */
  v1: number;
}

/** Design zone = front chest (pecho) for typical T-shirt GLB */
const DEFAULT_ZONE: DesignZoneUV = {
  u0: 0.1,
  v0: 0.2,
  u1: 0.9,
  v1: 0.8,
};

/** Por modelo: zona UV donde se dibuja el diseño (pecho, espalda, etc.) */
const MODEL_UV: Record<string, DesignZoneUV> = {
  "/models/male_tshirt.glb": {
    u0: 0.1,
    v0: 0.2,
    u1: 0.9,
    v1: 0.8,
  },
};

export function getDesignZoneUV(modelPath: string): DesignZoneUV {
  return MODEL_UV[modelPath] ?? DEFAULT_ZONE;
}

/**
 * Clamp UV bounds to [0,1] and ensure min < max.
 */
export function clampUVBounds(bounds: DesignZoneUV): DesignZoneUV {
  return {
    u0: Math.max(0, Math.min(1, bounds.u0)),
    v0: Math.max(0, Math.min(1, bounds.v0)),
    u1: Math.max(0, Math.min(1, bounds.u1)),
    v1: Math.max(0, Math.min(1, bounds.v1)),
  };
}

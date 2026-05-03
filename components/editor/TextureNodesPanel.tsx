"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Palette,
  Image,
  Box,
  ArrowRight,
  Merge,
  Calculator,
  Grid3X3,
} from "lucide-react";

export type TextureNodeType = "color" | "image" | "uv" | "mix" | "math" | "output";

export interface TextureNode {
  id: string;
  type: TextureNodeType;
  x: number;
  y: number;
  color?: string;
  imageUrl?: string;
  /** mix: 0-1 */
  factor?: number;
  /** math: "add" | "multiply" */
  mathOp?: "add" | "multiply";
  /** uv */
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface TextureConnection {
  id: string;
  fromNodeId: string;
  fromSlot: number;
  toNodeId: string;
  toSlot: number;
}

const MATERIAL_INPUTS = [
  { slot: 0, label: "Base Color", kind: "color" as const },
  { slot: 1, label: "Map", kind: "texture" as const },
];

const NODE_DEFS: {
  type: TextureNodeType;
  label: string;
  icon: React.ReactNode;
  outputs: number;
  inputs?: { slot: number; label: string; kind: "color" | "texture" | "float" }[];
}[] = [
  { type: "color", label: "Color", icon: <Palette className="size-4" />, outputs: 1 },
  { type: "image", label: "Imagen", icon: <Image className="size-4" />, outputs: 1 },
  { type: "uv", label: "UV", icon: <Grid3X3 className="size-4" />, outputs: 1 },
  {
    type: "mix",
    label: "Mix",
    icon: <Merge className="size-4" />,
    outputs: 1,
    inputs: [
      { slot: 0, label: "A", kind: "color" },
      { slot: 1, label: "B", kind: "color" },
    ],
  },
  {
    type: "math",
    label: "Math",
    icon: <Calculator className="size-4" />,
    outputs: 1,
    inputs: [
      { slot: 0, label: "A", kind: "float" },
      { slot: 1, label: "B", kind: "float" },
    ],
  },
  {
    type: "output",
    label: "Material",
    icon: <ArrowRight className="size-4" />,
    outputs: 0,
    inputs: MATERIAL_INPUTS,
  },
];

const NODE_WIDTH = 172;
const NODE_HEADER_H = 36;
const SOCKET_R = 6;
const SLOT_DY = 26;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0")).join("");
}

function blendColors(hexA: string, hexB: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, factor));
  return rgbToHex(r1 * (1 - t) + r2 * t, g1 * (1 - t) + g2 * t, b1 * (1 - t) + b2 * t);
}

export interface TextureNodesPanelProps {
  fullView?: boolean;
  /** Color actual del material (para sincronizar con el modelo) */
  garmentColor?: string;
  /** Al conectar un nodo de color a Material Base Color → se aplica al modelo */
  onMaterialColorChange?: (hex: string) => void;
  /** Al conectar un nodo de imagen a Material Map → se aplica al modelo */
  onMaterialTextureChange?: (url: string | null) => void;
}

export function TextureNodesPanel({
  fullView = false,
  garmentColor = "#ffffff",
  onMaterialColorChange,
  onMaterialTextureChange,
}: TextureNodesPanelProps) {
  const [nodes, setNodes] = useState<TextureNode[]>(() => [
    { id: "n1", type: "color", x: 24, y: 24, color: "#6366f1" },
    { id: "n2", type: "output", x: 240, y: 80 },
  ]);
  const [connections, setConnections] = useState<TextureConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<{ nodeId: string; slot: number } | null>(null);
  const [dragPos, setDragPos] = useState<[number, number] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = useCallback((type: TextureNodeType) => {
    const id = `n-${Date.now()}`;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type,
        x: 60 + (prev.length % 4) * 200,
        y: 40 + Math.floor(prev.length / 4) * 140,
        ...(type === "color" && { color: "#ffffff" }),
        ...(type === "mix" && { factor: 0.5 }),
        ...(type === "math" && { mathOp: "add" as const }),
        ...(type === "uv" && { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 }),
      },
    ]);
    setSelectedNodeId(id);
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<TextureNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const addConnection = useCallback((fromNodeId: string, fromSlot: number, toNodeId: string, toSlot: number) => {
    setConnections((prev) => {
      const exists = prev.some(
        (c) => c.toNodeId === toNodeId && c.toSlot === toSlot
      );
      if (exists) {
        return prev.filter((c) => !(c.toNodeId === toNodeId && c.toSlot === toSlot));
      }
      return [
        ...prev,
        { id: `c-${Date.now()}`, fromNodeId, fromSlot, toNodeId, toSlot },
      ];
    });
  }, []);

  const removeConnection = useCallback((toNodeId: string, toSlot: number) => {
    setConnections((prev) => prev.filter((c) => !(c.toNodeId === toNodeId && c.toSlot === toSlot)));
  }, []);

  const getSocketXY = useCallback(
    (nodeId: string, slotIndex: number, isOutput: boolean): [number, number] => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return [0, 0];
      const def = NODE_DEFS.find((d) => d.type === node.type);
      const inputCount = def?.inputs?.length ?? 0;
      const outputCount = def?.outputs ?? 0;
      const row = isOutput ? inputCount + slotIndex : slotIndex;
      const ny = node.y + NODE_HEADER_H + 10 + row * SLOT_DY;
      const x = isOutput ? node.x + NODE_WIDTH : node.x;
      const y = ny + SOCKET_R;
      return [x, y];
    },
    [nodes]
  );

  const getNodeOutputValue = useCallback(
    (nodeId: string): string | null => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;
      if (node.type === "color") return node.color ?? "#ffffff";
      if (node.type === "image") return node.imageUrl ?? null;
      if (node.type === "mix") {
        const connA = connections.find((c) => c.toNodeId === nodeId && c.toSlot === 0);
        const connB = connections.find((c) => c.toNodeId === nodeId && c.toSlot === 1);
        const valA = connA ? getNodeOutputValue(connA.fromNodeId) : null;
        const valB = connB ? getNodeOutputValue(connB.fromNodeId) : null;
        const hexA = valA && /^#/.test(valA) ? valA : "#808080";
        const hexB = valB && /^#/.test(valB) ? valB : "#808080";
        return blendColors(hexA, hexB, node.factor ?? 0.5);
      }
      if (node.type === "math") return null;
      if (node.type === "uv") return null;
      return null;
    },
    [nodes, connections]
  );

  const getNodeOutputTexture = useCallback(
    (nodeId: string): string | null => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;
      if (node.type === "image") return node.imageUrl ?? null;
      return null;
    },
    [nodes]
  );

  useEffect(() => {
    const outputNode = nodes.find((n) => n.type === "output");
    if (!outputNode || (!onMaterialColorChange && !onMaterialTextureChange)) return;
    const connColor = connections.find((c) => c.toNodeId === outputNode.id && c.toSlot === 0);
    const connMap = connections.find((c) => c.toNodeId === outputNode.id && c.toSlot === 1);
    if (onMaterialColorChange) {
      if (connColor) {
        const val = getNodeOutputValue(connColor.fromNodeId);
        if (val && /^#/.test(val)) onMaterialColorChange(val);
      } else {
        onMaterialColorChange(garmentColor);
      }
    }
    if (onMaterialTextureChange) {
      if (connMap) {
        const val = getNodeOutputTexture(connMap.fromNodeId);
        onMaterialTextureChange(val ?? null);
      } else {
        onMaterialTextureChange(null);
      }
    }
  }, [
    nodes,
    connections,
    garmentColor,
    getNodeOutputValue,
    getNodeOutputTexture,
    onMaterialColorChange,
    onMaterialTextureChange,
  ]);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragFrom || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setDragPos([e.clientX - rect.left, e.clientY - rect.top]);
    },
    [dragFrom]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setDragFrom(null);
    setDragPos(null);
  }, []);

  const handleOutputMouseDown = useCallback((nodeId: string, slot: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragFrom({ nodeId, slot });
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragPos([e.clientX - rect.left, e.clientY - rect.top]);
    }
  }, []);

  const handleInputMouseUp = useCallback(
    (toNodeId: string, toSlot: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (dragFrom) {
        addConnection(dragFrom.nodeId, dragFrom.slot, toNodeId, toSlot);
        setDragFrom(null);
        setDragPos(null);
      }
    },
    [dragFrom, addConnection]
  );

  const handleInputRightClick = useCallback(
    (toNodeId: string, toSlot: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      removeConnection(toNodeId, toSlot);
    },
    [removeConnection]
  );

  function getNodeColor(type: TextureNodeType): string {
    switch (type) {
      case "color":
        return "from-violet-500/20 to-purple-600/20 border-violet-500/40";
      case "image":
        return "from-amber-500/20 to-orange-600/20 border-amber-500/40";
      case "uv":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-500/40";
      case "mix":
        return "from-cyan-500/20 to-blue-600/20 border-cyan-500/40";
      case "math":
        return "from-rose-500/20 to-pink-600/20 border-rose-500/40";
      case "output":
        return "from-primary/20 to-primary/40 border-primary/50";
      default:
        return "from-muted to-muted border-border";
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 ${fullView ? "flex-1 min-h-0 overflow-hidden" : ""}`}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseUp}
      onMouseUp={handleCanvasMouseUp}
    >
      <p className="shrink-0 text-xs text-muted-foreground">
        Arrastra desde un círculo de salida hasta una entrada del Material. Las conexiones actualizan color y textura de la prenda en la vista previa.
      </p>

      <div className="flex flex-wrap gap-2 shrink-0">
        {NODE_DEFS.map(({ type, label, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addNode(type)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            {icon}
            <span>{label}</span>
            <Plus className="size-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        className={`scrollbar-hide relative overflow-hidden rounded-xl border border-border bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] ${fullView ? "flex-1 min-h-[260px]" : "min-h-[320px]"}`}
      >
        <svg className="absolute inset-0 size-full pointer-events-none overflow-visible" aria-hidden>
          <defs>
            <marker
              id="node-arrow"
              markerWidth={10}
              markerHeight={10}
              refX={9}
              refY={3}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 Z" fill="currentColor" className="text-primary" opacity={0.9} />
            </marker>
          </defs>
          {connections.map((c) => {
            const [x1, y1] = getSocketXY(c.fromNodeId, c.fromSlot, true);
            const [x2, y2] = getSocketXY(c.toNodeId, c.toSlot, false);
            const mx = (x1 + x2) / 2;
            const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
            return (
              <path
                key={c.id}
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeOpacity={0.7}
                markerEnd="url(#node-arrow)"
                className="text-primary"
              />
            );
          })}
          {dragFrom && dragPos && canvasRef.current && (() => {
            const [x1, y1] = getSocketXY(dragFrom.nodeId, dragFrom.slot, true);
            const rect = canvasRef.current.getBoundingClientRect();
            const x2 = dragPos[0];
            const y2 = dragPos[1];
            const mx = (x1 + x2) / 2;
            const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
            return (
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="6 4"
                className="text-primary opacity-80"
              />
            );
          })()}
        </svg>

        {nodes.map((node) => {
          const def = NODE_DEFS.find((n) => n.type === node.type);
          const inputSlots = def?.inputs ?? [];
          const outputCount = def?.outputs ?? 0;
          const rows = Math.max(inputSlots.length, outputCount) + (inputSlots.length && outputCount ? 1 : 0);
          const height = NODE_HEADER_H + Math.max(1, rows) * SLOT_DY + 16;

          return (
            <div
              key={node.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedNodeId(node.id)}
              onKeyDown={(e) => e.key === "Delete" && setNodes((p) => p.filter((n) => n.id !== node.id))}
              className={`absolute rounded-xl border-2 bg-gradient-to-br shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${getNodeColor(node.type)} ${
                selectedNodeId === node.id ? "ring-2 ring-primary scale-[1.02]" : "hover:shadow-xl"
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                minHeight: height,
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 rounded-t-xl bg-black/5 dark:bg-white/5">
                {def?.icon}
                <span className="text-xs font-semibold text-foreground truncate">{def?.label ?? node.type}</span>
              </div>
              <div className="p-2 space-y-1">
                {inputSlots.map((inp) => {
                  const conn = connections.find((c) => c.toNodeId === node.id && c.toSlot === inp.slot);
                  return (
                    <div key={inp.slot} className="flex items-center gap-2">
                      <button
                        type="button"
                        className="size-3 shrink-0 rounded-full border-2 border-background bg-muted-foreground/50 hover:bg-primary transition-colors"
                        title={`Entrada ${inp.label}. Clic derecho para quitar. Arrastra una salida aquí.`}
                        onMouseUp={handleInputMouseUp(node.id, inp.slot)}
                        onContextMenu={handleInputRightClick(node.id, inp.slot)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[10px] text-muted-foreground">{inp.label}</span>
                      {conn && <span className="text-[10px] text-primary truncate">conectado</span>}
                    </div>
                  );
                })}
                {node.type === "color" && (
                  <div className="flex items-center gap-2">
                    <div
                      className="size-6 rounded-md border border-border shrink-0"
                      style={{ backgroundColor: node.color ?? "#fff" }}
                    />
                    <input
                      type="color"
                      value={node.color ?? "#ffffff"}
                      onChange={(e) => updateNode(node.id, { color: e.target.value })}
                      className="size-8 cursor-pointer rounded border border-border bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Color"
                      title="Color"
                    />
                  </div>
                )}
                {node.type === "image" && (
                  <input
                    type="url"
                    placeholder="URL imagen"
                    value={node.imageUrl ?? ""}
                    onChange={(e) => updateNode(node.id, { imageUrl: e.target.value })}
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {node.type === "mix" && (
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={node.factor ?? 0.5}
                      onChange={(e) => updateNode(node.id, { factor: Number(e.target.value) })}
                      className="flex-1 h-1.5 rounded"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Factor de mezcla"
                      title="Factor A/B"
                    />
                    <span className="text-[10px] w-6">{(node.factor ?? 0.5).toFixed(2)}</span>
                  </div>
                )}
                {node.type === "math" && (
                  <select
                    value={node.mathOp ?? "add"}
                    onChange={(e) => updateNode(node.id, { mathOp: e.target.value as "add" | "multiply" })}
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Operación matemática"
                    title="Suma o Multiplicar"
                  >
                    <option value="add">Suma</option>
                    <option value="multiply">Multiplicar</option>
                  </select>
                )}
                {node.type === "uv" && (
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Sx</span>
                      <input
                        type="number"
                        step={0.1}
                        value={node.scaleX ?? 1}
                        onChange={(e) => updateNode(node.id, { scaleX: Number(e.target.value) })}
                        className="w-12 rounded border border-border bg-background px-1"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Escala X UV"
                        title="Scale X"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Sy</span>
                      <input
                        type="number"
                        step={0.1}
                        value={node.scaleY ?? 1}
                        onChange={(e) => updateNode(node.id, { scaleY: Number(e.target.value) })}
                        className="w-12 rounded border border-border bg-background px-1"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Escala Y UV"
                        title="Scale Y"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Ox</span>
                      <input
                        type="number"
                        step={0.01}
                        value={node.offsetX ?? 0}
                        onChange={(e) => updateNode(node.id, { offsetX: Number(e.target.value) })}
                        className="w-12 rounded border border-border bg-background px-1"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Offset X UV"
                        title="Offset X"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Oy</span>
                      <input
                        type="number"
                        step={0.01}
                        value={node.offsetY ?? 0}
                        onChange={(e) => updateNode(node.id, { offsetY: Number(e.target.value) })}
                        className="w-12 rounded border border-border bg-background px-1"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Offset Y UV"
                        title="Offset Y"
                      />
                    </div>
                  </div>
                )}
                {outputCount > 0 && (
                  <div className="flex justify-end gap-1 pt-0.5">
                    {Array.from({ length: outputCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className="size-3 rounded-full border-2 border-background bg-primary shadow-sm hover:bg-primary/80 cursor-crosshair"
                        title="Arrastra para conectar a una entrada"
                        onMouseDown={handleOutputMouseDown(node.id, i)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="shrink-0 text-[11px] text-muted-foreground italic">
        Conecta Color o Mix al Base Color del Material; Imagen al Map. Los cambios se reflejan en la textura de la vista previa.
      </p>
    </div>
  );
}

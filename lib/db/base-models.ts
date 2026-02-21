import type { Mockup } from "@/types";

export interface BaseModelRow {
  id: string;
  path: string;
  name: string;
}

export function rowToMockup(row: BaseModelRow): Mockup {
  return {
    id: row.path,
    name: row.name,
    category: "3d",
    modelPath: row.path,
  };
}

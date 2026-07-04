import type { Mockup } from "@/types";

export interface BaseModelRow {
  id: string;
  path: string;
  name: string;
}

export function rowToMockup(row: BaseModelRow): Mockup {
  const isHttp = /^https?:\/\//i.test(row.path);
  return {
    id: row.path,
    name: row.name,
    category: "2d",
    ...(isHttp ? { imageUrl: row.path } : {}),
  };
}

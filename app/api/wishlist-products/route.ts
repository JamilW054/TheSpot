import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProductsByIds } from "@/lib/db";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  const products = await getProductsByIds(ids);
  return NextResponse.json(products);
}

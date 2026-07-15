import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Bloquer solo orígenes privados/locales (SSRF). Cualquier URL pública de imagen está permitida. */
function isPrivateAddress(host: string): boolean {
  return /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80:)/i.test(
    host,
  );
}

async function isAllowedOrigin(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || isPrivateAddress(host)) return false;
    if (isIP(host)) return !isPrivateAddress(host);
    const addresses = await lookup(host, { all: true, verbatim: true });
    return (
      addresses.length > 0 &&
      addresses.every(({ address }) => !isPrivateAddress(address))
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (!(await isAllowedOrigin(url))) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/*" },
      next: { revalidate: 86_400 },
      redirect: "error",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Image fetch failed" },
        { status: 502 },
      );
    }
    const contentType = res.headers.get("content-type") ?? "";
    const declaredLength = Number(res.headers.get("content-length") ?? "0");
    if (
      !contentType.toLowerCase().startsWith("image/") ||
      declaredLength > MAX_IMAGE_BYTES
    ) {
      return NextResponse.json(
        { error: "Invalid image response" },
        { status: 415 },
      );
    }
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}

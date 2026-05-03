import { NextRequest, NextResponse } from "next/server";

/** Bloquer solo orígenes privados/locales (SSRF). Cualquier URL pública de imagen está permitida. */
function isAllowedOrigin(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return true;
    // Bloquear IPs privadas
    if (/^127\.|^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\.|^169\.254\.|^::1$|^fc00:/i.test(host)) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return true;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (!isAllowedOrigin(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/*" },
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
    }
    const contentType = res.headers.get("content-type") ?? "image/png";
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}

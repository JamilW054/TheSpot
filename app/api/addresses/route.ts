import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAddresses, createAddress } from "@/lib/db/addresses";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const addresses = await getAddresses();
    return NextResponse.json(addresses);
  } catch {
    return NextResponse.json({ error: "Error al obtener direcciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const address = await createAddress(body);
    return NextResponse.json(address, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al crear dirección";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

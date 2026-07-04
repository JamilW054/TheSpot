import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/database/repositories/addresses";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    if (body._action === "set_default") {
      await setDefaultAddress(id);
      return NextResponse.json({ ok: true });
    }

    const address = await updateAddress(id, body);
    return NextResponse.json(address);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al actualizar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteAddress(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al eliminar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

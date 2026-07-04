import { createClient } from "@/lib/supabase/server";

/** Perfil público del usuario (tabla `profiles`, 1:1 con auth.users). */
export interface Profile {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: number;
}

export interface ProfileInput {
  username?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}

interface ProfileRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: number;
}

const PROFILE_SELECT = "id, username, full_name, avatar_url, phone, role";

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    role: row.role,
  };
}

/** Perfil del usuario autenticado (null si no hay sesión). */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ProfileRow);
}

/** Actualiza el perfil del usuario autenticado. */
export async function updateProfile(input: ProfileInput): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.username !== undefined) {
    const u = input.username.trim();
    if (!u) throw new Error("El nombre de usuario es obligatorio.");
    patch.username = u;
  }
  if (input.fullName !== undefined)
    patch.full_name = input.fullName?.trim() || null;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl || null;
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select(PROFILE_SELECT)
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Ese nombre de usuario ya está en uso.");
    }
    throw new Error(error.message);
  }
  return mapRow(data as ProfileRow);
}

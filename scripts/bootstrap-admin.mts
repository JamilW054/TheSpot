#!/usr/bin/env node
/**
 * Crea (o actualiza contraseña de) un usuario admin en Supabase Auth y pone profiles.role = admin.
 * Requiere las migraciones de supabase/migrations/ aplicadas.
 *
 * Uso: pnpm bootstrap-admin (lee .env.local)
 * Variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_BOOTSTRAP_PASSWORD (≥1; Supabase puede exigir más en el Dashboard).
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.ADMIN_EMAIL?.trim() || "admin@jwparfum.local";
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
const displayName =
  process.env.ADMIN_DISPLAY_NAME?.trim() || email.split("@")[0] || "Admin";

if (!url || !serviceKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno (.env).",
  );
  process.exit(1);
}
if (!password || password.length < 1) {
  console.error("Define ADMIN_BOOTSTRAP_PASSWORD en .env.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName, name: displayName },
    },
  );

  let userId = created.user?.id;

  if (createErr) {
    const msg = createErr.message ?? "";
    const duplicate =
      msg.toLowerCase().includes("already registered") ||
      msg.toLowerCase().includes("already been registered") ||
      createErr.status === 422;
    if (!duplicate) {
      console.error(createErr);
      process.exit(1);
    }
    const { data: page, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) {
      console.error(listErr);
      process.exit(1);
    }
    const existing = page.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existing?.id) {
      console.error(
        "No se pudo resolver el usuario existente; revisa el email o listUsers.",
      );
      process.exit(1);
    }
    userId = existing.id;
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updErr) {
      console.error("No se pudo actualizar la contraseña:", updErr.message);
      process.exit(1);
    }
    console.log("Usuario ya existía; contraseña actualizada.");
  } else {
    console.log("Usuario administrador creado en Auth.");
  }

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: userId as string,
      username: email.split("@")[0],
      full_name: displayName,
      role: 0,
    },
    { onConflict: "id" },
  );

  if (upsertErr) {
    console.error(
      "No se pudo fijar profiles.role:",
      upsertErr.message,
      "\n→ Aplica las migraciones de supabase/migrations/ (pnpm db:push, o pnpm db:reset en local).",
      "\n→ Opcional en SQL Editor: NOTIFY pgrst, 'reload schema';",
    );
    process.exit(1);
  }

  // Marketplace: el admin es dueño de la tienda oficial (si aún no tiene dueño).
  const { error: storeErr } = await admin
    .from("stores")
    .update({ owner_id: userId })
    .eq("is_official", true)
    .is("owner_id", null);
  if (storeErr) {
    console.warn("No se pudo asignar la tienda oficial:", storeErr.message);
  }

  console.log("Listo:", email, "→ profiles.role = admin");
}

await main();

#!/usr/bin/env node
/**
 * SOLO DESARROLLO LOCAL: crea un admin de prueba (`qa-admin@jwparfum.local`)
 * con una contraseña aleatoria y la guarda en `.qa-admin.local` (ignorado por
 * git). Se niega a correr contra una URL que no sea localhost.
 *
 * Uso: node --env-file=.env.local --experimental-strip-types scripts/create-test-admin.mts
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) {
  console.error("Solo para Supabase local.");
  process.exit(1);
}
const email = "qa-admin@jwparfum.local";
const password = `qa-${randomBytes(9).toString("base64url")}`;
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
let id = list?.users.find((u) => u.email === email)?.id;
if (id) {
  await admin.auth.admin.updateUserById(id, { password });
} else {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error;
  id = data.user.id;
}
const { error } = await admin.from("profiles").upsert({ id, username: "qa-admin", full_name: "QA Admin", role: 0 }, { onConflict: "id" });
if (error) throw error;
writeFileSync(".qa-admin.local", `${email}\n${password}\n`);
console.log("Admin de prueba listo:", email, "(contraseña en .qa-admin.local)");

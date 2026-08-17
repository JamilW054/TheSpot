---
name: jw-parfum-setup
description: Conectar el proyecto JW a un proyecto Supabase real, aplicar las migraciones, cargar variables de entorno y generar/actualizar las credenciales del usuario administrador. Usar cuando el usuario pida "conectar Supabase", "crear las credenciales de admin", "aplicar migraciones" o "dejar listo el entorno".
---

# Setup de JW (Supabase + credenciales de admin)

Guía para dejar el proyecto corriendo contra un Supabase real, de cero. Este proyecto **no trae un Supabase ya vinculado** — cada vez que se ejecuta esta skill hay que confirmar si ya existe un proyecto o hay que crearlo.

## 1. Confirmar/crear el proyecto Supabase

Si el usuario no tiene proyecto: pedirle que vaya a [supabase.com](https://supabase.com), cree un proyecto nuevo (región cercana a República Dominicana, p.ej. `us-east-1`), y copie desde **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key (secreta, nunca exponer al cliente) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Variables de entorno

Copiar `.env.example` a `.env.local` en la raíz del repo y completar los valores de Supabase (paso 1), Resend y R2 (ver `.env.example` para el detalle de cada uno). No hace falta Docker para lo que sigue si el proyecto es remoto.

## 3. Aplicar migraciones

El esquema completo vive en `supabase/migrations/` (numeradas, source of truth único — ver `docs/00-refactor-status.md` para el detalle del schema). Dos formas de aplicarlo:

- **Con Supabase CLI** (recomendado): `pnpm supabase link --project-ref <ref-del-proyecto>` y luego `pnpm db:push`.
- **Sin CLI/Docker**: abrir el SQL Editor del dashboard de Supabase y pegar el contenido de cada archivo de `supabase/migrations/` en orden numérico.

Verificar que no haya errores antes de seguir — si una migración falla, no continuar con las siguientes hasta resolverlo.

(Opcional) `pnpm db:types:linked` regenera `src/database/types/database.types.ts` desde el proyecto ya vinculado.

## 4. Crear las credenciales de administrador

Con `.env.local` completo, definir además en el entorno (o temporalmente en `.env.local`):

```
ADMIN_EMAIL=<correo que el usuario quiera usar para entrar a /admin>
ADMIN_BOOTSTRAP_PASSWORD=<contraseña temporal segura, mínimo 8 caracteres>
```

Correr:

```
pnpm bootstrap-admin
```

Esto crea (o si ya existe, resetea la contraseña de) el usuario en Supabase Auth y fija `profiles.role = 0` (admin). El script es idempotente — se puede volver a correr para cambiar la contraseña más adelante.

**Entregar al usuario, en texto plano y una sola vez:** el correo y la contraseña usados, y recomendarle cambiarla después de su primer login en `/login`.

## 5. Verificación final

- `pnpm dev` y entrar a `/login` con las credenciales generadas → debe redirigir a `/admin`.
- Confirmar que `/admin/config` permite editar el correo de aviso de pedidos y el número de WhatsApp (ver skill `jw-parfum-pedidos`).
- Si Resend está en modo sandbox (sin dominio verificado), avisar al usuario que los correos de pedido solo llegarán a la cuenta dueña del API key hasta que verifique un dominio propio.

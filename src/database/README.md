# src/database — capa de datos

Toda lectura/escritura a la base de datos pasa por esta capa. Ningún
componente, página o API route debe llamar a Supabase directamente para
consultar tablas: importa una función de `@/database/repositories`.

```
src/database/
├── repositories/   # Acceso a datos (Supabase). Un módulo por agregado:
│                   #   products, orders, cart, coupons, payments, profiles…
│                   #   index.ts contiene además los repos de pedidos/pagos.
└── types/          # Tipos generados por la CLI de Supabase (database.types.ts).
```

## Clientes Supabase

Los clientes se inicializan en `@/lib/supabase`:

- `client.ts` — browser client (componentes cliente).
- `server.ts` — `createClient()` (cookies del usuario, respeta RLS) y
  `createServiceClient()` (service role, solo para operaciones de sistema
  como webhooks de pago).

## Migraciones

Las migraciones SQL viven en **`/supabase/migrations`** (raíz del repo), no
aquí: es la convención obligatoria de la CLI de Supabase (`supabase db push`,
`supabase migration new`). No las muevas a `src/`.

## Comandos (package.json)

| Script | Descripción |
|---|---|
| `pnpm db:start` / `pnpm db:stop` | Stack local de Supabase (requiere Docker). |
| `pnpm db:new <nombre>` | Crea una migración nueva en `supabase/migrations`. |
| `pnpm db:push` | Aplica migraciones al proyecto vinculado. |
| `pnpm db:reset` | Recrea la base local aplicando todas las migraciones. |
| `pnpm db:types` | Genera `src/database/types/database.types.ts` desde la base local. |
| `pnpm db:types:linked` | Igual, pero desde el proyecto vinculado (`supabase link`). |

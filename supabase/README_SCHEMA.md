# Buxxep — Database structure (PostgreSQL / Supabase)

Complete reference: tables, relations, triggers, functions, RLS, storage.

---

## 1. Tables and columns

| Table | Columns | Description |
|-------|---------|-------------|
| **base_models** | id, path (UNIQUE), name, created_at | Whitelist of 3D model paths |
| **profiles** | id (PK, FK → auth.users), name, created_at, updated_at | User profiles (id = auth.uid()) |
| **products** | id, slug (UNIQUE), name, description, price_cents, model_path (FK → base_models.path), cover_image_url, default_design_id (FK → designs), base_texture_id (FK → textures), created_at, updated_at | Catalog products |
| **textures** | id, source ('buxxep'\|'user'), url, product_id (FK → products), uploaded_by_user_id (FK → profiles), created_at | Base textures |
| **designs** | id, name, user_id (FK → profiles), source ('buxxep'\|'user'), model_path (FK → base_models), product_id (FK → products), garment_color_hex, base_texture_id (FK → textures), canvas_elements (JSONB), export_version, rendered_texture_url, created_at, updated_at | Saved designs; exportable as JSON/image |
| **cart_items** | id, user_id (FK → profiles), session_id, product_id (FK → products), design_id (FK → designs), quantity, created_at, updated_at | Cart lines (user or anonymous) |
| **orders** | id, user_id (FK → profiles), session_id, status, shipping_*, total_cents, created_at, updated_at | Order header |
| **order_items** | id, order_id (FK → orders), product_id (FK → products), design_id (FK → designs), quantity, unit_price_cents, texture_url, created_at | Order lines |

---

## 2. Entity-relationship (logical)

```
auth.users (Supabase)
    │
    └── profiles (id = auth.uid())
            │
            ├── textures.uploaded_by_user_id
            ├── designs.user_id
            ├── cart_items.user_id
            └── orders.user_id

base_models (path)
    │
    ├── products.model_path
    └── designs.model_path

products
    │
    ├── textures.product_id
    ├── designs.product_id  (optional)
    ├── products.default_design_id
    ├── products.base_texture_id
    ├── cart_items.product_id
    └── order_items.product_id

textures
    │
    ├── designs.base_texture_id
    └── products.base_texture_id

designs
    │
    ├── products.default_design_id
    ├── cart_items.design_id
    └── order_items.design_id

orders
    └── order_items.order_id
```

---

## 3. Constraints (business rules)

- **base_models.path**: UNIQUE; all `model_path` in products/designs must exist here.
- **products**: price_cents >= 0; model_path FK to base_models(path).
- **textures**: source IN ('buxxep', 'user').
- **designs**: source IN ('buxxep', 'user'); canvas_elements JSONB default '[]'.
- **cart_items**: (user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL).
- **orders**: status IN ('pending', 'paid', 'shipped', 'cancelled').

---

## 4. Indexes

- products: slug, model_path  
- textures: source, product_id  
- designs: user_id, product_id, source  
- cart_items: user_id, session_id  
- orders: user_id, status  
- order_items: order_id, product_id  

---

## 5. Triggers

| Trigger | Table | When | Action |
|---------|--------|------|--------|
| set_*_updated_at | profiles, products, designs, cart_items, orders | BEFORE UPDATE | Set updated_at = now() |
| on_auth_user_created | auth.users | AFTER INSERT | Insert row into profiles (id, name from meta) |
| after_order_items_change | order_items | AFTER INSERT/UPDATE/DELETE | Recompute orders.total_cents for affected order |

---

## 6. Functions (procedures)

| Function | Purpose |
|----------|--------|
| **set_updated_at()** | Trigger function: set NEW.updated_at = now(). |
| **handle_new_user()** | Trigger function: create profile on auth.users INSERT. |
| **recompute_order_total(p_order_id uuid)** | Recalculates orders.total_cents from order_items. |
| **trigger_recompute_order_total()** | Trigger function for order_items; calls recompute_order_total. |
| **migrate_cart_session_to_user(p_session_id, p_user_id)** | Moves cart_items from session_id to user_id (call after login). Returns number of rows updated. |
| **validate_model_path(p_path text)** | Returns true if path exists in base_models. |

---

## 7. Row Level Security (RLS)

All tables have RLS enabled.

| Table | Policies (summary) |
|-------|--------------------|
| base_models | SELECT all |
| profiles | SELECT/UPDATE own (auth.uid() = id) |
| products | SELECT all |
| textures | SELECT all; INSERT/UPDATE/DELETE own when source = 'user' and uploaded_by_user_id = auth.uid() |
| designs | SELECT buxxep or own; INSERT user/buxxep; UPDATE/DELETE own (source = 'user') |
| cart_items | SELECT/INSERT/UPDATE/DELETE own (user_id = auth.uid() or session_id set) |
| orders | SELECT/UPDATE own; INSERT allowed |
| order_items | SELECT via order ownership; INSERT allowed |

Note: Anonymous cart by `session_id` is allowed; for strict per-session isolation you may need to filter by session in app (e.g. pass session_id and filter in API).

---

## 8. Storage (Supabase)

Create two buckets (Dashboard or API):

| Bucket | Public | Use | Suggested limit |
|--------|--------|-----|------------------|
| **textures** | Yes (or signed URLs) | User/Buxxep base texture images | 5 MB, image/* |
| **rendered** | No | Rendered design texture (1024×1024) for orders | 2 MB, image/png |

Policies (see `00002_storage_buckets_and_policies.sql`):

- **textures**: SELECT all; INSERT/UPDATE/DELETE for authenticated (and optionally restrict by owner/folder).
- **rendered**: SELECT/INSERT for authenticated only.

Store URLs in `textures.url`, `designs.rendered_texture_url`, `order_items.texture_url`.

---

## 9. Migration order

1. `00001_buxxep_full_schema.sql` — tables, FKs, indexes, triggers, functions, RLS, seed base_models, grants.
2. Create buckets **textures** and **rendered** in Supabase Dashboard (Storage).
3. `00002_storage_buckets_and_policies.sql` — RLS policies on `storage.objects`.

Apply with Supabase CLI: `supabase db push` or run each file in SQL Editor.

# Diseño de base de datos — Buxxep

Este documento define el esquema de base de datos para soportar: **exportación de diseños** (textura como imagen y JSON), catálogo de productos, carrito, pedidos y clasificación de texturas (Buxxep vs usuario). Está alineado con [analisis-modelo-texturas-y-catalogo.md](./analisis-modelo-texturas-y-catalogo.md).

---

## 1. Resumen de entidades

| Entidad | Propósito |
|--------|-----------|
| **base_models** | Lista blanca de rutas de modelos 3D (geometría); todo `model_path` del sistema debe estar aquí. |
| **users** | Usuarios (auth); opcional para carrito anónimo. |
| **products** | Productos del catálogo (ropa) con `model_path` de la lista blanca. |
| **textures** | Texturas base: Buxxep (oficiales) o usuario (subidas); clasificación por `source`. |
| **designs** | Diseños guardados: elementos de canvas (JSON), modelo, color, textura base; exportables como JSON e imagen. |
| **cart_items** | Ítems del carrito (producto + cantidad + diseño opcional); por usuario o por sesión anónima. |
| **orders** | Pedidos confirmados. |
| **order_items** | Líneas del pedido: producto, cantidad, diseño/textura asociada, precio. |

---

## 2. Tablas

### 2.1 `base_models`

Lista blanca de modelos 3D. La geometría **siempre** se carga desde rutas controladas (código o CDN); no se permiten modelos subidos por usuarios.

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Identificador interno. |
| `path` | TEXT | UNIQUE, NOT NULL | Ruta del modelo (ej. `/models/tshirt/scene.gltf`). |
| `name` | TEXT | NOT NULL | Nombre para UI (ej. "Camiseta básica"). |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Alta del registro. |

- Cualquier `model_path` usado en `products`, `designs` o en el editor debe existir en `base_models.path` (o validarse contra esta tabla).

---

### 2.2 `users`

Usuarios registrados (auth). El carrito puede ser anónimo (solo `session_id`) o asociado a `user_id`.

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id del usuario. |
| `email` | TEXT | UNIQUE, NOT NULL | Email (login). |
| `name` | TEXT | | Nombre para mostrar. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Registro. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última actualización. |

- Auth (contraseñas, OAuth) se gestiona con el proveedor que uses (Supabase Auth, NextAuth, etc.); esta tabla puede ser la que rellene tu provider o una tabla de perfil ligada al `id` del provider.

---

### 2.3 `products`

Productos del catálogo: ropa a la venta con modelo 3D y opcional textura base Buxxep.

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id del producto. |
| `slug` | TEXT | UNIQUE, NOT NULL | Slug para URL (ej. `camiseta-basica`). |
| `name` | TEXT | NOT NULL | Nombre del producto. |
| `description` | TEXT | | Descripción. |
| `price_cents` | INTEGER | NOT NULL, >= 0 | Precio en céntimos. |
| `model_path` | TEXT | NOT NULL, FK → base_models.path | Ruta del modelo 3D (lista blanca). |
| `cover_image_url` | TEXT | | URL de la imagen de portada. |
| `default_design_id` | UUID | FK → designs.id, NULL | Diseño plantilla Buxxep (opcional). |
| `base_texture_id` | UUID | FK → textures.id, NULL | Textura base Buxxep por defecto (opcional). |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Alta. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última actualización. |

- **Solo** se permiten `model_path` que existan en `base_models`.
- `default_design_id` y `base_texture_id` son opcionales; si no hay imagen subida por el usuario, se usa la base del producto o fondo blanco (según el análisis).

---

### 2.4 `textures`

Texturas base: oficiales (Buxxep) o subidas por usuario. Clasificación para la lógica de capas (base Buxxep vs base usuario).

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id de la textura. |
| `source` | TEXT | NOT NULL, CHECK (source IN ('buxxep','user')) | Origen: Buxxep o usuario. |
| `url` | TEXT | NOT NULL | URL del asset (Storage/CDN). |
| `product_id` | UUID | FK → products.id, NULL | Si es textura Buxxep asociada a un producto. |
| `uploaded_by_user_id` | UUID | FK → users.id, NULL | Si source = 'user', quien la subió. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Alta. |

- **Buxxep:** `source = 'buxxep'`, `url` apunta a recurso oficial; opcionalmente `product_id`.
- **Usuario:** `source = 'user'`, `uploaded_by_user_id` y `url` (ej. Supabase Storage) para la imagen subida en el editor.

---

### 2.5 `designs`

Diseños guardados: todo lo necesario para reproducir el diseño y para exportar como **JSON** o para generar la **textura (imagen)**. Compatible con `DesignExportPayload` del front.

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id del diseño. |
| `name` | TEXT | NOT NULL | Nombre del diseño/proyecto. |
| `user_id` | UUID | FK → users.id, NULL | Dueño (NULL = plantilla Buxxep o anónimo). |
| `source` | TEXT | NOT NULL, CHECK (source IN ('buxxep','user')) | Buxxep = plantilla; user = diseño de usuario. |
| `model_path` | TEXT | FK → base_models.path, NULL | Modelo 3D usado (lista blanca). |
| `product_id` | UUID | FK → products.id, NULL | Producto del catálogo si se creó desde uno. |
| `garment_color_hex` | TEXT | | Color base de la prenda (hex). |
| `base_texture_id` | UUID | FK → textures.id, NULL | Textura base (Buxxep o usuario) bajo los elementos. |
| `canvas_elements` | JSONB | NOT NULL, default '[]' | Array de elementos (text, shape, image, path); mismo formato que el editor. |
| `export_version` | TEXT | | Versión del esquema de export (ej. "1.0") para futuras migraciones. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creación. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última modificación. |

- **Exportación JSON:** se puede construir un JSON tipo `DesignExportPayload` a partir de estas columnas (`name`, `modelPath` ← `model_path`, `productId` ← `product_id`, `garmentColorHex`, `baseTextureUrl` desde `textures.url` si hay `base_texture_id`, `canvasElements` ← `canvas_elements`).
- **Exportación imagen:** la textura final (1024×1024) se genera en el cliente con `renderElementsToTextureUrl(...)`; opcionalmente se puede guardar en Storage y guardar la URL en una columna `rendered_texture_url` (o en `order_items` al confirmar pedido) para no recalcular.

Opcional para producción/almacén:

| Columna | Tipo | Descripción |
|--------|------|-------------|
| `rendered_texture_url` | TEXT | URL de la textura ya renderizada (imagen 1024×1024) si se persiste en Storage. |

---

### 2.6 `cart_items`

Ítems del carrito. Soporta usuario identificado o carrito anónimo (por sesión).

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id del ítem. |
| `user_id` | UUID | FK → users.id, NULL | Usuario (NULL si carrito anónimo). |
| `session_id` | TEXT | NULL | Sesión anónima (cookie/localStorage); solo usado si user_id IS NULL. |
| `product_id` | UUID | FK → products.id, NOT NULL | Producto. |
| `design_id` | UUID | FK → designs.id, NULL | Diseño personalizado (si "personalizar antes de añadir"). |
| `quantity` | INTEGER | NOT NULL, >= 1 | Cantidad. |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Alta. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última actualización. |

- Restricción de negocio: al menos uno de `user_id` o `session_id` debe estar rellenado; si hay `user_id`, se puede ignorar `session_id` para ese ítem.
- Al hacer login, se puede migrar ítems de `session_id` a `user_id`.

---

### 2.7 `orders`

Cabecera del pedido.

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id del pedido. |
| `user_id` | UUID | FK → users.id, NULL | Usuario (NULL si checkout invitado). |
| `session_id` | TEXT | NULL | Sesión anónima si no hay user_id. |
| `status` | TEXT | NOT NULL, CHECK (status IN ('pending','paid','shipped','cancelled')) | Estado del pedido. |
| `shipping_name` | TEXT | | Nombre para envío. |
| `shipping_address` | TEXT | | Dirección. |
| `shipping_email` | TEXT | | Email de contacto. |
| `total_cents` | INTEGER | NOT NULL | Total en céntimos (coherente con la suma de order_items). |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Fecha del pedido. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última actualización. |

---

### 2.8 `order_items`

Líneas del pedido: producto, cantidad, diseño (y opcionalmente URL de textura renderizada para producción).

| Columna | Tipo | Restricciones | Descripción |
|--------|------|----------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Id de la línea. |
| `order_id` | UUID | FK → orders.id, NOT NULL | Pedido. |
| `product_id` | UUID | FK → products.id, NOT NULL | Producto. |
| `design_id` | UUID | FK → designs.id, NULL | Diseño personalizado (si aplica). |
| `quantity` | INTEGER | NOT NULL, >= 1 | Cantidad. |
| `unit_price_cents` | INTEGER | NOT NULL | Precio unitario en céntimos (snapshot). |
| `texture_url` | TEXT | NULL | URL de la textura final para fabricación (si se guardó en Storage al confirmar). |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Alta. |

- Si `design_id` no es NULL, la textura se puede generar desde `designs.canvas_elements` + base texture, o guardarse ya renderizada en Storage y guardar la URL en `texture_url` para el almacén/producción.

---

## 3. Relación con la exportación (textura + JSON)

- **Exportar como imagen (textura):**  
  El cliente ya tiene la lógica (`getEffectiveTextureBlob`, "Solo imagen", "Exportar ZIP"). La textura se genera con el modelo base y la zona UV desde código. Para **persistir** esa imagen en el backend: subir el blob a Storage (ej. Supabase), guardar la URL en `designs.rendered_texture_url` o en `order_items.texture_url` al confirmar el pedido.

- **Exportar como JSON:**  
  El payload coincide con lo que se guarda en `designs`: `name`, `modelPath`, `productId`, `garmentColorHex`, `baseTextureUrl` (desde `textures.url`), `canvasElements`. Tanto la descarga desde el editor como el guardado en BD pueden usar el mismo formato; al "importar" un JSON se puede crear o actualizar un `designs` y opcionalmente subir la textura generada.

Con este diseño, lo que se crea en el editor es **exportable** como textura (imagen) y como JSON, y la base de datos soporta guardar diseños, asociarlos a productos y a pedidos, y clasificar texturas (Buxxep vs usuario) para la lógica de capas descrita en el análisis.

---

## 4. Índices sugeridos

- `products(slug)`, `products(model_path)` (ya cubierto si hay FK a base_models).
- `designs(user_id)`, `designs(product_id)`, `designs(source)`.
- `cart_items(user_id)`, `cart_items(session_id)`.
- `order_items(order_id)`, `order_items(product_id)`.
- `textures(source)`, `textures(product_id)`.

---

## 5. Checklist de implementación

- [ ] Crear tablas en el orden: `base_models` → `users` → `textures` → `products` → `designs` → `cart_items` → `orders` → `order_items`.
- [ ] Rellenar `base_models` con las rutas actuales (ej. `/models/tshirt/scene.gltf`).
- [ ] Validar en API que todo `model_path` usado en productos y diseños esté en `base_models`.
- [ ] En el editor: botón "Exportar JSON" ya conectado; opcionalmente endpoint "Guardar diseño" que inserte/actualice `designs` y suba la textura a Storage.
- [ ] Checkout: al confirmar, crear `orders` + `order_items`; si hay `design_id`, opcionalmente generar y subir textura y guardar URL en `order_items.texture_url`.

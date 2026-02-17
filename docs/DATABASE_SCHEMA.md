# Esquema de base de datos – Proyecto  Buxxep

## 1. **users** (usuarios / auth)

| Atributo   | Tipo        | Restricción | Descripción              |
|-----------|-------------|-------------|---------------------------|
| id        | uuid        | PK, default gen_random_uuid() | Id único                  |
| email     | text        | UNIQUE NOT NULL | Email (login)             |
| password_hash | text     |             | Hash de contraseña        |
| name      | text        |             | Nombre para mostrar       |
| role      | text        | CHECK IN ('client','admin') | Rol                       |
| avatar_url | text       |             | URL foto perfil           |
| created_at | timestamptz | default now() | Alta                     |
| updated_at | timestamptz | default now() | Última actualización     |

---

## 2. **designs** (diseños)

| Atributo    | Tipo         | Restricción | Descripción                    |
|------------|--------------|-------------|--------------------------------|
| id         | uuid         | PK          | Id único                       |
| user_id    | uuid         | FK → users  | Dueño del diseño               |
| slug       | text         | UNIQUE NOT NULL | Slug URL (ej. camiseta-verano-d01) |
| name       | text         | NOT NULL    | Nombre del diseño              |
| description| text         |             | Descripción                    |
| cover_image| text         |             | URL imagen portada             |
| updated_at | timestamptz  | default now() | Última modificación          |
| created_at | timestamptz  | default now() | Creación                     |

---

## 3. **design_canvas_elements** (elementos del canvas por diseño)

Puede ser **tabla relacional** o **JSONB** en `designs`. Opción tabla:

| Atributo | Tipo   | Restricción | Descripción          |
|----------|--------|-------------|----------------------|
| id       | uuid   | PK          | Id del elemento      |
| design_id| uuid   | FK → designs| Diseño al que pertenece |
| type     | text   | CHECK IN ('text','image','shape') | Tipo |
| x        | int    | NOT NULL    | Posición X (lógico)  |
| y        | int    | NOT NULL    | Posición Y           |
| width    | int    | NOT NULL    | Ancho                |
| height   | int    | NOT NULL    | Alto                 |
| content  | text   |             | Texto, URL imagen o 'rect'/'circle' |
| visible  | boolean| default true| Si se dibuja         |
| sort_order | int   |             | Orden en capas       |

**Alternativa:** columna `designs.canvas_elements JSONB` con array de objetos con esos campos.

---

## 4. **design_gallery** (galería de imágenes del diseño)

| Atributo  | Tipo | Restricción | Descripción     |
|-----------|------|-------------|-----------------|
| id        | uuid | PK          | Id              |
| design_id | uuid | FK → designs | Diseño         |
| image_url | text | NOT NULL    | URL imagen      |
| sort_order| int  |             | Orden           |

---

## 5. **lineas** (líneas de producto / colecciones)

| Atributo    | Tipo        | Restricción | Descripción        |
|------------|-------------|-------------|--------------------|
| id         | uuid        | PK          | Id único           |
| slug       | text        | UNIQUE NOT NULL | Slug URL        |
| name       | text        | NOT NULL    | Nombre línea       |
| description| text        |             | Descripción        |
| cover_image| text        |             | Imagen portada     |
| published  | boolean     | default false | Visible en web   |
| items      | int         | default 0   | Nº productos (o derivado) |
| created_at | timestamptz | default now() |                  |
| updated_at | timestamptz | default now() |                  |

---

## 6. **linea_gallery** (galería de la línea)

| Atributo   | Tipo | Restricción | Descripción  |
|------------|------|-------------|--------------|
| id         | uuid | PK          |              |
| linea_id   | uuid | FK → lineas |              |
| image_url  | text | NOT NULL    |              |
| sort_order | int  |             |              |

---

## 7. **products** (productos de una línea)

| Atributo   | Tipo        | Restricción | Descripción     |
|------------|-------------|-------------|-----------------|
| id         | uuid        | PK          | Id único        |
| linea_id   | uuid        | FK → lineas | Línea           |
| name       | text        | NOT NULL    | Nombre producto |
| slug       | text        |             | Slug            |
| description| text        |             |                 |
| price      | decimal(10,2) |           | Precio          |
| image_url  | text        |             | Imagen          |
| sort_order | int         |             | Orden en línea  |

---

## 8. **mockups** (prendas / plantillas 3D o 2D)

| Atributo   | Tipo   | Restricción | Descripción                    |
|------------|--------|-------------|--------------------------------|
| id         | uuid   | PK          | Id único                       |
| name       | text   | NOT NULL    | Ej. "Camiseta hombre", "Hoodie" |
| category   | text   | CHECK IN ('2d','3d') | Tipo de preview          |
| image_url  | text   |             | URL preview (miniatura)        |
| model_path | text   |             | Ruta GLB, ej. /models/hoodie.glb |
| sort_order | int   |             | Orden en listado               |

---

## 9. **orders** / **pedidos**

| Atributo    | Tipo         | Restricción | Descripción        |
|-------------|--------------|-------------|--------------------|
| id         | uuid         | PK          | Id único (ej. PED-001) |
| user_id    | uuid         | FK → users  | Cliente            |
| cliente    | text         |             | Nombre cliente (o de users) |
| estado     | text         | CHECK IN ('pendiente','en_proceso','completado','cancelado') | Estado |
| total      | decimal(10,2)| NOT NULL    | Total pedido       |
| items_count| int          |             | Nº ítems           |
| notes      | text         |             | Notas internas     |
| created_at | timestamptz  | default now() | Fecha pedido     |
| updated_at | timestamptz  | default now() |                    |

---

## 10. **order_items** (líneas del pedido)

| Atributo    | Tipo         | Restricción | Descripción        |
|-------------|--------------|-------------|--------------------|
| id          | uuid         | PK          | Id ítem            |
| order_id    | uuid         | FK → orders | Pedido             |
| product_id  | uuid         | FK → products (opcional) | Producto |
| design_id   | uuid         | FK → designs (opcional) | Diseño aplicado |
| mockup_id   | uuid         | FK → mockups (opcional) | Prenda elegida |
| quantity    | int          | default 1  | Cantidad           |
| unit_price  | decimal(10,2)| NOT NULL    | Precio unitario    |
| subtotal    | decimal(10,2)| NOT NULL    | quantity * unit_price |
| metadata    | jsonb        |             | Talla, color, texto personalizado, etc. |

---

## 11. **textures** / **assets** (texturas o assets por usuario/proyecto)

Para guardar “textura base” o imágenes subidas por diseño (hoy en IndexedDB).

| Atributo   | Tipo        | Restricción | Descripción          |
|------------|-------------|-------------|----------------------|
| id         | uuid        | PK          | Id único             |
| user_id    | uuid        | FK → users  | Dueño                |
| design_id  | uuid        | FK → designs (opcional) | Diseño asociado |
| key        | text        | NOT NULL    | Ej. textura_proyecto.png |
| mime_type  | text        |             | image/png, etc.      |
| blob_url   | text        |             | URL en storage (Supabase Storage) |
| created_at | timestamptz | default now() |                    |

---

## 12. **sessions** (opcional, si no usas solo JWT)

| Atributo   | Tipo        | Restricción | Descripción  |
|------------|-------------|-------------|--------------|
| id         | uuid        | PK          |              |
| user_id    | uuid        | FK → users  |              |
| token      | text        | UNIQUE      | Token sesión |
| expires_at | timestamptz | NOT NULL    | Expiración   |

---

## Resumen de tablas

| # | Tabla                   | Uso principal                          |
|---|-------------------------|----------------------------------------|
| 1 | users                   | Auth, clientes y admins                |
| 2 | designs                 | Diseños del usuario                    |
| 3 | design_canvas_elements  | Texto, imagen, forma por diseño        |
| 4 | design_gallery          | Galería de fotos del diseño            |
| 5 | lineas                  | Colecciones / líneas de producto       |
| 6 | linea_gallery           | Fotos de la línea                      |
| 7 | products                | Productos dentro de una línea          |
| 8 | mockups                 | Prendas (3D/2D) para el editor         |
| 9 | orders                  | Pedidos (cabecera)                     |
|10 | order_items             | Líneas de cada pedido                  |
|11 | textures                | Texturas/imágenes subidas por diseño   |
|12 | sessions                | Sesiones (opcional)                    |

---

## Relaciones clave

- **users** 1 → N **designs**
- **designs** 1 → N **design_canvas_elements** (o JSONB en designs)
- **designs** 1 → N **design_gallery**
- **lineas** 1 → N **products**
- **lineas** 1 → N **linea_gallery**
- **users** 1 → N **orders**
- **orders** 1 → N **order_items** → **products**, **designs**, **mockups**
- **users** 1 → N **textures** (opcionalmente ligadas a **designs**)



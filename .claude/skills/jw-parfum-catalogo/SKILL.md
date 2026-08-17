---
name: jw-parfum-catalogo
description: Dar de alta, editar o entender cómo se estructura un perfume en el catálogo de JW PARFUM (marca, categoría, precio, tamaños en ml, stock, imágenes). Usar cuando el usuario pida "sube este perfume", "cómo agrego un producto", "cambia el precio/stock de X" o pregunte cómo funciona el catálogo.
---

# Catálogo de JW PARFUM

Cómo está modelado un perfume y dónde tocar cada cosa.

## Modelo de datos (resumen — ver `docs/00-refactor-status.md` para el schema completo)

Un perfume es una fila en `products` (nombre, slug, descripción, `brand_id`, `category_id`, precio base, costo, activo/inactivo) más:

- **`product_media`** — fotos del producto (una marcada como portada `is_cover`).
- **`product_variants`** — una fila por tamaño vendible (30ml/50ml/100ml…), cada una con su propio precio (`price_cents`) y SKU. Los tamaños salen de un `size_preset` reutilizable (`kind='size'`) creado una vez y reusado por varios productos.
- **`inventory`** — cantidad disponible por variante (un solo almacén fijo, no hay que elegir bodega).
- **`tags`** — etiquetas libres (ej. "amaderado", "cítrico", "para regalo") vía `product_tags`.

Si un producto no tiene variantes, se considera stock no rastreado (siempre "disponible") — para perfumes normalmente sí se quiere trackear stock por tamaño, así que casi todo producto debería tener al menos una variante.

## Dónde se administra (UI)

| Qué | Ruta admin |
|---|---|
| Perfumes (crear/editar/desactivar) | `/admin/catalogo`, `/admin/catalogo/nuevo`, `/admin/catalogo/[slug]/editar` |
| Marcas | `/admin/marcas` |
| Categorías (con subcategoría opcional vía categoría padre) | `/admin/categorias` |
| Tamaños (presets ml reutilizables) | ver el selector de tamaños dentro del formulario de producto — el preset se crea una vez y se reutiliza |
| Cupones | `/admin/cupones` |

El formulario de producto vive en `src/features/admin/product-form.tsx`; la lógica de guardado (crear producto, subir imágenes a R2, sincronizar variantes/inventario) está en `src/lib/actions/products-admin.ts` (`adminCreateProduct`, `adminUpdateProduct`).

## Pasos típicos para dar de alta un perfume nuevo

1. Si la marca no existe, crearla primero en `/admin/marcas`.
2. Si la categoría no existe (ej. "Para Hombre", "Para Mujer", "Unisex", "Nicho"), crearla en `/admin/categorias`.
3. En `/admin/catalogo/nuevo`: nombre, marca, categoría, descripción, precio base, costo (opcional, para margen), imágenes.
4. Activar tamaños (ml) y definir precio + stock por cada tamaño vendible.
5. Guardar — el producto queda `is_active` y visible en `/catalogo` públicamente.

## Notas para cambios por código (no solo UI)

- Las imágenes se suben a Cloudflare R2 vía `src/lib/storage/upload-image-service.ts` — requiere las variables `R2_*` en `.env.local` (ver skill `jw-parfum-setup`).
- Precios siempre en centavos (`_cents`) en la base de datos; convertir a pesos solo en la UI.
- Al desactivar un producto (`is_active=false`) sigue existiendo para pedidos históricos pero desaparece del catálogo público.

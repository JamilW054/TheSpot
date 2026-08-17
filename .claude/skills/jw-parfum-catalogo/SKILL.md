---
name: jw-parfum-catalogo
description: Dar de alta, editar o entender cómo se estructura un producto en el catálogo de JW (marca, categoría, precio, talla/tamaño, stock, imágenes). Usar cuando el usuario pida "sube este producto", "cómo agrego un producto", "cambia el precio/stock de X" o pregunte cómo funciona el catálogo.
---

# Catálogo de JW

Cómo está modelado un producto y dónde tocar cada cosa.

## Modelo de datos

Un producto es una fila en `products` (nombre, slug, descripción, `brand_id`, `category_id`, precio base, costo, activo/inactivo) más:

- **`product_media`** — fotos (una marcada como portada `is_cover`).
- **`product_variants`** — una fila por talla/tamaño/color vendible. Ejemplos: 50ml/100ml (perfumes), 40–44 (tenis), Unitalla + color (gorras). Los valores salen de un `size_preset` reutilizable (`kind='size'` o `kind='color'`).
- **`inventory`** — cantidad disponible por variante (un solo almacén fijo).
- **`tags`** — etiquetas libres vía `product_tags`.

Si un producto no tiene variantes, se considera stock no rastreado (siempre "disponible"). Casi todo producto debería tener al menos una variante.

Categorías de la tienda: Belleza, Relojes, Perfumes, Gorras, Tenis.

## Dónde se administra (UI)

| Qué | Ruta admin |
|---|---|
| Productos (crear/editar/desactivar) | `/admin/catalogo`, `/admin/catalogo/nuevo`, `/admin/catalogo/[slug]/editar` |
| Marcas | `/admin/marcas` |
| Categorías (con subcategoría opcional vía categoría padre) | `/admin/categorias` |
| Tallas y tamaños | `/admin/tamanos` y el selector dentro del formulario de producto |
| Cupones | `/admin/cupones` |

El formulario de producto vive en `src/features/admin/product-form.tsx`; la lógica de guardado (crear producto, subir imágenes a R2, sincronizar variantes/inventario) está en `src/lib/actions/products-admin.ts` (`adminCreateProduct`, `adminUpdateProduct`).

## Pasos típicos para dar de alta un producto

1. Si la marca no existe, crearla primero en `/admin/marcas`.
2. Si la categoría no existe (Belleza, Relojes, Perfumes, Gorras, Tenis), crearla en `/admin/categorias` y asignarle el preset de talla/tamaño.
3. En `/admin/catalogo/nuevo`: nombre, marca, categoría, descripción, precio base, costo (opcional), imágenes.
4. Activar talla o tamaño (y color si aplica) y definir stock por cada variante.
5. Guardar — el producto queda `is_active` y visible en `/catalogo` públicamente.

## Notas para cambios por código (no solo UI)

- Las imágenes se suben a Cloudflare R2 vía `src/lib/storage/upload-image-service.ts` — requiere las variables `R2_*` en `.env.local` (ver skill `jw-parfum-setup`).
- Precios siempre en centavos (`_cents`) en la base de datos; convertir a pesos solo en la UI.
- Al desactivar un producto (`is_active=false`) sigue existiendo para pedidos históricos pero desaparece del catálogo público.

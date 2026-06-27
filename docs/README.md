# Documentación Buxxep

Buxxep es una **tienda de ropa + plataforma de diseño**: los clientes compran ropa y siguen sus pedidos; el equipo Buxxep gestiona todo el negocio (catálogo, pedidos, pagos, marketing y logística) desde un panel de administración y crea contenido con un editor de diseños tipo Canva.

Esta carpeta documenta **toda la web**, dividida por audiencia.

---

## Índice

| Documento | Qué cubre |
|-----------|-----------|
| **[01 — Visión general](./01-vision-general.md)** | Qué es Buxxep, stack, arquitectura de carpetas, mapa completo de rutas, variables de entorno y puesta en marcha. *Empieza aquí.* |
| **[02 — Lo que hace el usuario](./02-usuario.md)** | Funcionalidades del cliente: catálogo, ficha de producto, carrito, checkout, pagos, cuenta (pedidos, direcciones, wishlist, cupones, reseñas, sorteo), eliminar cuenta. |
| **[03 — Lo que hace el admin](./03-admin.md)** | Panel `/admin`: dashboard, pedidos, facturas, pagos, catálogo, categorías/marcas/tallas, líneas, marketing (banners, cupones, flash sales, notificaciones), logística (envíos, almacenes), reportes, configuración y el editor de diseños. |
| **[04 — Sistemas en conjunto](./04-sistemas-compartidos.md)** | Lo transversal: autenticación y roles, base de datos (Supabase + RLS), pagos (AZUL), correos (Resend), almacenamiento (R2/Supabase Storage), capa de datos `lib/db`, server actions y el editor de diseños. |

### Documentos de referencia ya existentes

| Documento | Descripción |
|-----------|-------------|
| [database-design.md](./database-design.md) | Diseño conceptual de la base de datos (exportación de diseños, texturas, catálogo, pedidos). |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Esquema de tablas (algunas partes preceden a migraciones recientes; ver `supabase/migrations/`). |
| [analisis-modelo-texturas-y-catalogo.md](./analisis-modelo-texturas-y-catalogo.md) | Análisis del modelo de texturas (Buxxep vs usuario) y catálogo. |
| [PROMPT_REACT_NATIVE_PAGOS.md](./PROMPT_REACT_NATIVE_PAGOS.md) | Prompt/guía para el módulo de pagos en la app móvil React Native. |
| [PROMPT_REACT_NATIVE_NOTIFICATIONS.md](./PROMPT_REACT_NATIVE_NOTIFICATIONS.md) | Prompt/guía para notificaciones en la app móvil React Native. |

> **Fuente de verdad:** el código manda. Si esta documentación y el código discrepan, gana el código (`app/`, `lib/`, `supabase/migrations/`). Estos documentos describen el estado a fecha de su última actualización.
</content>
</invoke>

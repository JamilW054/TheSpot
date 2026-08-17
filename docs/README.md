# Documentación JW PARFUM

JW PARFUM es una **perfumería en línea**: los clientes compran perfumes como
invitados (sin cuenta) y el equipo gestiona el catálogo y los pedidos desde
un panel de administración. No hay pagos en línea — cada pedido se confirma
por WhatsApp — y no hay editor de diseño ni app móvil.

## Índice

| Documento | Qué cubre |
|-----------|-----------|
| **[../CLAUDE.md](../CLAUDE.md)** | Punto de entrada: qué es JW PARFUM, stack, estructura de carpetas, rutas principales, comandos. *Empieza aquí.* |
| **[00 — Estado del refactor](./00-refactor-status.md)** | Historial y estado del refactor desde el proyecto original ("Buxxep", una tienda de ropa) — qué se eliminó a propósito y por qué, para no reintroducirlo por error. |
| **[../README.md](../README.md)** | Instalación, scripts, estructura del proyecto. |

## Skills operativas

Ver `.claude/skills/`:

- **jw-parfum-setup** — conectar Supabase, aplicar migraciones, generar credenciales de admin.
- **jw-parfum-catalogo** — dar de alta un perfume (marca, categoría, precio, tamaños en ml, stock, imágenes).
- **jw-parfum-pedidos** — flujo pedido → correo → WhatsApp, y cómo probarlo.

> **Fuente de verdad:** el código manda. Si esta documentación y el código
> discrepan, gana el código (`src/`, `supabase/migrations/`).

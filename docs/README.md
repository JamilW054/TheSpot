# Documentación JW

JW es una tienda en línea de **belleza, relojes, perfumes, gorras y tenis**.
Los clientes compran como invitados (sin cuenta) y el equipo gestiona el
catálogo y los pedidos desde un panel de administración. No hay pagos en
línea: cada pedido se confirma por WhatsApp.

## Índice

| Documento | Qué cubre |
|-----------|-----------|
| **[../CLAUDE.md](../CLAUDE.md)** | Punto de entrada: stack, estructura, rutas, comandos. *Empieza aquí.* |
| **[00 — Estado del proyecto](./00-refactor-status.md)** | Decisiones de alcance y qué no reintroducir. |
| **[../README.md](../README.md)** | Instalación, scripts, estructura del proyecto. |

## Skills operativas

Ver `.claude/skills/`:

- **jw-parfum-setup** — conectar Supabase, aplicar migraciones, generar credenciales de admin.
- **jw-parfum-catalogo** — dar de alta un producto (marca, categoría, precio, talla/tamaño, stock, imágenes).
- **jw-parfum-pedidos** — flujo pedido → correo → WhatsApp, y cómo probarlo.

> **Fuente de verdad:** el código manda. Si esta documentación y el código
> discrepan, gana el código (`src/`, `supabase/migrations/`).

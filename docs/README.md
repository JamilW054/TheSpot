# Buxxep — Documentación

Punto de entrada a la visión, estructura técnica y planificación del proyecto.

---

## 1. Visión (resumen)

- **Buxxep** es una tienda de ropa y una plataforma de diseño: los clientes pueden comprar ropa Buxxep o encargar diseños personalizados; solo Buxxep vende.
- **Público sin sesión:** landing, login, registro; CTAs «Comprar en Buxxep» y «Mandar mi diseño».
- **Usuario autenticado:** Mis diseños, Editor (tipo Canva: drag & drop, capas, mockups 2D/3D), Líneas de ropa; creadores pueden publicar líneas.
- **Admin Buxxep:** pedidos (pendientes, en proceso, completados), configuración de tienda/producción/logística, acciones en lote.

Documento completo: [VISION-APLICACION.txt](../VISION-APLICACION.txt) (en la raíz del repo).

---

## 2. Estructura técnica

- **`app/`** — Next.js App Router  
  - `(public)/` — landing, login, registro  
  - `(app)/` — zona autenticada: mis-disenos, editor, lineas, guia, recursos, soporte  
  - `admin/` — dashboard, pedidos, config  
- **`components/`** — presentación  
  - `ui/` — Button, Card, Input, etc.  
  - `layout/` — PublicNavbar, AppSidebar, AppShell, Navbar, PageLayout  
  - `editor/` — canvas-editor, sidebar, properties-panel, mockup-panel, right-panel  
- **`features/`** — dominio: admin, designs, lineas  
- **`config/`** — mock-data, navigation, editor-tools  
- **`lib/`** — tokens, utils, cliente Supabase  
- **`types/`** — tipos TypeScript compartidos  
- **`hooks/`** — hooks reutilizables  

---

## 3. Índice y referencias

| Documento | Descripción |
|-----------|-------------|
| [VISION-APLICACION.txt](../VISION-APLICACION.txt) | Visión y lógica de la aplicación |
| [docs/BACKLOG.md](BACKLOG.md) | Backlog y planificación (por crear) |
| [docs/PROMPTS-COMMITS.md](PROMPTS-COMMITS.md) | Prompts y convención de commits (por crear) |

Cuando existan, los enlaces anteriores llevarán al backlog y al registro de prompts/commits.

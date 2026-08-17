# Design System — JW

Paleta blanco / rojo. Superficies claras, acento `#DC2626`.

| Nombre | Hex | Rol |
|--------|-----|-----|
| White | `#ffffff` | Fondo |
| Ink | `#111111` | Texto |
| JW Red | `#DC2626` | CTAs, acentos, marca |
| Red deep | `#B91C1C` | Hover / acento fuerte |
| Border | `#ececec` | Bordes |

---

## Principio general

La **estructura, densidad, radios, tipografía y patrones de componentes** vienen del segundo doc (shadcn/ui). La **paleta de colores completa** viene del primero (JW). El resultado es un sistema de componentes compacto, de bordes hairline, con canvas negro en lugar de blanco y rojo en lugar de negro sólido como único acento.

---

## Colores (de JW)

| Nombre | Hex | Rol |
|--------|-----|-----|
| Void Black | `#0a0a0a` | Fondo del documento (reemplaza `#ffffff`) |
| Deep Surface | `#0c0c0e` | Fondo de secciones e inner pages |
| Card Surface | `#18181b` | Cards, paneles, chips (reemplaza `#ffffff` de card) |
| Border Dark | `#27272a` | Todos los bordes hairline (reemplaza `#e5e5e5`) |
| Foreground | `#f4f4f5` | Texto primario (reemplaza `#000000`) |
| Muted Text | `#a1a1aa` | Texto secundario/muted (reemplaza `#737373`) |
| JW Red | `#dc2626` | Único acento — CTAs, precios, activos (reemplaza el negro del botón filled) |
| Red Soft | `#5dd4f9` | Hover del cyan |
| Mist Dark | `#18181b` | Surface muted (reemplaza `#f2f2f2`) |
| Inverted Surface | `#27272a` | Surface invertida oscura (reemplaza `#171717`) |
| Destructive | `#ef4444` | Errores, acciones destructivas |

### CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --background: #0a0a0a;
  --background-surface: #0c0c0e;

  /* Surfaces */
  --card: #18181b;
  --muted: #18181b;

  /* Text */
  --foreground: #f4f4f5;
  --card-foreground: #f4f4f5;
  --muted-foreground: #a1a1aa;

  /* Brand accent */
  --primary: #dc2626;
  --primary-foreground: #0a0a0a;
  --accent: #5dd4f9;

  /* System */
  --border: #27272a;
  --input: #27272a;
  --ring: #dc2626;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;

  /* Surfaces semánticas */
  --surface-canvas: #0a0a0a;
  --surface-card: #18181b;
  --surface-muted: #18181b;
  --surface-inverted: #27272a;
}
```

### Tailwind v4

```css
@theme {
  --color-background: #0a0a0a;
  --color-surface: #0c0c0e;
  --color-card: #18181b;
  --color-muted: #18181b;
  --color-foreground: #f4f4f5;
  --color-muted-foreground: #a1a1aa;
  --color-primary: #dc2626;
  --color-primary-foreground: #0a0a0a;
  --color-accent: #5dd4f9;
  --color-border: #27272a;
  --color-ring: #dc2626;
  --color-destructive: #ef4444;
}
```

---

## Tipografía (estructura del segundo, sin cambios)

**Geist** para todo el sistema. **Geist Mono** para inputs, precios y datos tabulares.

| Rol | Tamaño | Weight | Letter Spacing | Line Height |
|-----|--------|--------|----------------|-------------|
| caption | 12px | 500 | — | 1.5 |
| body | 14px | 400 | — | 1.43 |
| subheading | 18px | 600 | -0.45px | 1.5 |
| display | 48px | 600 | -2.4px | 1.1 |

```css
font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
font-family: 'Geist Mono', ui-monospace, monospace; /* inputs y precios */
```

---

## Espaciado y densidad (del segundo, sin cambios)

**Densidad:** compacta

| Token | Valor |
|-------|-------|
| element-gap | 8px |
| card-padding | 16px |
| section-gap | 48px |
| page-max-width | 1200px |

---

## Border Radius (del segundo, exactos)

| Elemento | Valor |
|----------|-------|
| nav | 10px |
| inputs | 10px |
| buttons | 10px |
| cards | 14px |
| badges | 26px |
| pills / avatares | 9999px |

---

## Componentes

### Top Navigation Bar

```
bg: #0a0a0a
border-bottom: 1px solid #27272a
height: 64px
gap entre items: 10px
```

- Logo: 14px / weight 600 / color `#dc2626`
- Nav links: 14px / weight 500 / color `#f4f4f5` (activo) o `#a1a1aa` (secundario)
- Search input: bg `#0c0c0e`, border `1px solid #27272a`, radius 10px, placeholder `#a1a1aa`, focus border `#dc2626`
- Badge ⌘K: bg `#18181b`, border `#27272a`, radius 26px, texto `#a1a1aa`
- Botón "New": bg `#dc2626`, texto `#0a0a0a`, radius 10px

---

### Search Input

```css
background: #0c0c0e;
border: 1px solid #27272a;
border-radius: 10px;
padding: 8px 12px;
font-family: 'Geist Mono', monospace;
font-size: 13px;
color: #f4f4f5;
```

```css
/* Focus */
border-color: #dc2626;
box-shadow: 0 0 0 2px rgba(60, 200, 247, 0.15);
```

Placeholder: `#a1a1aa`

---

### Pill Badge / Anuncio

```css
display: inline-flex;
align-items: center;
gap: 6px;
background: #18181b;
border: 1px solid #27272a;
border-radius: 9999px;
padding: 4px 12px;
font-size: 12px;
font-weight: 500;
color: #f4f4f5;
```

Punto decorativo si aplica: `width: 6px; height: 6px; border-radius: 50%; background: #dc2626`

---

### Primary Filled Button

```css
background: #dc2626;
color: #0a0a0a;
border: none;
border-radius: 10px;
padding: 8px 16px;
font-size: 14px;
font-weight: 600;
font-family: 'Geist', sans-serif;
cursor: pointer;
```

```css
/* Hover */
opacity: 0.9;
```

> Reemplaza el botón negro del segundo. El cian es el único elemento filled de alto contraste en el sistema.

---

### Ghost Text Button

```css
background: transparent;
border: none;
color: #f4f4f5;
font-size: 14px;
font-weight: 500;
border-radius: 10px;
padding: 8px 10px;
cursor: pointer;
```

```css
/* Hover */
background: #18181b;
```

---

### Component Preview Card

```css
background: #18181b;
border: 1px solid #27272a;
border-radius: 14px;
padding: 16px;
```

```css
/* Hover */
border-color: rgba(60, 200, 247, 0.4);
```

- Título interno: 16px / weight 600 / `#f4f4f5`
- Texto auxiliar: 13px / weight 400 / `#a1a1aa`
- Divider interno: `1px solid #27272a`
- Gap entre elementos internos: 8px

---

### Text Input / Form Input

```css
background: #0c0c0e;
border: 1px solid #27272a;
border-radius: 10px;
padding: 8px 12px;
font-family: 'Geist Mono', monospace;
font-size: 14px;
font-weight: 400;
color: #f4f4f5;
width: 100%;
outline: none;
```

```css
/* Focus */
border-color: #dc2626;
box-shadow: 0 0 0 2px rgba(60, 200, 247, 0.12);
```

Placeholder: `#a1a1aa`

---

### Select / Dropdown

Mismas dimensiones que el text input.

```css
background: #0c0c0e;
border: 1px solid #27272a;
border-radius: 10px;
color: #f4f4f5;
appearance: none;
```

Valor actual: `#f4f4f5` — Placeholder: `#a1a1aa` — Chevron: `#a1a1aa`

---

### Toggle / Switch

```css
/* Track */
width: 36px;
height: 20px;
border-radius: 9999px;
border: none;
transition: background 0.2s;

/* ON */
background: #dc2626;

/* OFF */
background: #27272a;
```

```css
/* Thumb */
width: 14px;
height: 14px;
background: #ffffff;
border-radius: 50%;
position: absolute;
top: 3px;
```

---

### Checkbox

```css
width: 16px;
height: 16px;
border-radius: 4px;
border: 1px solid #27272a;
background: #0c0c0e;
cursor: pointer;
```

```css
/* Checked */
background: #dc2626;
border-color: #dc2626;
/* checkmark blanco adentro */
```

Label: 14px / weight 400 / `#f4f4f5`

---

### Radio Group Item

```css
/* Circle */
width: 16px;
height: 16px;
border-radius: 50%;
border: 1px solid #27272a;
background: #0c0c0e;
```

```css
/* Selected — dot interior */
width: 8px;
height: 8px;
border-radius: 50%;
background: #dc2626;
```

Label: 14px / `#f4f4f5`

---

### Slider (Range)

```css
height: 4px;
border-radius: 4px;
accent-color: #dc2626;
cursor: pointer;
```

Track vacío: `#27272a` — Track lleno: `#dc2626` — Thumb: círculo blanco

---

### Tag / Chip

```css
display: inline-flex;
align-items: center;
background: #18181b;
border: 1px solid #27272a;
border-radius: 26px;
padding: 2px 10px;
font-size: 12px;
font-weight: 500;
color: #a1a1aa;
```

---

### Tab / Segmented Control

```css
/* Tab inactivo */
font-size: 14px;
font-weight: 500;
color: #a1a1aa;
padding: 8px 16px;
border-bottom: 2px solid transparent;
cursor: pointer;
```

```css
/* Tab activo */
color: #dc2626;
border-bottom-color: #dc2626;
```

Contenedor tabs: `border-bottom: 1px solid #27272a`

---

### Avatar / Iniciales

```css
width: 32px;   /* o 44px en versión grande */
height: 32px;
border-radius: 50%;
background: rgba(60, 200, 247, 0.15);  /* para el usuario principal */
color: #dc2626;
font-size: 12px;
font-weight: 600;
display: flex;
align-items: center;
justify-content: center;
```

Avatares secundarios: bg `#27272a`, texto `#a1a1aa`

---

### Dark / Inverted Surface Card

```css
background: #27272a;
border: 1px solid #3f3f46;
border-radius: 14px;
padding: 16px;
```

Título: `#f4f4f5` — Subtexto: `#a1a1aa`

> Equivale al `#171717` inverted card del segundo, pero usando zinc de JW.

---

## Elevación y separación

Sin `box-shadow` para elevación. Igual que el segundo doc. La separación se logra exclusivamente con:

- `1px solid #27272a` entre cards y secciones
- Cambio de superficie: de `#0a0a0a` → `#18181b` para profundidad
- On hover únicamente: `border-color: rgba(60,200,247,0.4)`

---

## Layout

```
max-width: 1200px
padding horizontal: 24px
section-gap: 48px
card-padding: 16px
element-gap: 8px
```

Grid de cards: `repeat(auto-fit, minmax(180px, 1fr))`

---

## Do's

- Usar `#dc2626` exclusivamente como acento — es el único color filled de alto contraste
- Usar `#27272a` para todos los bordes (el hairline del sistema)
- Mantener radios exactos: 10px inputs/buttons/nav, 14px cards, 26px badges, 9999px pills
- Geist 14px/400/1.43 para body · Geist 48px/600/-2.4px para display
- Element gaps de 8px · section gaps de 48px · card padding de 16px
- Para texto sobre superficie coloreada (cian), usar `#0a0a0a` como texto encima
- Un solo botón filled por región visual — el patrón es filled cyan + ghost text

## Don'ts

- No introducir colores cromáticos adicionales (el sistema es monocromo excepto el cian)
- No usar `box-shadow` para elevación — solo bordes y cambio de superficie
- No usar radios fuera de la escala: 4px / 10px / 14px / 26px / 9999px
- No usar fuentes distintas a Geist / Geist Mono
- No poner dos botones filled juntos en la misma región
- No usar gradientes — todos los fills son solid
- No usar letter-spacing positivo — el sistema va de 0 a negativo en todos los tamaños
- No activar light mode — el canvas es `#0a0a0a` por defecto y así se queda
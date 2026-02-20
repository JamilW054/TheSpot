# Análisis: modelo base, texturas (Buxxep vs usuario) y lógica del catálogo

## 1. Modelo base: siempre cargado desde el código

### 1.1 Principio

- **El modelo 3D (geometría) siempre se carga desde el código/repositorio.** No existe “cambiar de modelo” subiendo otro GLB/GLTF desde el usuario o desde Buxxep de forma dinámica en runtime.
- Las rutas de modelos son **fijas y controladas** (lista blanca), por ejemplo:
  - `/models/tshirt/scene.gltf`
  - `/models/male_tshirt.glb`
  - `/models/hoodie.glb`
  - etc.
- El **modelPath** de un producto del catálogo (y del editor) debe ser **siempre una de estas rutas definidas en código**. No se usa una URL arbitraria ni un archivo subido por el usuario como geometría.

### 1.2 Implicaciones

| Qué | Origen | Dónde se define |
|-----|--------|------------------|
| Geometría (mesh) | Código / repo | `config/texture-uv.ts`, `MOCK_MOCKUPS`, `MOCK_CATALOG_PRODUCTS` → `modelPath` |
| Escala / offset por modelo | Código | `MockupViewer3D.tsx` → `MODEL_SCALE`, `MODEL_OFFSET_Y` |
| Zona UV de diseño (pecho, etc.) | Código | `config/texture-uv.ts` → `MODEL_UV` / `getDesignZoneUV(modelPath)` |

**Resumen:** La “base” que siempre se carga es el **modelo (geometría)** desde rutas fijas. Lo que **sí** puede variar y adjuntarse son las **texturas** (y el color de la prenda), según la clasificación que se describe a continuación.

---

## 2. Texturas: clasificación y lógica de aplicación

### 2.1 Clasificación por origen

Toda textura que se “adjunta” al modelo debe clasificarse para decidir **qué se pinta encima de qué**:

| Origen | Descripción | Ejemplo |
|--------|-------------|---------|
| **Buxxep** | Recursos oficiales: plantillas, estampados de marca, texturas base curadas. | Imagen desde `/textures/buxxep/...` o desde CDN/BD con flag `source: 'buxxep'`. |
| **Usuario (subida)** | Imagen subida por el usuario como “fondo” o textura base del diseño. | Archivo subido en el editor → URL temporal o guardada (ej. Supabase Storage) con `source: 'user'`. |
| **Diseño (generada)** | Textura generada a partir de los elementos del canvas (texto, formas, imágenes, pincel). | Salida de `renderElementsToTextureUrl(...)` → data URL o URL de asset guardado. Siempre es “diseño del usuario” sobre la base. |

### 2.2 Regla de composición (capas)

La textura final que se aplica al modelo debe construirse en este orden:

1. **Capa base (fondo)**  
   - Si hay **textura Buxxep** asignada al producto o a la sesión → usarla como fondo (1024×1024).  
   - Si hay **textura usuario (subida)** → usarla como fondo.  
   - Si no hay ninguna → **fondo blanco** (comportamiento actual).

2. **Capa diseño**  
   - Si hay **elementos del editor** (texto, formas, imágenes, pincel) → renderizarlos en la **zona UV de diseño** (pecho, etc.) **encima** de la capa base.  
   - Esto ya lo hace `renderElementsToTextureUrl(elements, baseTextureUrl, ...)`.

**Orden de prioridad para la “base” (cuando hay varias opciones):**

- Si el producto tiene una “textura base Buxxep” por defecto → usarla como `baseTextureUrl`.
- Si el usuario ha subido una imagen en el editor → esa imagen es la base (y puede convivir o no con plantillas Buxxep según reglas de negocio).
- Definición recomendada:
  - **baseTextureUrl** = `textura Buxxep` O `textura usuario subida` (uno u otro, con prioridad configurable; por ejemplo “usuario sustituye Buxxep” si hay subida).

Así, **siempre se carga el modelo base del código** y **lo que se adjunta son solo texturas**, clasificadas en Buxxep vs usuario (subida) vs diseño generado, con la lógica de capas anterior.

### 2.3 Inversa: Buxxep vs usuario

- **Contenido Buxxep:** modelos (siempre desde código), texturas base/plantillas, diseños plantilla (`defaultDesignId`). Identificación: `source === 'buxxep'` o rutas bajo `/textures/buxxep/` o IDs de diseño en lista blanca.
- **Contenido usuario:** imagen subida, elementos del canvas guardados (designId en “mis diseños”), textura generada a partir de esos elementos. Identificación: `source === 'user'` o `userId` asociado al recurso.

La lógica a implementar sería:

- Al **cargar** una textura (para el modelo), comprobar su clasificación.
- Si es **Buxxep**: puede usarse como base por defecto para ese producto; no se sobrescribe con otra base Buxxep a menos que el producto tenga otra asignada.
- Si es **usuario**: se usa como base si el usuario la ha subido en esta sesión/diseño; y la capa de “diseño” (elementos) se dibuja encima.

No es necesario “inversa” en el sentido de cargar modelo usuario: el modelo **nunca** es usuario; solo las texturas se clasifican y se aplican sobre el modelo base.

---

## 3. Resumen de lógica a implementar (modelo + texturas)

1. **Modelo**
   - Obtener `modelPath` siempre de **config/catálogo** (lista blanca en código o en BD controlada por Buxxep).
   - Cargar el GLB/GLTF desde esa ruta (o desde un CDN si más adelante se sirven desde ahí, pero la **clave** sigue siendo controlada por el sistema, no por el usuario).

2. **Textura base**
   - Definir por producto (o por diseño) si existe una **textura base Buxxep** (URL o id de recurso).
   - Si el usuario ha **subido una imagen** en el editor, decidir si:
     - sustituye la base Buxxep, o
     - se compone con ella (ej. como overlay en zona de diseño).
   - Recomendación: **base = textura Buxxep del producto O imagen subida por usuario**; si hay ambas, prioridad “usuario sustituye Buxxep” para la base.

3. **Textura de diseño**
   - Siempre: **renderElementsToTextureUrl(elements, baseTextureUrl, modelPath, uvBounds)**.
   - `baseTextureUrl` = resultado del paso anterior (Buxxep o usuario).
   - La salida es la textura final que se aplica al **modelo base** en el visor 3D.

4. **Visor**
   - Cargar **siempre** el modelo con `modelPath` de la lista blanca.
   - Aplicar **una sola** textura resultante (la generada en el punto 3) al material (p. ej. `mesh.material.map`), más el **color de prenda** (`garmentColorHex`) si aplica.

Con esto, **siempre se carga el modelo base del código** y **todo lo que se adjunta son texturas**, con clasificación Buxxep vs usuario y reglas de composición claras.

---

## 4. Requerimientos y lógica del catálogo

### 4.1 Objetivos del catálogo

- Mostrar **productos a la venta** (ropa) con modelo 3D asociado (siempre modelo base del código).
- Permitir **comprar** (carrito + checkout).
- Permitir **personalizar** antes de comprar: abrir editor con ese producto (modelPath) y opcionalmente plantilla (defaultDesignId); el resultado es un diseño que se puede “adjuntar” al ítem del carrito (textura/diseño usuario).

### 4.2 Entidades

| Entidad | Descripción |
|--------|-------------|
| **Producto (catálogo)** | id, slug, name, description, price, **modelPath** (lista blanca), coverImage, opcional defaultDesignId, opcional textureBaseBuxxepId/URL. |
| **Modelo base** | Definido en código; product.modelPath apunta a uno de ellos. No es entidad “subible”. |
| **Diseño** | Conjunto de canvasElements (+ opcional baseTextureUrl). Puede ser plantilla Buxxep (defaultDesignId) o diseño guardado del usuario. |
| **Ítem de carrito** | productId, quantity, opcional designId (diseño personalizado asociado a ese ítem). |

### 4.3 Flujos

1. **Ver catálogo**  
   Listado de productos; cada uno con modelo base (modelPath) y opcional textura/diseño base Buxxep.

2. **Ver ficha de producto**  
   - Mostrar modelo 3D (siempre desde modelPath).  
   - Mostrar textura: por defecto base Buxxep del producto o blanco; si el producto tiene defaultDesignId, se puede mostrar la plantilla renderizada sobre el modelo.

3. **Añadir al carrito (estándar)**  
   productId + quantity; sin designId. En checkout/pedido, se fabrica con el diseño por defecto del producto (o solo color/talla si no hay diseño).

4. **Personalizar y luego añadir**  
   - Usuario abre editor con `?product=id&copy=defaultDesignId` (copia local de plantilla).  
   - Edita (elementos + posible subida de imagen).  
   - “Añadir al carrito desde el editor”: se guarda el diseño (o se genera la textura) y se añade ítem con productId + designId (o referencia a la textura generada).  
   - En checkout, el ítem lleva asociado el diseño usuario (textura generada según clasificación anterior).

5. **Checkout**  
   - Resumen: líneas = producto + cantidad + “con diseño personalizado” si designId no nulo.  
   - Datos de envío y pago.  
   - Al confirmar: crear pedido con líneas; cada línea con productId, quantity, opcional designId o URL de textura generada, para producción/almacén.

### 4.4 Lógica de negocio recomendada

- **Producto siempre referencia modelo base (modelPath en código).** No se permite producto con modelPath arbitrario o subido.
- **Textura base del producto:** opcionalmente cada producto puede tener una `textureBaseBuxxepUrl` (o id) que se usa cuando no hay imagen subida por el usuario.
- **Carrito:** ítem con designId implica “personalizado”; al confirmar pedido, esa línea debe incluir la textura/diseño (guardado en Storage + registro en BD).
- **Catálogo y editor:** misma lista de modelPath; el editor preselecciona la prenda según `?product=id` y aplica la lógica de capas de texturas (Buxxep / usuario / diseño) descrita en la sección 2.

### 4.5 Extras deseables (para no hacer)

- No permitir “subir modelo 3D” como producto o en el editor.  
- No mezclar modelo usuario con modelo Buxxep: un único modelo base por producto, siempre desde código/config.

---

## 5. Checklist de implementación sugerida

- [ ] **ModelPath:** centralizar lista blanca de modelos (ej. `config/models.ts` o BD) y validar que todo product.modelPath y mockup.modelPath vengan de ahí.
- [ ] **Clasificación de texturas:** introducir `TextureSource: 'buxxep' | 'user'` (y si aplica `'design'` como derivado de user) en tipos y en la UI que sube/selecciona textura base.
- [ ] **Base texture por producto:** campo opcional en producto (textureBaseBuxxepUrl o id); en el editor, si no hay imagen subida por usuario, usar esa base en `renderElementsToTextureUrl(..., baseTextureUrl, ...)`.
- [ ] **Prioridad base:** en el editor, `baseTextureUrl` = imagen subida por usuario si existe; si no, textura Buxxep del producto; si no, blanco.
- [ ] **Catálogo:** productos solo con modelPath de lista blanca; ficha con 3D y opcional preview con textura Buxxep/defaultDesign; carrito con ítem opcional designId; checkout con resumen y persistencia de líneas (producto + diseño si aplica).

Con esto queda definida la lógica para **siempre cargar el modelo base del código** y **adjuntar solo texturas** clasificadas (Buxxep vs usuario), y la lógica de requerimientos del catálogo (producto, carrito, personalización, checkout).

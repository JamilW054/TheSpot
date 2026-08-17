/**
 * Importa perfumes (precios, stock, marcas, imágenes) desde EsenciaInfinita
 * hacia el Supabase local de The Spot.
 *
 * Uso:
 *   node scripts/import-esencia.mjs
 *
 * Lee:
 *   - The Spot: .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 *   - EsenciaInfinita: D:\EsenciaInfinita\.env.local (o ESENCIA_DIR)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ESENCIA_DIR =
  process.env.ESENCIA_DIR || "D:\\EsenciaInfinita";
const PERFUME_SRC = path.join(ESENCIA_DIR, "public", "perfumes");
const PERFUME_DEST = path.join(ROOT, "public", "perfumes");
const OVERRIDES_FILE = path.join(
  ESENCIA_DIR,
  "data",
  "inventory-overrides.ts",
);

const WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";
const PERFUME_PRESET_ID = "00000000-0000-0000-0000-000000000010";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const raw of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function slugify(text) {
  const base = String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, 80) || "perfume";
}

function pesosToCents(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function parseOverrides(filePath) {
  const map = new Map();
  if (!fs.existsSync(filePath)) return map;
  const src = fs.readFileSync(filePath, "utf8");
  const re =
    /['"](\/perfumes\/[^'"]+)['"]\s*:\s*\{\s*price:\s*(\d+)\s*,\s*stock:\s*(\d+)/g;
  let m = re.exec(src);
  while (m) {
    map.set(m[1], { price: Number(m[2]), stock: Number(m[3]) });
    map.set(m[1].toLowerCase(), { price: Number(m[2]), stock: Number(m[3]) });
    m = re.exec(src);
  }
  return map;
}

const BRAND_RULES = [
  { brand: "Carolina Herrera", prefixes: ["212 ", "Carolina Herrera "] },
  { brand: "Afnan", prefixes: ["Afnan "] },
  { brand: "Al Haramain", prefixes: ["Al Haramain "] },
  { brand: "Armaf", prefixes: ["Armaf "] },
  { brand: "Azzaro", prefixes: ["Azzaro "] },
  { brand: "Bharara", prefixes: ["Bharara "] },
  { brand: "Bond No. 9", prefixes: ["Bond No. 9 "] },
  { brand: "Chanel", prefixes: ["Bleu de Chanel", "Coco Chanel", "N05 Chanel"] },
  { brand: "Club de Nuit", prefixes: ["Club de nuit "] },
  { brand: "Burberry", prefixes: ["Burberry "] },
  { brand: "Creed", prefixes: ["Creed "] },
  { brand: "Dior", prefixes: ["Miss Dior", "Dior "] },
  { brand: "Dolce & Gabbana", prefixes: ["Dolce & Gabanna "] },
  { brand: "Armani", prefixes: ["Emporio Armani "] },
  { brand: "Viktor & Rolf", prefixes: ["Flower Bomb "] },
  { brand: "Game of Spades", prefixes: ["Game of Spades "] },
  { brand: "Hawas", prefixes: ["Hawas "] },
  { brand: "Hermes", prefixes: ["Hermes "] },
  { brand: "Jean Paul Gaultier", prefixes: ["Jean Paul Gautier "] },
  { brand: "Kajal", prefixes: ["Kajal", "Lamar By Kajal", "Dahab by Kajal"] },
  { brand: "Khair", prefixes: ["Khair "] },
  { brand: "Lancôme", prefixes: ["Lancome "] },
  { brand: "Lattafa", prefixes: ["Lattafa "] },
  { brand: "Le Labo", prefixes: ["Le Labo "] },
  { brand: "Louis Vuitton", prefixes: ["Louis Vuitton ", "Lous Vuitton "] },
  { brand: "Maison Francis Kurkdjian", prefixes: ["Maison Francis Kurkdjian "] },
  { brand: "Montblanc", prefixes: ["Montblanc "] },
  { brand: "Moschino", prefixes: ["Moschino "] },
  { brand: "Nautica", prefixes: ["Nautica "] },
  { brand: "Nitro", prefixes: ["Nitro "] },
  { brand: "Odyssey", prefixes: ["Odyssey "] },
  { brand: "Orientica", prefixes: ["Orientica "] },
  { brand: "Paris Corner", prefixes: ["Paris Corner "] },
  { brand: "Paragon", prefixes: ["Paragon "] },
  { brand: "Paco Rabanne", prefixes: ["Paco Rabanne "] },
  { brand: "Prada", prefixes: ["Prada "] },
  { brand: "Parfums de Marly", prefixes: ["Parfums de Marly "] },
  { brand: "Sol de Janeiro", prefixes: ["Sol de Janeiro "] },
  { brand: "Viktor & Rolf", prefixes: ["Spice Bomb "] },
  { brand: "Tiffany & Co", prefixes: ["Tiffany & Co"] },
  { brand: "Tom Ford", prefixes: ["Tom Ford "] },
  { brand: "Tubbees", prefixes: ["Tubbees "] },
  { brand: "Valentino", prefixes: ["Valentino ", "Valentin Punk ", "Valentina Rosa "] },
  { brand: "Versace", prefixes: ["Versace "] },
  { brand: "Victoria's Secret", prefixes: ["Victoria's Secret ", "Victoria's Secrets "] },
  { brand: "Vulcan", prefixes: ["Vulcan "] },
  { brand: "Xerjoff", prefixes: ["Xerjof ", "Xerjoff "] },
  { brand: "YSL", prefixes: ["YSL "] },
];

function detectBrand(fileName) {
  for (const rule of BRAND_RULES) {
    if (rule.prefixes.some((prefix) => fileName.startsWith(prefix))) {
      return rule.brand;
    }
  }
  const [first, second] = fileName.split(" ");
  return second ? `${first} ${second}` : first;
}

function detectName(fileName, brand) {
  if (fileName === "Valentin Punk Romantic") return "Punk Romantic";
  if (fileName === "Valentina Rosa Assoluto") return "Rosa Assoluto";
  const matchedRule = BRAND_RULES.find((rule) => rule.brand === brand);
  if (!matchedRule) return fileName;
  for (const prefix of matchedRule.prefixes) {
    if (fileName.startsWith(prefix)) {
      const trimmed = fileName.slice(prefix.length).trim();
      return trimmed.length > 0 ? trimmed : fileName;
    }
  }
  return fileName;
}

function detectGender(text) {
  const lower = text.toLowerCase();
  if (/(for her|rose|blush|donna|girl|femme|women|woman)/.test(lower)) {
    return "femenino";
  }
  if (/(uomo|male|man)/.test(lower)) return "masculino";
  return "unisex";
}

function detectFragranceType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("eau de toilette")) return "eau de toilette";
  if (lower.includes("eau de cologne")) return "eau de cologne";
  if (lower.includes("parfum") || lower.includes("elixir")) return "parfum";
  return "eau de parfum";
}

function localCatalogFromImages(sourceFiles, overrides) {
  const products = [];
  for (const file of sourceFiles) {
    const fileName = file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const brand = detectBrand(fileName);
    const name = detectName(fileName, brand);
    const imagePath = `/perfumes/${file.name}`;
    const inv =
      overrides.get(imagePath) ||
      overrides.get(imagePath.toLowerCase()) ||
      null;
    const stock = inv ? inv.stock : 10;
    const price = inv ? inv.price : 0;
    const fullName = `${brand} ${name}`;
    products.push({
      slug: slugify(fullName),
      name,
      brand_name: brand,
      price,
      stock,
      image_url: imagePath,
      short_description: `${name} de ${brand}.`,
      long_description: `${name} de ${brand}. Resellers oficiales en The Spot.`,
      gender: detectGender(fullName),
      fragrance_type: detectFragranceType(fullName),
      availability: stock === 0 ? "agotado" : "disponible",
      is_new: true,
      featured: false,
      best_seller: false,
    });
  }
  return products;
}

function mergeCatalog(localProducts, remoteProducts) {
  const bySlug = new Map();
  const byImage = new Map();
  for (const p of localProducts) {
    bySlug.set(p.slug, p);
    if (p.image_url) byImage.set(String(p.image_url).toLowerCase(), p);
  }
  for (const remote of remoteProducts) {
    const brandName = String(remote.brand_name || "").trim();
    const name = String(remote.name || "").trim();
    const slug = String(remote.slug || slugify(`${brandName} ${name}`));
    const imageKey = String(remote.image_url || "").toLowerCase();
    const local = bySlug.get(slug) || byImage.get(imageKey) || {};
    const merged = {
      ...local,
      ...remote,
      slug,
      name: name || local.name,
      brand_name: brandName || local.brand_name,
      image_url: remote.image_url || local.image_url,
      price: parsePrice(remote.price) || parsePrice(local.price),
      stock:
        remote.stock != null && remote.stock !== ""
          ? Number(remote.stock)
          : local.stock,
    };
    bySlug.set(slug, merged);
  }
  return [...bySlug.values()];
}

function safeImageName(original, used) {
  const ext = path.extname(original).toLowerCase() || ".jpg";
  const normalizedExt = ext === ".jpeg" ? ".jpg" : ext;
  const base = slugify(path.basename(original, path.extname(original)));
  let name = `${base}${normalizedExt}`;
  let i = 2;
  while (used.has(name.toLowerCase())) {
    name = `${base}-${i}${normalizedExt}`;
    i += 1;
  }
  used.add(name.toLowerCase());
  return name;
}

function shouldSkipFile(name) {
  const lower = name.toLowerCase();
  if (lower.includes("copia")) return true;
  if (/^[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$/i.test(name)) return true;
  return false;
}

async function fetchAll(supabase, table, columns = "*") {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function publicImagePath(fileName) {
  return `/perfumes/${fileName}`;
}

function matchLocalFile(imageUrl, productName, filesByLower) {
  const candidates = [];
  if (imageUrl) {
    try {
      const raw = decodeURIComponent(
        String(imageUrl).split("?")[0].replace(/\\/g, "/"),
      );
      candidates.push(path.basename(raw));
    } catch {
      candidates.push(path.basename(String(imageUrl)));
    }
  }
  if (productName) {
    candidates.push(`${productName}.jpg`);
    candidates.push(`${productName}.png`);
  }
  for (const c of candidates) {
    const hit = filesByLower.get(c.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

async function main() {
  const spotEnv = loadEnvFile(path.join(ROOT, ".env.local"));
  const esenciaEnv = loadEnvFile(path.join(ESENCIA_DIR, ".env.local"));

  const spotUrl = spotEnv.NEXT_PUBLIC_SUPABASE_URL;
  const spotKey =
    spotEnv.SUPABASE_SERVICE_ROLE_KEY || spotEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const esenciaUrl = esenciaEnv.NEXT_PUBLIC_SUPABASE_URL;
  const esenciaKey =
    esenciaEnv.SUPABASE_SERVICE_ROLE_KEY ||
    esenciaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!spotUrl || !spotKey) {
    throw new Error("Faltan credenciales de The Spot en .env.local");
  }
  if (!esenciaUrl || !esenciaKey) {
    throw new Error(`Faltan credenciales de EsenciaInfinita en ${ESENCIA_DIR}`);
  }
  if (!fs.existsSync(PERFUME_SRC)) {
    throw new Error(`No encuentro imágenes en ${PERFUME_SRC}`);
  }

  fs.mkdirSync(PERFUME_DEST, { recursive: true });

  const overrides = parseOverrides(OVERRIDES_FILE);
  const sourceFiles = fs
    .readdirSync(PERFUME_SRC, { withFileTypes: true })
    .filter((d) => d.isFile() && !shouldSkipFile(d.name));
  const filesByLower = new Map(
    sourceFiles.map((d) => [d.name.toLowerCase(), d.name]),
  );

  console.log(`EsenciaInfinita: ${esenciaUrl}`);
  console.log(`The Spot:        ${spotUrl}`);
  console.log(`Imágenes origen: ${sourceFiles.length}`);

  const esencia = createClient(esenciaUrl, esenciaKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const spot = createClient(spotUrl, spotKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [remoteBrands, remoteProducts] = await Promise.all([
    fetchAll(esencia, "brands"),
    fetchAll(esencia, "products"),
  ]);
  console.log(
    `Remoto: ${remoteBrands.length} marcas, ${remoteProducts.length} productos`,
  );

  const localProducts = localCatalogFromImages(sourceFiles, overrides);
  const catalog = mergeCatalog(localProducts, remoteProducts);
  console.log(
    `Catálogo combinado (DB + imágenes locales): ${catalog.length} perfumes`,
  );

  const { data: cat, error: catErr } = await spot
    .from("categories")
    .select("id")
    .eq("slug", "perfumes")
    .maybeSingle();
  if (catErr) throw catErr;
  if (!cat?.id) throw new Error("No existe la categoría 'perfumes' en The Spot");

  const { data: warehouse } = await spot
    .from("warehouses")
    .select("id")
    .eq("id", WAREHOUSE_ID)
    .maybeSingle();
  const warehouseId = warehouse?.id ?? WAREHOUSE_ID;

  const brandIdByName = new Map();
  const brandRows = [];
  const seenBrandSlug = new Set();
  for (const b of remoteBrands) {
    const name = String(b.name || "").trim();
    if (!name) continue;
    const slug = String(b.slug || slugify(name));
    if (seenBrandSlug.has(slug)) continue;
    seenBrandSlug.add(slug);
    brandRows.push({
      slug,
      name,
      logo_url: b.logo_url || null,
      is_active: true,
    });
  }
  for (const p of catalog) {
    const name = String(p.brand_name || "").trim();
    if (!name) continue;
    const slug = slugify(name);
    if (seenBrandSlug.has(slug)) continue;
    seenBrandSlug.add(slug);
    brandRows.push({ slug, name, is_active: true });
  }

  const { error: brandErr } = await spot
    .from("brands")
    .upsert(brandRows, { onConflict: "slug" });
  if (brandErr) throw brandErr;

  const { data: allBrands, error: brandsReadErr } = await spot
    .from("brands")
    .select("id, slug, name");
  if (brandsReadErr) throw brandsReadErr;
  for (const b of allBrands ?? []) {
    brandIdByName.set(String(b.name).toLowerCase(), b.id);
    brandIdByName.set(String(b.slug).toLowerCase(), b.id);
  }

  const usedNames = new Set(
    fs.existsSync(PERFUME_DEST)
      ? fs.readdirSync(PERFUME_DEST).map((n) => n.toLowerCase())
      : [],
  );
  const copied = new Map();
  let copiedCount = 0;

  function copyImage(originalName) {
    if (copied.has(originalName)) return copied.get(originalName);
    const src = path.join(PERFUME_SRC, originalName);
    if (!fs.existsSync(src)) return null;
    const ext = (path.extname(originalName).toLowerCase() || ".jpg") === ".jpeg"
      ? ".jpg"
      : path.extname(originalName).toLowerCase() || ".jpg";
    const preferred = `${slugify(path.basename(originalName, path.extname(originalName)))}${ext}`;
    const preferredPath = path.join(PERFUME_DEST, preferred);
    if (fs.existsSync(preferredPath)) {
      copied.set(originalName, preferred);
      usedNames.add(preferred.toLowerCase());
      return preferred;
    }
    const destName = safeImageName(originalName, usedNames);
    fs.copyFileSync(src, path.join(PERFUME_DEST, destName));
    copied.set(originalName, destName);
    copiedCount += 1;
    return destName;
  }

  const tagSlugs = new Set();
  for (const p of catalog) {
    if (p.gender) tagSlugs.add(slugify(p.gender));
    if (p.fragrance_type) tagSlugs.add(slugify(p.fragrance_type));
    if (p.featured || p.is_featured) tagSlugs.add("destacado");
    if (p.is_new) tagSlugs.add("nuevo");
    if (p.best_seller || p.is_best_seller) tagSlugs.add("mas-pedido");
  }
  const tagList = [...tagSlugs].filter(Boolean);
  if (tagList.length > 0) {
    const { error: tagErr } = await spot.from("tags").upsert(
      tagList.map((slug) => ({
        slug,
        name: slug.replace(/-/g, " "),
      })),
      { onConflict: "slug" },
    );
    if (tagErr) throw tagErr;
  }
  const { data: tags } = await spot.from("tags").select("id, slug");
  const tagIdBySlug = new Map((tags ?? []).map((t) => [t.slug, t.id]));

  let created = 0;
  let updated = 0;
  let withoutPrice = 0;
  let withoutImage = 0;

  for (const p of catalog) {
    const brandName = String(p.brand_name || "").trim();
    const name = String(p.name || "").trim();
    if (!name) continue;

    const slug = String(p.slug || slugify(`${brandName} ${name}`)).slice(0, 96);
    const override =
      (p.image_url && overrides.get(p.image_url)) ||
      overrides.get(`/perfumes/${name}.jpg`) ||
      null;

    const pesos = parsePrice(p.price) || override?.price || 0;
    const cents = pesosToCents(pesos);
    if (cents === 0) withoutPrice += 1;

    const stockRaw =
      p.stock != null ? Number(p.stock) : override?.stock ?? 0;
    const stock = Number.isFinite(stockRaw) ? Math.max(0, Math.floor(stockRaw)) : 0;
    const available =
      String(p.availability || "").toLowerCase() !== "agotado" && stock > 0;

    const original = matchLocalFile(p.image_url, `${brandName} ${name}`, filesByLower)
      || matchLocalFile(p.image_url, name, filesByLower);
    const destName = original ? copyImage(original) : null;
    if (!destName) withoutImage += 1;

    const description = [p.short_description, p.long_description]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    const brandId =
      brandIdByName.get(brandName.toLowerCase()) ||
      brandIdByName.get(slugify(brandName)) ||
      null;

    const productPayload = {
      slug,
      name,
      description: description || `${name} de ${brandName}.`.trim(),
      category_id: cat.id,
      brand_id: brandId,
      base_price_cents: cents,
      cost_cents: 0,
      is_active: cents > 0,
      in_stock: available,
    };

    const { data: existing } = await spot
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    let productId = existing?.id;
    if (productId) {
      const { error } = await spot
        .from("products")
        .update(productPayload)
        .eq("id", productId);
      if (error) throw error;
      updated += 1;
    } else {
      const { data: inserted, error } = await spot
        .from("products")
        .insert(productPayload)
        .select("id")
        .single();
      if (error) throw error;
      productId = inserted.id;
      created += 1;
    }

    await spot.from("product_media").delete().eq("product_id", productId);
    if (destName) {
      const { error: mediaErr } = await spot.from("product_media").insert({
        product_id: productId,
        url: publicImagePath(destName),
        media_type: "image",
        alt_text: `${brandName} ${name}`.trim(),
        is_cover: true,
        sort_order: 0,
      });
      if (mediaErr) throw mediaErr;
    }

    const sku = `EI-${slug}`.slice(0, 48).toUpperCase();
    const { data: variants } = await spot
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    let variantId = variants?.[0]?.id;
    if (variantId) {
      const { error } = await spot
        .from("product_variants")
        .update({
          sku,
          price_cents: cents || null,
          attributes: { size: "100ml" },
          is_active: cents > 0,
          sort_order: 0,
        })
        .eq("id", variantId);
      if (error) throw error;
    } else {
      const { data: insertedVar, error } = await spot
        .from("product_variants")
        .insert({
          product_id: productId,
          sku,
          price_cents: cents || null,
          attributes: { size: "100ml" },
          is_active: cents > 0,
          sort_order: 0,
        })
        .select("id")
        .single();
      if (error) throw error;
      variantId = insertedVar.id;
    }

    const { data: inv } = await spot
      .from("inventory")
      .select("id")
      .eq("variant_id", variantId)
      .eq("warehouse_id", warehouseId)
      .maybeSingle();
    if (inv?.id) {
      const { error } = await spot
        .from("inventory")
        .update({ quantity: stock, reserved: 0 })
        .eq("id", inv.id);
      if (error) throw error;
    } else {
      const { error } = await spot.from("inventory").insert({
        variant_id: variantId,
        warehouse_id: warehouseId,
        quantity: stock,
        reserved: 0,
      });
      if (error) throw error;
    }

    const productTags = [];
    if (p.gender) productTags.push(slugify(p.gender));
    if (p.fragrance_type) productTags.push(slugify(p.fragrance_type));
    if (p.featured || p.is_featured) productTags.push("destacado");
    if (p.is_new) productTags.push("nuevo");
    if (p.best_seller || p.is_best_seller) productTags.push("mas-pedido");
    await spot.from("product_tags").delete().eq("product_id", productId);
    const tagRows = productTags
      .map((s) => tagIdBySlug.get(s))
      .filter(Boolean)
      .map((tag_id) => ({ product_id: productId, tag_id }));
    if (tagRows.length > 0) {
      const { error } = await spot.from("product_tags").insert(tagRows);
      if (error) throw error;
    }
  }

  // Asegura que la categoría Perfumes use el preset de ml.
  await spot
    .from("categories")
    .update({ size_preset_id: PERFUME_PRESET_ID })
    .eq("id", cat.id);

  console.log(`Imágenes copiadas: ${copiedCount} → ${PERFUME_DEST}`);
  console.log(`Productos creados: ${created}`);
  console.log(`Productos actualizados: ${updated}`);
  console.log(`Sin precio numérico (quedan inactivos): ${withoutPrice}`);
  console.log(`Sin imagen local: ${withoutImage}`);
  console.log("Listo. Recarga /catalogo?categoria=perfumes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Repositorio genérico sobre una tabla de Supabase/PostgREST.
 *
 * Centraliza el patrón CRUD para que todos los módulos usen la misma capa:
 * listado, búsqueda por id/filtros, alta, edición, borrado (lógico o físico)
 * y conteo. Las consultas con joins muy específicas pueden usar `getClient()`
 * o `select()` para construir la query a mano sin salir del repositorio.
 *
 * Notas:
 * - `client: "service"` (por defecto) usa la service role (bypassa RLS) — ideal
 *   para el panel admin. `client: "public"` respeta RLS (catálogo público).
 * - Como las queries de PostgREST son "stringly typed", los resultados se
 *   castean al tipo de fila `T` declarado en cada repositorio.
 */

export type RepositoryClientKind = "service" | "public";

export interface RepositoryConfig {
  /** Nombre de la tabla en `public`. */
  table: string;
  /** Columnas por defecto del `select` (incluye joins de PostgREST si aplica). */
  columns?: string;
  /** Si la tabla tiene borrado lógico. Columna por defecto: `deleted_at`. */
  hasSoftDelete?: boolean;
  softDeleteColumn?: string;
  /** Orden por defecto en los listados. */
  defaultOrderBy?: { column: string; ascending?: boolean };
  /** Cliente a usar. Por defecto "service" (admin). */
  client?: RepositoryClientKind;
}

export interface ListOptions {
  columns?: string;
  orderBy?: { column: string; ascending?: boolean };
  /** Filtros de igualdad; `null` se traduce a `IS NULL`. */
  filters?: Record<string, string | number | boolean | null>;
  includeDeleted?: boolean;
  limit?: number;
}

function toRepoError(err: { message?: string; code?: string }): Error {
  const e = new Error(err?.message ?? "Error de base de datos");
  if (err?.code) (e as Error & { code?: string }).code = err.code;
  return e;
}

export class Repository<T> {
  constructor(private readonly config: RepositoryConfig) {}

  get table(): string {
    return this.config.table;
  }

  private get softCol(): string {
    return this.config.softDeleteColumn ?? "deleted_at";
  }

  private get cols(): string {
    return this.config.columns ?? "*";
  }

  /** Cliente Supabase configurado (service o public). */
  async getClient() {
    return this.config.client === "public"
      ? await createClient()
      : createServiceClient();
  }

  // biome-ignore lint/suspicious/noExplicitAny: el query builder de PostgREST no es genérico aquí
  private applyFilters(query: any, filters?: ListOptions["filters"]) {
    let q = query;
    for (const [key, value] of Object.entries(filters ?? {})) {
      q = value === null ? q.is(key, null) : q.eq(key, value);
    }
    return q;
  }

  /** Listado con filtros, orden y borrado lógico opcional. */
  async findMany(options: ListOptions = {}): Promise<T[]> {
    const supabase = await this.getClient();
    let q = supabase
      .from(this.config.table)
      .select(options.columns ?? this.cols);
    q = this.applyFilters(q, options.filters);
    if (this.config.hasSoftDelete && !options.includeDeleted) {
      q = q.is(this.softCol, null);
    }
    const order = options.orderBy ?? this.config.defaultOrderBy;
    if (order)
      q = q.order(order.column, { ascending: order.ascending ?? true });
    if (options.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw toRepoError(error);
    return (data ?? []) as unknown as T[];
  }

  /** Una fila por id (o null). */
  async findById(id: string, columns?: string): Promise<T | null> {
    const s = id?.trim();
    if (!s) return null;
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.config.table)
      .select(columns ?? this.cols)
      .eq("id", s)
      .maybeSingle();
    if (error) throw toRepoError(error);
    return (data ?? null) as unknown as T | null;
  }

  /** Primera fila que cumpla los filtros (o null). */
  async findOne(
    filters: ListOptions["filters"],
    columns?: string,
  ): Promise<T | null> {
    const supabase = await this.getClient();
    let q = supabase.from(this.config.table).select(columns ?? this.cols);
    q = this.applyFilters(q, filters);
    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw toRepoError(error);
    return (data ?? null) as unknown as T | null;
  }

  /** Inserta y devuelve la fila creada. */
  async insert(values: Record<string, unknown>): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.config.table)
      .insert(values)
      .select(this.cols)
      .single();
    if (error) throw toRepoError(error);
    return data as unknown as T;
  }

  /** Inserta varias filas. */
  async insertMany(rows: Record<string, unknown>[]): Promise<void> {
    if (rows.length === 0) return;
    const supabase = await this.getClient();
    const { error } = await supabase.from(this.config.table).insert(rows);
    if (error) throw toRepoError(error);
  }

  /** Actualiza por id y devuelve la fila. */
  async updateById(id: string, values: Record<string, unknown>): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.config.table)
      .update(values)
      .eq("id", id)
      .select(this.cols)
      .single();
    if (error) throw toRepoError(error);
    return data as unknown as T;
  }

  /** Borrado lógico (marca `deleted_at`). Requiere `hasSoftDelete`. */
  async softDeleteById(id: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from(this.config.table)
      .update({ [this.softCol]: new Date().toISOString() })
      .eq("id", id);
    if (error) throw toRepoError(error);
  }

  /** Borrado físico. */
  async deleteById(id: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from(this.config.table)
      .delete()
      .eq("id", id);
    if (error) throw toRepoError(error);
  }

  /** Borrado por id respetando el modo de la tabla (lógico si aplica). */
  async remove(id: string): Promise<void> {
    return this.config.hasSoftDelete
      ? this.softDeleteById(id)
      : this.deleteById(id);
  }

  /** Cuenta filas que cumplen filtros (excluye borradas salvo includeDeleted). */
  async count(
    filters?: ListOptions["filters"],
    includeDeleted = false,
  ): Promise<number> {
    const supabase = await this.getClient();
    let q = supabase
      .from(this.config.table)
      .select("id", { count: "exact", head: true });
    q = this.applyFilters(q, filters);
    if (this.config.hasSoftDelete && !includeDeleted) {
      q = q.is(this.softCol, null);
    }
    const { count, error } = await q;
    if (error) throw toRepoError(error);
    return count ?? 0;
  }

  async exists(filters: ListOptions["filters"]): Promise<boolean> {
    return (await this.count(filters)) > 0;
  }

  /** Builder de `select` para construir queries con joins a medida. */
  async select(columns?: string) {
    const supabase = await this.getClient();
    return supabase.from(this.config.table).select(columns ?? this.cols);
  }
}

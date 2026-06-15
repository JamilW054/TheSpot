"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { ProductReview } from "@/types";
import {
  submitReviewAction,
  deleteReviewAction,
} from "@/app/(public)/catalogo/[slug]/reviews-actions";
import { formatDate } from "@/lib/format-date";

interface Props {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
  currentUserId: string | null;
  userExistingReview: ProductReview | null;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-xl leading-none transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer"
          } ${active >= star ? "text-yellow-400" : "text-muted-foreground/30"}`}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: ProductReview[] }) {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const full = Math.round(avg);
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-5xl font-black text-foreground tabular-nums leading-none">
          {avg.toFixed(1)}
        </p>
        <div className="mt-2 flex gap-0.5 text-yellow-400 text-lg leading-none">
          {"★".repeat(full)}
          {"☆".repeat(5 - full)}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
        </p>
      </div>

      <div className="space-y-2">
        {dist.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-2.5 text-[11px] text-muted-foreground tabular-nums text-right shrink-0">
              {star}
            </span>
            <span className="text-yellow-400 text-[10px] shrink-0">★</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-4 text-[11px] text-muted-foreground tabular-nums shrink-0">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  isOwn,
  onEdit,
  onDelete,
  deleting,
}: {
  review: ProductReview;
  isOwn: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <article
      className="rounded-2xl bg-card p-5 space-y-3"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">
              {isOwn ? "Tú" : (review.userName ?? "Cliente")}
            </p>
            {isOwn && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Tu reseña
              </span>
            )}
          </div>
          <div className="flex gap-0.5 text-yellow-400 text-sm leading-none">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
          {formatDate(review.createdAt)}
        </p>
      </div>

      {review.title && (
        <p className="text-sm font-semibold text-foreground leading-snug">
          {review.title}
        </p>
      )}
      {review.body && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.body}
        </p>
      )}

      {isOwn && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="size-3" aria-hidden />
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
          >
            <Trash2 className="size-3" aria-hidden />
            {deleting ? "..." : "Borrar"}
          </button>
        </div>
      )}
    </article>
  );
}

function ReviewForm({
  productId,
  productSlug,
  existing,
  onSuccess,
  onCancel,
}: {
  productId: string;
  productSlug: string;
  existing: ProductReview | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecciona una calificación.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReviewAction(productId, productSlug, rating, title, body);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-card p-5 space-y-4"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      <p className="text-sm font-semibold text-foreground">
        {existing ? "Editar reseña" : "Escribir reseña"}
      </p>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
          Calificación
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="review-title"
          className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground"
        >
          Título{" "}
          <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
            (opcional)
          </span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Resumen breve de tu opinión..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="review-body"
          className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground"
        >
          Comentario{" "}
          <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
            (opcional)
          </span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Comparte tu experiencia con este producto..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Guardando..." : existing ? "Actualizar" : "Publicar reseña"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ProductReviews({
  productId,
  productSlug,
  reviews: initialReviews,
  currentUserId,
  userExistingReview: initialExisting,
}: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [existing, setExisting] = useState(initialExisting);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => { setReviews(initialReviews); }, [initialReviews]);
  useEffect(() => { setExisting(initialExisting); }, [initialExisting]);

  function handleSuccess() {
    setShowForm(false);
    router.refresh();
  }

  function handleDelete(review: ProductReview) {
    setDeletingId(review.id);
    startTransition(async () => {
      const result = await deleteReviewAction(productId, productSlug);
      if (result.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        setExisting(null);
        setShowForm(false);
      }
      setDeletingId(null);
    });
  }

  const hasReviews = reviews.length > 0;

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">Reseñas</h2>
      </div>

      {hasReviews ? (
        /* Two-column on desktop when there are reviews */
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Left: rating summary */}
          <div className="shrink-0">
            <RatingSummary reviews={reviews} />
          </div>

          {/* Right: form + review cards */}
          <div className="min-w-0 space-y-4">
            {showForm && currentUserId ? (
              <ReviewForm
                productId={productId}
                productSlug={productSlug}
                existing={existing}
                onSuccess={handleSuccess}
                onCancel={() => setShowForm(false)}
              />
            ) : currentUserId && !existing ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full rounded-2xl border border-dashed border-border/60 py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                + Escribir una reseña
              </button>
            ) : !currentUserId ? (
              <a
                href="/login"
                className="flex w-full items-center justify-center rounded-2xl border border-dashed border-border/60 py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                Inicia sesión para reseñar
              </a>
            ) : null}
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwn={review.userId === currentUserId}
                  onEdit={() => setShowForm(true)}
                  onDelete={() => handleDelete(review)}
                  deleting={deletingId === review.id}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="space-y-5">
          {showForm && currentUserId && (
            <ReviewForm
              productId={productId}
              productSlug={productSlug}
              existing={existing}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
          {!showForm && (
            <div
              className="rounded-2xl bg-card p-8 text-center"
              style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
            >
              <p className="text-3xl mb-3">★</p>
              <p className="text-sm font-semibold text-foreground mb-1">
                Sin reseñas todavía
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUserId
                  ? "¡Sé el primero en dejar tu opinión sobre este producto!"
                  : "Inicia sesión para dejar tu reseña."}
              </p>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Escribir reseña
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

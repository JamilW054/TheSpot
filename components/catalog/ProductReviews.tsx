"use client";

import { useState, useTransition } from "react";
import type { ProductReview } from "@/types";
import {
  submitReviewAction,
  deleteReviewAction,
} from "@/app/(public)/catalogo/[slug]/reviews-actions";

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
          type={readonly ? "button" : "button"}
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-xl leading-none transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${active >= star ? "text-yellow-400" : "text-muted-foreground/30"}`}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isOwn,
  onDelete,
  deleting,
}: {
  review: ProductReview;
  isOwn: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const date = new Date(review.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {review.userName ?? "Cliente"}
          </p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly />
          {isOwn && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              aria-label="Eliminar reseña"
            >
              {deleting ? "..." : "Eliminar"}
            </button>
          )}
        </div>
      </div>
      {review.body && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.body}
        </p>
      )}
    </article>
  );
}

function ReviewForm({
  productId,
  productSlug,
  existing,
  onSuccess,
}: {
  productId: string;
  productSlug: string;
  existing: ProductReview | null;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
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
      const result = await submitReviewAction(productId, productSlug, rating, body);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Tu calificación
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="review-body"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Comentario <span className="normal-case">(opcional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Comparte tu experiencia con este producto..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending
          ? "Guardando..."
          : existing
          ? "Actualizar reseña"
          : "Publicar reseña"}
      </button>
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
  const [reviews, setReviews] = useState(initialReviews);
  const [existing, setExisting] = useState(initialExisting);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  function handleSuccess() {
    setShowForm(false);
    // Page will revalidate via server action; local state reflects optimistically
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

  return (
    <section className="space-y-4 mt-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">Reseñas</h2>
          {reviews.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} ★ · {reviews.length}{" "}
              {reviews.length === 1 ? "reseña" : "reseñas"}
            </span>
          )}
        </div>

        {currentUserId && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {existing ? "Editar mi reseña" : "Escribir reseña"}
          </button>
        )}
      </div>

      {!currentUserId && (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para dejar tu reseña sobre este producto.
          </p>
          <a
            href="/login"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Iniciar sesión
          </a>
        </div>
      )}

      {showForm && currentUserId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <ReviewForm
            productId={productId}
            productSlug={productSlug}
            existing={existing}
            onSuccess={handleSuccess}
          />
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          {currentUserId
            ? "Aún no hay reseñas. ¡Sé el primero en opinar!"
            : "Aún no hay reseñas."}
        </p>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwn={review.userId === currentUserId}
            onDelete={() => handleDelete(review)}
            deleting={deletingId === review.id}
          />
        ))}
      </div>
    </section>
  );
}

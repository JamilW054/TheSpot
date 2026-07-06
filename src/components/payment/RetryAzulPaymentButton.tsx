"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Reintenta el pago del MISMO pedido (sin recrear el carrito ni la orden):
 * auto-envía un form POST a `/api/pagos/azul/enviar` con el `orderId`, igual
 * que el checkout. El pedido ya existe y sigue disponible (nunca se marcó
 * pagado), así que AZUL simplemente vuelve a intentar el cobro sobre él.
 */
export function RetryAzulPaymentButton({
  orderId,
  label = "Intentar de nuevo",
  className = "",
}: {
  orderId: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    setLoading(true);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/pagos/azul/enviar";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "orderId";
    input.value = orderId;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-60 ${className}`.trim()}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Redirigiendo…
        </>
      ) : (
        label
      )}
    </button>
  );
}

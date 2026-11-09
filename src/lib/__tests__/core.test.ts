import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_MIN_CENTS,
  qualifiesForFreeShipping,
  resolveShippingCents,
} from "@/config/shipping";
import { sizeAxisLabel, variantKey } from "@/lib/variants";
import {
  buildCustomerOrderMessage,
  buildWhatsAppLink,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

describe("variantKey", () => {
  it("es case-insensitive y tolera ejes vacíos", () => {
    expect(variantKey("100ML", "Rojo")).toBe("100ml|rojo");
    expect(variantKey(null, null)).toBe("|");
    expect(variantKey(" M ", undefined)).toBe("m|");
  });
});

describe("sizeAxisLabel", () => {
  it("usa 'Tamaño' para ml y 'Talla' para el resto", () => {
    expect(sizeAxisLabel(["50ml", "100ml"]).noun).toBe("Tamaño");
    expect(sizeAxisLabel(["40", "41"]).noun).toBe("Talla");
  });
});

describe("whatsapp", () => {
  it("normaliza números de RD a formato internacional", () => {
    expect(normalizeWhatsAppNumber("809-761-2875")).toBe("18097612875");
    expect(normalizeWhatsAppNumber("+1 809 761 2875")).toBe("18097612875");
  });

  it("arma un enlace wa.me con el mensaje codificado", () => {
    const msg = buildCustomerOrderMessage({
      orderNumber: "A09B3EF2",
      customerName: "Ana",
      items: [{ name: "Noir", quantity: 2, size: "50ml" }],
      totalCents: 570000,
    });
    expect(msg).toContain("#A09B3EF2");
    expect(msg).toContain("Noir (50ml) x2");
    const url = buildWhatsAppLink("18097612875", msg);
    expect(url.startsWith("https://wa.me/18097612875?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe(msg);
  });
});

describe("envío", () => {
  it("es gratis desde el umbral", () => {
    expect(qualifiesForFreeShipping(FREE_SHIPPING_MIN_CENTS)).toBe(true);
    expect(resolveShippingCents(FREE_SHIPPING_MIN_CENTS - 1, 25000)).toBe(25000);
    expect(resolveShippingCents(FREE_SHIPPING_MIN_CENTS, 25000)).toBe(0);
  });
});

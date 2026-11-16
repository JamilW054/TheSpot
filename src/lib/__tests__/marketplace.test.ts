import { describe, expect, it } from "vitest";
import { groupByStore, partTotal, sumParts } from "@/lib/checkout/split";
import { findBlockedWords, slugifyStoreName } from "@/lib/stores/status";

describe("groupByStore", () => {
  it("agrupa por tienda conservando el orden y suma subtotales", () => {
    const groups = groupByStore([
      { storeId: "a", lineTotalCents: 100 },
      { storeId: "b", lineTotalCents: 50 },
      { storeId: "a", lineTotalCents: 25 },
    ]);
    expect(groups.map((g) => g.storeId)).toEqual(["a", "b"]);
    expect(groups[0].subtotalCents).toBe(125);
    expect(groups[0].lines).toHaveLength(2);
    expect(groups[1].subtotalCents).toBe(50);
  });
});

describe("partTotal / sumParts", () => {
  it("el descuento nunca supera el subtotal ni deja totales negativos", () => {
    expect(partTotal(1000, 5000, 200)).toEqual({
      subtotalCents: 1000,
      discountCents: 1000,
      shippingCents: 200,
      totalCents: 200,
    });
  });

  it("suma las partes de varias tiendas", () => {
    const total = sumParts([partTotal(1000, 100, 200), partTotal(500, 0, 0)]);
    expect(total).toEqual({
      subtotalCents: 1500,
      discountCents: 100,
      shippingCents: 200,
      totalCents: 1600,
    });
  });
});

describe("findBlockedWords", () => {
  const blocked = ["sexual", "juguete sexual", "réplica", "arma"];

  it("detecta palabras sin importar acentos ni mayúsculas", () => {
    expect(findBlockedWords("Perfume RÉPLICA de lujo", blocked)).toEqual([
      "réplica",
    ]);
    expect(findBlockedWords("Juguete Sexual nuevo", blocked)).toEqual(
      expect.arrayContaining(["juguete sexual", "sexual"]),
    );
  });

  it("solo cuenta palabras completas", () => {
    expect(findBlockedWords("Armario de madera, armadura", blocked)).toEqual(
      [],
    );
    expect(findBlockedWords("Tenis Nike Air", blocked)).toEqual([]);
  });
});

describe("slugifyStoreName", () => {
  it("genera slugs legibles", () => {
    expect(slugifyStoreName("Moda Bella RD!")).toBe("moda-bella-rd");
    expect(slugifyStoreName("Ñoño & Cía")).toBe("nono-cia");
  });
});

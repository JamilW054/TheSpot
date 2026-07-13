import { describe, expect, it } from "vitest";
import {
  assertPaymentWithinBalance,
  currentMonthStart,
  toMonthStart,
  validatePartnerInput,
  validatePartnerPaymentInput,
} from "./dto";
import { generatePaymentReference } from "./reference";
import {
  computePartnerDueCents,
  derivePartnerStatus,
  describePartnerBilling,
  type MonthlyProfitBases,
  type PartnerBillingConfig,
} from "./strategies";

/**
 * El caso real del negocio: G3DEON cobra el 12% de la ganancia. Estos tests
 * fijan la fórmula que la vista `partner_monthly_statements` replica en SQL —
 * si uno de los dos lados cambia sin el otro, esto salta.
 */

const bases: MonthlyProfitBases = {
  revenueCents: 100_000_000, // RD$1,000,000.00 procesado
  grossProfitCents: 100_000_000, // RD$1,000,000.00 de ganancia bruta
  netProfitCents: 95_000_000, // tras el 5% de AZUL
};

const g3deon: PartnerBillingConfig = {
  paymentType: "percentage",
  percentageRate: 12,
  percentageBase: "gross_profit",
  fixedAmountCents: null,
};

describe("computePartnerDueCents", () => {
  it("aplica el porcentaje sobre la ganancia bruta (caso G3DEON)", () => {
    // RD$1,000,000 × 12% = RD$120,000
    expect(computePartnerDueCents(g3deon, bases)).toBe(12_000_000);
  });

  it("aplica el porcentaje sobre la ganancia neta cuando esa es la base", () => {
    const onNet = { ...g3deon, percentageBase: "net_profit" as const };
    expect(computePartnerDueCents(onNet, bases)).toBe(11_400_000);
  });

  it("aplica el porcentaje sobre el ingreso procesado cuando esa es la base", () => {
    const onRevenue = { ...g3deon, percentageBase: "revenue" as const };
    expect(computePartnerDueCents(onRevenue, bases)).toBe(12_000_000);
  });

  it("no genera deuda si el mes cerró en pérdidas", () => {
    const losing: MonthlyProfitBases = {
      revenueCents: 0,
      grossProfitCents: -5_000_000,
      netProfitCents: -5_000_000,
    };
    expect(computePartnerDueCents(g3deon, losing)).toBe(0);
  });

  it("el monto fijo ignora por completo las cifras del mes", () => {
    const fixed: PartnerBillingConfig = {
      paymentType: "fixed",
      percentageRate: null,
      percentageBase: "gross_profit",
      fixedAmountCents: 500_000,
    };
    expect(computePartnerDueCents(fixed, bases)).toBe(500_000);
    expect(
      computePartnerDueCents(fixed, {
        revenueCents: 0,
        grossProfitCents: 0,
        netProfitCents: 0,
      }),
    ).toBe(500_000);
  });
});

describe("derivePartnerStatus", () => {
  it.each([
    [0, 0, "no_due"],
    [12_000_000, 0, "pending"],
    [12_000_000, 150_000, "partial"],
    [12_000_000, 12_000_000, "paid"],
    [12_000_000, 13_000_000, "overpaid"],
  ] as const)("deuda %i, pagado %i → %s", (due, paid, expected) => {
    expect(derivePartnerStatus(due, paid)).toBe(expected);
  });
});

describe("describePartnerBilling", () => {
  it("describe el porcentaje con su base", () => {
    expect(describePartnerBilling(g3deon)).toBe("12% de la ganancia bruta");
  });
});

describe("validatePartnerInput", () => {
  const base = {
    name: "  G3DEON  ",
    legalName: null,
    paymentType: "percentage" as const,
    percentageRate: 12,
    percentageBase: "gross_profit" as const,
    fixedAmountCents: null,
    startsOn: null,
    endsOn: null,
    active: true,
    notes: null,
  };

  it("normaliza el nombre", () => {
    expect(validatePartnerInput(base).name).toBe("G3DEON");
  });

  it("rechaza un socio de porcentaje sin tasa", () => {
    expect(() =>
      validatePartnerInput({ ...base, percentageRate: null }),
    ).toThrow(/porcentaje/i);
  });

  it("rechaza un socio de monto fijo sin importe", () => {
    expect(() =>
      validatePartnerInput({
        ...base,
        paymentType: "fixed",
        fixedAmountCents: null,
      }),
    ).toThrow(/monto fijo/i);
  });

  it("limpia el campo de la estrategia no elegida", () => {
    const out = validatePartnerInput({
      ...base,
      paymentType: "fixed",
      fixedAmountCents: 500_000,
      percentageRate: 12,
    });
    expect(out.percentageRate).toBeNull();
    expect(out.fixedAmountCents).toBe(500_000);
  });

  it("rechaza una ventana de devengo invertida", () => {
    expect(() =>
      validatePartnerInput({
        ...base,
        startsOn: "2026-07-01",
        endsOn: "2026-06-01",
      }),
    ).toThrow(/anterior/i);
  });
});

describe("validatePartnerPaymentInput", () => {
  const base = {
    partnerId: "b3f1c2d4-0000-4000-8000-000000000000",
    periodMonth: "2026-07",
    amountCents: 150_000,
    paymentDate: "2026-07-14",
    reference: null,
    notes: null,
  };

  it("normaliza el mes al día 1", () => {
    expect(validatePartnerPaymentInput(base).periodMonth).toBe("2026-07-01");
  });

  it("acepta importes negativos (reverso de un pago mal registrado)", () => {
    expect(
      validatePartnerPaymentInput({ ...base, amountCents: -150_000 })
        .amountCents,
    ).toBe(-150_000);
  });

  it("rechaza un importe de cero", () => {
    expect(() =>
      validatePartnerPaymentInput({ ...base, amountCents: 0 }),
    ).toThrow(/distinto de cero/i);
  });

  it("rechaza una fecha de pago inválida", () => {
    expect(() =>
      validatePartnerPaymentInput({ ...base, paymentDate: "14/07/2026" }),
    ).toThrow(/fecha de pago/i);
  });
});

describe("assertPaymentWithinBalance", () => {
  // Mes con RD$1,200.00 de deuda, de los que ya se pagaron RD$500.00.
  const limits = { dueCents: 120_000, paidCents: 50_000, balanceCents: 70_000 };

  it("acepta un pago igual al pendiente", () => {
    expect(() => assertPaymentWithinBalance(70_000, limits)).not.toThrow();
  });

  it("acepta un pago parcial", () => {
    expect(() => assertPaymentWithinBalance(1_000, limits)).not.toThrow();
  });

  it("rechaza un pago que supera el pendiente", () => {
    expect(() => assertPaymentWithinBalance(70_001, limits)).toThrow(/supera/i);
  });

  it("rechaza pagar cuando la deuda ya está saldada", () => {
    expect(() =>
      assertPaymentWithinBalance(1, {
        dueCents: 120_000,
        paidCents: 120_000,
        balanceCents: 0,
      }),
    ).toThrow(/saldada/i);
  });

  it("rechaza pagar un mes sin deuda devengada", () => {
    expect(() =>
      assertPaymentWithinBalance(1, {
        dueCents: 0,
        paidCents: 0,
        balanceCents: 0,
      }),
    ).toThrow(/no ha devengado/i);
  });

  it("acepta un reverso hasta lo pagado", () => {
    expect(() => assertPaymentWithinBalance(-50_000, limits)).not.toThrow();
  });

  it("rechaza un reverso mayor que lo pagado (dejaría 'pagado' negativo)", () => {
    expect(() => assertPaymentWithinBalance(-50_001, limits)).toThrow(
      /más de lo pagado/i,
    );
  });

  it("rechaza un reverso si no hay nada pagado", () => {
    expect(() =>
      assertPaymentWithinBalance(-1, {
        dueCents: 120_000,
        paidCents: 0,
        balanceCents: 120_000,
      }),
    ).toThrow(/no hay pagos/i);
  });
});

describe("generatePaymentReference", () => {
  it("incluye el mes que liquida", () => {
    expect(generatePaymentReference("2026-07-01")).toMatch(
      /^PGO-202607-[A-Z2-9]{6}$/,
    );
  });

  it("no usa caracteres ambiguos (I, L, O, U, 0, 1)", () => {
    for (let i = 0; i < 200; i++) {
      const suffix = generatePaymentReference("2026-07-01").split("-")[2];
      expect(suffix).not.toMatch(/[ILOU01]/);
    }
  });

  it("no se repite en la práctica", () => {
    const refs = new Set(
      Array.from({ length: 500 }, () => generatePaymentReference("2026-07-01")),
    );
    expect(refs.size).toBe(500);
  });
});

describe("helpers de mes", () => {
  it("toMonthStart acepta YYYY-MM y YYYY-MM-DD", () => {
    expect(toMonthStart("2026-07")).toBe("2026-07-01");
    expect(toMonthStart("2026-07-14")).toBe("2026-07-01");
    expect(toMonthStart("julio")).toBeNull();
  });

  it("currentMonthStart devuelve el día 1 del mes dominicano", () => {
    // 2026-08-01T02:00Z todavía es 31 de julio en Santo Domingo (UTC-4): el mes
    // en curso debe ser julio, no agosto. Esta es justo la clase de desfase que
    // haría que un pago se imputara al mes equivocado.
    expect(currentMonthStart(new Date("2026-08-01T02:00:00Z"))).toBe(
      "2026-07-01",
    );
    expect(currentMonthStart(new Date("2026-07-14T18:00:00Z"))).toBe(
      "2026-07-01",
    );
  });
});

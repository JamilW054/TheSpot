import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAzulReturnPayload, toAzulAmount } from "@/lib/payments/azul";

const mockedDb = vi.hoisted(() => ({
  getOrderPaymentSnapshotByOrderNumber: vi.fn(),
  updateOrderPaymentStatusFromGateway: vi.fn(),
}));

vi.mock("@/database/repositories", () => ({
  getOrderPaymentSnapshotByOrderNumber:
    mockedDb.getOrderPaymentSnapshotByOrderNumber,
  updateOrderPaymentStatusFromGateway:
    mockedDb.updateOrderPaymentStatusFromGateway,
}));

import { POST } from "./route";

function buildSignedPayload(input?: Partial<Record<string, string>>) {
  const payload = {
    ResponseCode: "00",
    AuthorizationCode: "123456",
    DateTime: "20260429120000",
    RRN: "987654321000",
    ISOCode: "00",
    ResponseMessage: "Aprobado",
    ErrorDescription: "",
    OrderNumber: "order-1",
    Amount: "245000",
    MerchantId: "merchant-123",
    TxnId: "AZUL-BUXXEP-20260429-AAAA11",
    ...input,
  };
  const signature = signAzulReturnPayload({
    orderNumber: payload.OrderNumber,
    amount: payload.Amount,
    authorizationCode: payload.AuthorizationCode,
    dateTime: payload.DateTime,
    responseCode: payload.ResponseCode,
    isoCode: payload.ISOCode,
    responseMessage: payload.ResponseMessage,
    errorDescription: payload.ErrorDescription,
    rrn: payload.RRN,
    secretKey: "secret-key-123",
  });
  return { ...payload, Signature: signature };
}

function buildRequest(payload: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    formData.append(key, value);
  }
  return new Request("http://localhost:3000/api/pagos/azul/retorno", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/pagos/azul/retorno", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AZUL_MERCHANT_ID = "merchant-123";
    process.env.AZUL_SECRET_KEY = "secret-key-123";
    delete process.env.AZUL_CLIENT_KEY;
    delete process.env.AZUL_AUTH_KEY;
    delete process.env.AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID;
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("procesa respuesta aprobada válida y redirige a éxito", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue({
      id: "order-1",
      total_cents: 245000,
      payment_provider: "AZUL",
      payment_status: "pending",
    });
    const request = buildRequest(buildSignedPayload({ ResponseCode: "00" }));
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/pagos/exitoso?orderId=order-1",
    );
    expect(mockedDb.updateOrderPaymentStatusFromGateway).toHaveBeenCalledTimes(
      1,
    );
    expect(mockedDb.updateOrderPaymentStatusFromGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        paymentStatus: "paid",
        provider: "AZUL",
        responseCode: "00",
      }),
    );
  });

  it("procesa respuesta rechazada válida y redirige a rechazo", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue({
      id: "order-1",
      total_cents: 245000,
      payment_provider: "AZUL",
      payment_status: "pending",
    });
    const request = buildRequest(
      buildSignedPayload({
        ResponseCode: "51",
        ResponseMessage: "Fondos insuficientes",
      }),
    );
    const response = await POST(request);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/pagos/rechazado?orderId=order-1&responseCode=51",
    );
    expect(mockedDb.updateOrderPaymentStatusFromGateway).toHaveBeenCalledTimes(
      1,
    );
    expect(mockedDb.updateOrderPaymentStatusFromGateway).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        paymentStatus: "declined",
        provider: "AZUL",
        responseCode: "51",
      }),
    );
  });

  it("rechaza firma inválida sin actualizar orden", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue({
      id: "order-1",
      total_cents: 245000,
      payment_provider: "AZUL",
      payment_status: "pending",
    });
    const payload = buildSignedPayload();
    payload.Signature = "BAD-SIGNATURE";
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(400);
    expect(mockedDb.updateOrderPaymentStatusFromGateway).not.toHaveBeenCalled();
  });

  it("rechaza MerchantId inválido sin actualizar orden", async () => {
    const payload = buildSignedPayload({ MerchantId: "other-merchant" });
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(400);
    expect(
      mockedDb.getOrderPaymentSnapshotByOrderNumber,
    ).not.toHaveBeenCalled();
    expect(mockedDb.updateOrderPaymentStatusFromGateway).not.toHaveBeenCalled();
  });

  it("rechaza monto no coincidente sin actualizar orden", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue({
      id: "order-1",
      total_cents: 255000,
      payment_provider: "AZUL",
      payment_status: "pending",
    });
    const payload = buildSignedPayload({ Amount: toAzulAmount(2450) });
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(400);
    expect(mockedDb.updateOrderPaymentStatusFromGateway).not.toHaveBeenCalled();
  });

  it("responde 404 cuando la orden no existe", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue(null);
    const response = await POST(buildRequest(buildSignedPayload()));
    expect(response.status).toBe(404);
    expect(mockedDb.updateOrderPaymentStatusFromGateway).not.toHaveBeenCalled();
  });

  it("mantiene idempotencia cuando la orden ya está paid", async () => {
    mockedDb.getOrderPaymentSnapshotByOrderNumber.mockResolvedValue({
      id: "order-1",
      total_cents: 245000,
      payment_provider: "AZUL",
      payment_status: "paid",
    });
    const response = await POST(
      buildRequest(buildSignedPayload({ ResponseCode: "00" })),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/pagos/exitoso?orderId=order-1",
    );
    expect(mockedDb.updateOrderPaymentStatusFromGateway).not.toHaveBeenCalled();
  });
});

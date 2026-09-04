import configs from "../../configs/env.config";

export interface CreatePaymentArgs {
  amountInToman: number;
}

export interface CreatePaymentResult {
  trackId: string;
  paymentUrl: string;
}

export interface VerifyPaymentArgs {
  trackId: string;
}

export interface VerifyPaymentResult {
  result: number;
  paidAt?: string;
  amount?: number;
  [key: string]: unknown;
}

const createPayment = async ({
  amountInToman,
}: CreatePaymentArgs): Promise<CreatePaymentResult> => {
  if (!Number.isFinite(amountInToman) || amountInToman <= 0) {
    throw new Error("Invalid payment amount");
  }

  const response = await fetch(`${configs.payment.zibal.baseUrl}request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: configs.payment.zibal.merchant,
      amount: Math.round(amountInToman * 10),
      callbackUrl: configs.payment.zibal.callbackUrl,
    }),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response received from Zibal request API");
  }

  if (!response.ok) {
    throw new Error(`Zibal request failed with status ${response.status}`);
  }

  if (typeof data !== "object" || data === null || !("trackId" in data)) {
    throw new Error("Invalid response received from Zibal request API");
  }

  const trackId = String((data as { trackId?: unknown }).trackId ?? "");

  if (!trackId) {
    throw new Error("Zibal did not return a valid trackId");
  }

  return {
    trackId,
    paymentUrl: `${configs.payment.zibal.paymentBaseUrl}${trackId}`,
  };
};

const verifyPayment = async ({
  trackId,
}: VerifyPaymentArgs): Promise<VerifyPaymentResult> => {
  if (!trackId?.trim()) {
    throw new Error("Track ID is required");
  }

  const response = await fetch(`${configs.payment.zibal.baseUrl}verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: configs.payment.zibal.merchant,
      trackId: trackId.trim(),
    }),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response received from Zibal verify API");
  }

  if (!response.ok) {
    throw new Error(`Zibal verify failed with status ${response.status}`);
  }

  if (typeof data !== "object" || data === null || !("result" in data)) {
    throw new Error("Invalid response received from Zibal verify API");
  }

  const result = Number((data as { result?: unknown }).result);

  if (!Number.isFinite(result)) {
    throw new Error("Zibal returned an invalid verification result");
  }

  return {
    ...(data as Record<string, unknown>),
    result,
  };
};

export { createPayment, verifyPayment };

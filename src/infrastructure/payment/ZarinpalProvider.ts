/**
 * Zarinpal REST integration (docs: https://docs.zarinpal.com/paymentGateway/).
 *
 * IMPORTANT — currency unit: this whole app stores/display amounts in **toman**, but
 * Zarinpal's classic `amount` field is in **rial** (1 toman = 10 rial) for most merchant
 * accounts. We multiply by 10 when calling Zarinpal and divide back when reading their
 * response. Double-check this against your real merchant account before going live —
 * Zarinpal has been migrating some accounts to toman-denominated amounts, and getting
 * this wrong is a real-money bug, not a cosmetic one.
 */

const RIAL_PER_TOMAN = 10;

export interface ZarinpalConfig {
  merchantId: string;
  sandbox: boolean;
}

export interface RequestPaymentInput {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
}

export interface RequestPaymentResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
}

export interface VerifyPaymentInput {
  amountToman: number;
  authority: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  refId?: string;
  alreadyVerified?: boolean;
  error?: string;
}

function baseUrl(sandbox: boolean): string {
  return sandbox ? 'https://sandbox.zarinpal.com' : 'https://api.zarinpal.com';
}

function startPayUrl(sandbox: boolean, authority: string): string {
  const host = sandbox ? 'https://sandbox.zarinpal.com' : 'https://www.zarinpal.com';
  return `${host}/pg/StartPay/${authority}`;
}

export class ZarinpalProvider {
  constructor(private readonly config: ZarinpalConfig) {}

  async requestPayment(input: RequestPaymentInput): Promise<RequestPaymentResult> {
    const response = await fetch(`${baseUrl(this.config.sandbox)}/pg/v4/payment/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.config.merchantId,
        amount: input.amountToman * RIAL_PER_TOMAN,
        description: input.description,
        callback_url: input.callbackUrl,
        metadata: input.mobile ? { mobile: input.mobile } : undefined,
      }),
    });

    const body = (await response.json()) as {
      data?: { code: number; authority: string; message: string };
      errors?: unknown;
    };

    if (!body.data || body.data.code !== 100) {
      return { success: false, error: body.data?.message ?? 'درخواست پرداخت زرین‌پال ناموفق بود.' };
    }

    return {
      success: true,
      authority: body.data.authority,
      paymentUrl: startPayUrl(this.config.sandbox, body.data.authority),
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const response = await fetch(`${baseUrl(this.config.sandbox)}/pg/v4/payment/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.config.merchantId,
        amount: input.amountToman * RIAL_PER_TOMAN,
        authority: input.authority,
      }),
    });

    const body = (await response.json()) as {
      data?: { code: number; ref_id?: number; message: string };
      errors?: unknown;
    };

    if (!body.data) {
      return { success: false, error: 'پاسخ نامعتبر از زرین‌پال.' };
    }

    if (body.data.code === 100) {
      return { success: true, refId: String(body.data.ref_id) };
    }
    if (body.data.code === 101) {
      return { success: true, alreadyVerified: true, refId: String(body.data.ref_id ?? '') };
    }

    return { success: false, error: body.data.message ?? 'تایید پرداخت ناموفق بود.' };
  }
}

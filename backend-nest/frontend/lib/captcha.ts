// Global grecaptcha declaration for v2 (visible checkbox)
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string, parameters: any) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

// Store widget ID globally
let recaptchaWidgetId: number | null = null;

export async function getCaptchaToken() {
  return new Promise<string | null>(resolve => {
    // Check if grecaptcha is available
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.log('⚠️ grecaptcha not available');
      resolve(null);
      return;
    }

    window.grecaptcha.ready(() => {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (!siteKey) {
        console.log('⚠️ No reCAPTCHA site key found');
        resolve(null);
        return;
      }
      
      try {
        // Get response from visible reCAPTCHA v2 checkbox
        const response = window.grecaptcha.getResponse(recaptchaWidgetId || undefined);
        console.log('🔐 reCAPTCHA v2 response:', response ? 'Valid' : 'Empty');
        resolve(response);
      } catch (error) {
        console.error('❌ Error getting reCAPTCHA response:', error);
        resolve(null);
      }
    });
  });
}

// Function to render the visible reCAPTCHA checkbox
export function renderRecaptcha(containerId: string, onVerified?: () => void, onExpired?: () => void, onError?: () => void): boolean {
  try {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.log('⚠️ grecaptcha not available for rendering');
      return false;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.log('⚠️ No reCAPTCHA site key found for rendering');
      return false;
    }

    window.grecaptcha.ready(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.log('⚠️ reCAPTCHA container not found');
        return;
      }

      console.log('🔐 Rendering visible reCAPTCHA v2 checkbox');
      recaptchaWidgetId = window.grecaptcha.render(containerId, {
        sitekey: siteKey,
        theme: 'light',
        size: 'normal',
        callback: (response: string) => {
          console.log('✅ reCAPTCHA verified successfully');
          if (onVerified) onVerified();
        },
        'expired-callback': () => {
          console.log('⚠️ reCAPTCHA expired');
          if (onExpired) onExpired();
        },
        'error-callback': () => {
          console.error('❌ reCAPTCHA error');
          if (onError) onError();
        }
      });
      
      console.log('🔐 reCAPTCHA widget rendered with ID:', recaptchaWidgetId);
    });

    return true;
  } catch (error) {
    console.error('❌ Error rendering reCAPTCHA:', error);
    return false;
  }
}

// Function to reset reCAPTCHA
export function resetRecaptcha() {
  if (typeof window !== 'undefined' && window.grecaptcha && recaptchaWidgetId !== null) {
    window.grecaptcha.reset(recaptchaWidgetId);
    console.log('🔄 reCAPTCHA reset');
  }
}

export async function verifyCaptchaToken(token: string) {
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error("No secret key found");
  }
  const url = new URL("https://www.google.com/recaptcha/api/siteverify");
  url.searchParams.append("secret", secretKey);
  url.searchParams.append("response", token);

  const res = await fetch(url, { method: "POST" });
  const captchaData: CaptchaData = await res.json();

  if (!res.ok) return null;

  return captchaData;
}

type CaptchaData =
  | {
      success: true;
      challenge_ts: string;
      hostname: string;
      score: number;
      action: string;
    }
  | {
      success: false;
      "error-codes": ErrorCodes[];
    };

type ErrorCodes =
  | "missing-input-secret"
  | "invalid-input-secret"
  | "missing-input-response"
  | "invalid-input-response"
  | "bad-request"
  | "timeout-or-duplicate";
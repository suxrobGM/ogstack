"use client";

interface GrecaptchaApi {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: GrecaptchaApi;
    };
  }
}

/** Executes reCAPTCHA Enterprise; returns an empty token when unconfigured. */
export function useRecaptcha(): { executeRecaptcha: (action: string) => Promise<string> } {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!siteKey || typeof window === "undefined" || !window.grecaptcha?.enterprise) {
      return "";
    }

    const enterprise = window.grecaptcha.enterprise;
    return new Promise<string>((resolve) => {
      enterprise.ready(() => {
        enterprise
          .execute(siteKey, { action })
          .then(resolve)
          .catch(() => resolve(""));
      });
    });
  };

  return { executeRecaptcha };
}

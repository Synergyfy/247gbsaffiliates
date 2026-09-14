/**
 * Central Hub Solutions frontend URLs.
 *
 * Single source of truth for all links pointing at the Central Hub
 * marketing/auth frontend (register, login, pricing). Driven by
 * `NEXT_PUBLIC_CENTRAL_HUB_URL` so local / staging / prod are just
 * env changes — never hardcode `centralhubsolution.com` in components.
 */

const PROD_FALLBACK = 'https://centralhubsolution.com';

function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_CENTRAL_HUB_URL?.trim() || PROD_FALLBACK;
  return raw.replace(/\/$/, '');
}

/** e.g. https://centralhubsolution.com/register/affiliate (or local equiv). */
export function getAffiliateRegisterUrl(): string {
  return `${baseUrl()}/register/affiliate`;
}

/** Base Central Hub frontend URL (for login links, etc). */
export function getCentralHubUrl(): string {
  return baseUrl();
}

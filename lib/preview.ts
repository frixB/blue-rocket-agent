/**
 * Review-only states (`?preview=sent`, `?view=empty`) are shown locally and on
 * preview deploys with the state gallery switched on, never in production.
 */
export const previewEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_STATE_GALLERY === "true";

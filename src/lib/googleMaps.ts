/**
 * Google Maps configuration helper.
 *
 * The key is read from the Vite environment variable
 * `VITE_GOOGLE_MAPS_API_KEY`.
 *
 * SECURITY NOTE: Vite `VITE_*` variables are embedded into the client bundle
 * and are therefore publicly visible in the browser. This is expected for the
 * Google Maps JavaScript / Places APIs, but you MUST restrict the key in the
 * Google Cloud Console (HTTP referrer + API restrictions) so it can only be
 * used from your own domains.
 */

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/** Returns the Google Maps API key, or `null` when not configured. */
export function getGoogleMapsApiKey(): string | null {
  return apiKey && apiKey.trim() ? apiKey.trim() : null;
}

/** True when a Google Maps API key is available. */
export function isGoogleMapsConfigured(): boolean {
  return getGoogleMapsApiKey() !== null;
}

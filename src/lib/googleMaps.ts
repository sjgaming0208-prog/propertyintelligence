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

const SCRIPT_ID = "google-maps-js";
let loaderPromise: Promise<boolean> | null = null;

/**
 * Lazily load the Google Maps JavaScript API (once).
 *
 * Resolves `true` when the API is ready to use, or `false` when no key is
 * configured or the script fails to load. Safe to call multiple times.
 */
export function loadGoogleMaps(): Promise<boolean> {
  if (loaderPromise) return loaderPromise;

  const key = getGoogleMapsApiKey();
  if (!key || typeof window === "undefined" || typeof document === "undefined") {
    loaderPromise = Promise.resolve(false);
    return loaderPromise;
  }

  loaderPromise = new Promise<boolean>((resolve) => {
    if (window.google?.maps) {
      resolve(true);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js?" +
      new URLSearchParams({
        key,
        libraries: "places",
        loading: "async",
        v: "weekly",
      }).toString();
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

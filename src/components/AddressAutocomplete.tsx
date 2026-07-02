import { useEffect, useId, useRef, useState } from "react";
import { loadGoogleMaps } from "../lib/googleMaps";

/** Parsed address fields extracted from a selected place. */
export interface SelectedAddress {
  postcode: string;
  houseNumber: string;
  formatted: string;
}

interface AddressAutocompleteProps {
  label: string;
  /** Current text value of the input (controlled by the parent). */
  value: string;
  /** Fired on every keystroke. */
  onChange: (value: string) => void;
  /** Fired when the user picks a suggestion, with parsed address fields. */
  onSelect: (address: SelectedAddress) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

interface Suggestion {
  id: string;
  primary: string;
  secondary: string;
  prediction: google.maps.places.PlacePrediction;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

/**
 * AddressAutocomplete — a controlled text input backed by the Google Places
 * Autocomplete (New) API. It renders a custom, styled suggestion dropdown and,
 * on selection, extracts the postcode and house number.
 *
 * Degrades gracefully to a plain text input when no Google Maps key is
 * configured or the API fails to load.
 */
export default function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  required = false,
  hint,
}: AddressAutocompleteProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;

  const [ready, setReady] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the Maps API and the Places library once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(async (ok) => {
      if (!ok || cancelled) return;
      try {
        const lib = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;
        if (cancelled) return;
        placesLibRef.current = lib;
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
        setReady(true);
      } catch {
        // Leave `ready` false so we fall back to a plain input.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = (input: string) => {
    const lib = placesLibRef.current;
    if (!lib || !input.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: sessionTokenRef.current ?? undefined,
      includedRegionCodes: ["gb"],
    })
      .then(({ suggestions: results }) => {
        const mapped: Suggestion[] = results
          .filter((s) => s.placePrediction)
          .map((s) => {
            const p = s.placePrediction as google.maps.places.PlacePrediction;
            return {
              id: p.placeId,
              primary: p.mainText?.text ?? p.text.text,
              secondary: p.secondaryText?.text ?? "",
              prediction: p,
            };
          });
        setSuggestions(mapped);
        setActiveIndex(-1);
        setOpen(mapped.length > 0);
      })
      .catch(() => {
        setSuggestions([]);
        setOpen(false);
      });
  };

  const handleInput = (next: string) => {
    onChange(next);
    if (!ready) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 250);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setOpen(false);
    const lib = placesLibRef.current;
    if (!lib) return;

    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress"],
      });

      const components = place.addressComponents ?? [];
      const find = (type: string) =>
        components.find((c) => c.types.includes(type));

      const postcode = find("postal_code")?.longText ?? "";
      const streetNumber = find("street_number")?.longText ?? "";
      const premise = find("premise")?.longText ?? "";
      const houseNumber = streetNumber || premise || suggestion.primary;

      onSelect({
        postcode: postcode.toUpperCase(),
        houseNumber,
        formatted: place.formattedAddress ?? suggestion.primary,
      });

      // Start a fresh session after a selection (billing best practice).
      sessionTokenRef.current = new lib.AutocompleteSessionToken();
    } catch {
      // If field fetching fails, fall back to the prediction text only.
      onChange(suggestion.primary);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        if (activeIndex >= 0) {
          event.preventDefault();
          void handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-emerald-500">*</span>}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          id={id}
          type="text"
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onChange={(event) => handleInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className={`${INPUT_CLASS} pl-9`}
        />

        {open && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
          >
            {suggestions.map((s, index) => (
              <li key={s.id} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    // Prevent the input from blurring before the click lands.
                    event.preventDefault();
                    void handleSelect(s);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-start gap-2.5 px-3.5 py-2 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {s.primary}
                    </span>
                    {s.secondary && (
                      <span className="block truncate text-xs text-slate-500">
                        {s.secondary}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

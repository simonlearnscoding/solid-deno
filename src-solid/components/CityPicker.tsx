// components/CityPicker.tsx
import { createSignal, For, Show, onCleanup, onMount } from "solid-js";
import { searchCities } from "../hooks/useCitySearch.ts";
import { CITIES, type City } from "../data/cities.ts";

type Props = {
  selected?: City | null; // <- NEW: show selected city
  onPick: (city: City) => void;
};

export default function CityPicker(props: Props) {
  const [open, setOpen] = createSignal(false);
  const [q, setQ] = createSignal("");
  const [locating, setLocating] = createSignal(false);
  const results = () => searchCities(q());

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // radius of Earth in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function pickNearestCity(lng: number, lat: number) {
    let best = CITIES[0];
    let bestD = Infinity;
    for (const c of CITIES) {
      const d = haversine(lat, lng, c.center.lat, c.center.lng);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    props.onPick(best);
    setOpen(false);
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pickNearestCity(pos.coords.longitude, pos.coords.latitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  // close dropdown on outside click
  let rootEl: HTMLDivElement | undefined;
  function onDocClick(e: MouseEvent) {
    if (!rootEl) return;
    if (!rootEl.contains(e.target as Node)) setOpen(false);
  }
  onMount(() => document.addEventListener("mousedown", onDocClick));
  onCleanup(() => document.removeEventListener("mousedown", onDocClick));

  const selectedLabel = () =>
    props.selected
      ? `${props.selected.name}, ${props.selected.country}`
      : "Choose location";

  return (
    <div class="relative " ref={rootEl}>
      {/* Button that always shows current city */}
      <button
        class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-base-200"
        onClick={() => {
          setOpen((v) => !v);
          if (!open()) setQ("");
        }}
        aria-haspopup="listbox"
        aria-expanded={open()}
      >
        {/* location pin */}
        <svg width="16" height="16" viewBox="0 0 24 24" class="opacity-70">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
        </svg>
        <span class="truncate max-w-[12rem]">{selectedLabel()}</span>
        {/* chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          class={`transition-transform ${open() ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      <Show when={open()}>
        <div class="absolute z-50 mt-2 w-80 rounded-xl bg-base-100 p-3 shadow">
          {/* Header: shows current city */}
          <Show when={props.selected}>
            <div class="mb-2 text-xs opacity-70">
              Selected: <span class="font-medium">{selectedLabel()}</span>
            </div>
          </Show>

          <div class="flex gap-2 mb-2">
            <input
              class="input input-sm input-bordered w-full"
              placeholder="Search city…"
              value={q()}
              onInput={(e) => setQ(e.currentTarget.value)}
            />
            <button
              class="btn btn-sm btn-square"
              onClick={useMyLocation}
              disabled={locating()}
              title="Use my location"
            >
              {locating() ? (
                // spinner (daisyUI or your own)
                <span class="loading loading-spinner loading-sm"></span>
              ) : (
                // location target icon
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 5.66-1.41-1.41M6.46 6.46 5.05 5.05m12.02 0-1.41 1.41M6.46 17.54l-1.41 1.41"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

          <div class="max-h-64 overflow-auto">
            <For each={results()}>
              {(c) => {
                const isActive = props.selected?.slug === c.slug;
                return (
                  <button
                    class={`w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 ${isActive ? "bg-base-200 font-medium" : ""}`}
                    onClick={() => {
                      props.onPick(c);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        class="opacity-70"
                      >
                        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                      </svg>
                      <span class="truncate">
                        {c.name}, {c.country}
                      </span>
                    </div>
                  </button>
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

import { createSignal, For } from "solid-js";

const PRESETS = {
  Zürich: { lng: 8.5417, lat: 47.3769 },
  Lugano: { lng: 8.9511, lat: 46.0037 },
};

export default function CourseLocationBar(props: {
  onPick: (c: { lng: number; lat: number }) => void;
}) {
  const [locating, setLocating] = createSignal(false);
  const useMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        props.onPick({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div class="flex gap-2 flex-wrap items-center mb-3">
      <button class="btn btn-sm" onClick={useMyLocation} disabled={locating()}>
        {locating() ? "Locating…" : "Use my location"}
      </button>
      <For each={Object.entries(PRESETS)}>
        {([name, c]) => (
          <button class="btn btn-sm btn-ghost" onClick={() => props.onPick(c)}>
            {name}
          </button>
        )}
      </For>
    </div>
  );
}

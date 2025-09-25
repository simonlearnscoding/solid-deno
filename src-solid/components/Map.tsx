// components/MapInitProbe.tsx
import { onMount, createEffect } from "solid-js";

type Bounds = { swLng: number; swLat: number; neLng: number; neLat: number };
type LngLat = { lng: number; lat: number };

const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
} as const;

export default function MapInitProbe(props: {
  center?: () => LngLat; // accessor, optional (defaults below)
  zoom?: number; // optional (default 11)
  onBoundsChanged?: (b: Bounds) => void;
}) {
  let el!: HTMLDivElement;
  let map: any; // maplibregl.Map after init
  let maplibregl: any; // module default after dynamic import

  onMount(async () => {
    const mod = await import("https://esm.sh/maplibre-gl@3.6.2");
    maplibregl = (mod as any).default ?? mod;

    // Worker for esm.sh build
    maplibregl.workerClass = class extends Worker {
      constructor() {
        super(
          "https://esm.sh/maplibre-gl@3.6.2/dist/maplibre-gl-csp-worker.js",
          { type: "module" },
        );
      }
    };

    const c = props.center ? props.center() : { lng: 8.95, lat: 46.17 };

    map = new maplibregl.Map({
      container: el,
      style: OSM_RASTER_STYLE,
      center: [c.lng, c.lat],
      zoom: props.zoom ?? 11,
      attributionControl: true,
    });

    const emit = () => {
      if (!props.onBoundsChanged) return;
      const b = map.getBounds();
      props.onBoundsChanged({
        swLng: b.getWest(),
        swLat: b.getSouth(),
        neLng: b.getEast(),
        neLat: b.getNorth(),
      });
    };

    map.on("error", (e: any) =>
      console.error("[probe] map error:", e?.error || e),
    );
    map.on("load", () => {
      // first bounds emit + ensure correct size
      emit();
      requestAnimationFrame(() => map.resize());
    });

    let t: number | undefined;
    map.on("moveend", () => {
      if (t) clearTimeout(t);
      t = window.setTimeout(emit, 150);
    });
  });

  // recenter when center() accessor changes
  createEffect(() => {
    if (!map || !props.center) return;
    const c = props.center();
    map.jumpTo({ center: [c.lng, c.lat] });
  });

  return <div ref={el!} class="w-full h-full" />;
}

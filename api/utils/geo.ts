
// utils/geo.ts
export function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function toFeatureCollection(docs: any[]) {
  return {
    type: "FeatureCollection",
    features: docs.map((d) => ({
      type: "Feature",
      geometry: d.location, // { type: "Point", coordinates: [lng,lat] }
      properties: {
        id: d.id ?? d._id?.toString(),
        title: d.title,
        imageUrl: d.imageUrl,
        city: d.city,
        distance: d.distance, // present only for /near
      },
    })),
  } as const;
}

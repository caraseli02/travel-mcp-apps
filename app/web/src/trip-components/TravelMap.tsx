import React from "react";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import { TripShell } from "./TripShell";
import {
  categoryLabels,
  CategoryFilters,
  isTravelError,
  OptionDetail,
  selectedOrFirst,
  uniqueValues,
} from "./travel-shared";
import { useCallTool } from "../bridge/useCallTool";
import type { ErrorOutput, TravelOption, TravelOptionsData } from "./types";
import { useWidgetState } from "./useWidgetState";

const BUILD_MAPBOX_ACCESS_TOKEN =
  (import.meta as unknown as { env?: { VITE_MAPBOX_ACCESS_TOKEN?: string } }).env?.VITE_MAPBOX_ACCESS_TOKEN ?? "";

type MapboxModule = typeof import("mapbox-gl");

export function TravelMap({ data }: { data: TravelOptionsData | ErrorOutput }) {
  const [category, setCategory] = useWidgetState("travel-map:category", "all");
  const [selectedId, setSelectedId] = useWidgetState<string | null>("travel-map:selected-id", null);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const { sendFollowUpMessage } = useCallTool();
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapboxRef = React.useRef<MapboxModule | null>(null);
  const mapRef = React.useRef<MapboxMap | null>(null);
  const markerRefs = React.useRef<MapboxMarker[]>([]);
  const error = isTravelError(data);
  const options = React.useMemo(
    () => (error ? [] : (data.options ?? []).filter((option) => option.coordinates)),
    [data, error],
  );
  const filtered = React.useMemo(
    () => options.filter((option) => category === "all" || option.category === category),
    [category, options],
  );
  const selected = selectedOrFirst(filtered, selectedId);
  const markerOptions = React.useMemo(
    () => filtered.filter((option) => option.coordinates?.lat != null && option.coordinates?.lon != null),
    [filtered],
  );
  const mapboxAccessToken = error ? "" : data.mapbox_access_token || BUILD_MAPBOX_ACCESS_TOKEN;
  const showFallbackMap = mapError || !mapboxAccessToken || markerOptions.length === 0;

  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxAccessToken || markerOptions.length === 0) return;

    let cancelled = false;
    let resize: (() => void) | null = null;

    const initializeMap = async () => {
      try {
        const mapboxModule = await import("mapbox-gl");
        if (cancelled || !mapContainerRef.current) return;
        mapboxModule.default.accessToken = mapboxAccessToken;
        mapboxRef.current = mapboxModule;
        const first = markerOptions[0]?.coordinates;
        const map = new mapboxModule.default.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: first?.lon != null && first?.lat != null ? [first.lon, first.lat] : [4.8952, 52.3702],
          zoom: 12,
          attributionControl: false,
        });
        map.addControl(new mapboxModule.default.NavigationControl({ showCompass: false }), "top-right");
        map.on("error", () => setMapError("Map tiles are unavailable, showing a local map preview."));
        mapRef.current = map;
        setMapReady(true);
        requestAnimationFrame(() => map.resize());
        resize = () => map.resize();
        window.addEventListener("resize", resize);
      } catch (error) {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "Map failed to initialize.");
        }
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;
      if (resize) window.removeEventListener("resize", resize);
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
      setMapReady(false);
    };
  }, [mapboxAccessToken, markerOptions]);

  React.useEffect(() => {
    const map = mapRef.current;
    const mapboxModule = mapboxRef.current;
    if (!mapReady || !map || !mapboxModule) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
    markerOptions.forEach((option) => {
      if (option.coordinates?.lon == null || option.coordinates.lat == null) return;
      const marker = new mapboxModule.default.Marker({ color: option.id === selected?.id ? "#111111" : "#F46C21" })
        .setLngLat([option.coordinates.lon, option.coordinates.lat])
        .addTo(map);
      marker.getElement().style.cursor = "pointer";
      marker.getElement().addEventListener("click", () => setSelectedId(option.id));
      markerRefs.current.push(marker);
    });

    const boundsCoordinates = markerOptions
      .map((option) => option.coordinates)
      .filter((coords) => coords?.lon != null && coords.lat != null)
      .map((coords) => [coords!.lon!, coords!.lat!] as [number, number]);
    if (boundsCoordinates.length === 1) {
      map.flyTo({ center: boundsCoordinates[0], zoom: 13 });
    } else if (boundsCoordinates.length > 1) {
      const bounds = boundsCoordinates.reduce(
        (currentBounds, coord) => currentBounds.extend(coord),
        new mapboxModule.default.LngLatBounds(boundsCoordinates[0], boundsCoordinates[0]),
      );
      map.fitBounds(bounds, { padding: 72, animate: true, maxZoom: 13 });
    }
  }, [mapReady, markerOptions, selected?.id, setSelectedId]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || selected?.coordinates?.lon == null || selected.coordinates.lat == null) return;
    map.flyTo({
      center: [selected.coordinates.lon, selected.coordinates.lat],
      zoom: 14,
      speed: 1.2,
      curve: 1.6,
    });
  }, [mapReady, selected?.id]);

  if (error) {
    return (
      <TripShell eyebrow="Map" title="Travel Map" error={data.error}>
        {null}
      </TripShell>
    );
  }

  const tripTitle = data.trip?.destination
    ? `${data.trip.destination} planning map`
    : data.trip?.title
      ? `${data.trip.title} map`
      : "Trip planning map";

  return (
    <TripShell
      eyebrow="Map"
      title={tripTitle}
      description="Use mapped pins to understand tradeoffs between stays, food, activities, and transit."
      empty={options.length === 0}
      emptyTitle="No mapped places"
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        <div className="border-b border-[var(--color-border)] p-4">
          <CategoryFilters value={category} options={uniqueValues(options, "category")} onChange={setCategory} />
        </div>
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="relative min-h-[420px] overflow-hidden bg-[#e6f0ec]">
            {showFallbackMap ? (
              <FallbackTravelMap options={filtered} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
            ) : null}
            <div
              ref={mapContainerRef}
              className={`absolute inset-0 ${showFallbackMap ? "opacity-0" : "opacity-100"}`}
              style={{ position: "absolute", inset: 0 }}
            />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary shadow-sm">
              {showFallbackMap ? "Local map preview" : "Live Mapbox preview"}
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] p-4 md:border-l md:border-t-0">
            <OptionDetail
              option={selected}
              action="Focus route"
              secondaryAction="Add stop"
              onAction={() => {
                if (selected) sendFollowUpMessage(`Focus route around ${selected.title}.`);
              }}
              onSecondaryAction={() => {
                if (selected) sendFollowUpMessage(`Add ${selected.title} as a stop.`);
              }}
            />
            <div className="mt-3 grid gap-2">
              {filtered.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setSelectedId(option.id)}
                  className={`rounded-lg border p-2 text-left text-xs transition ${
                    selected?.id === option.id
                      ? "border-[var(--color-border-primary-outline)] bg-secondary"
                      : "border-[var(--color-border)] bg-primary"
                  }`}
                >
                  <span className="font-semibold text-primary">{option.title}</span>
                  <span className="block text-secondary">{option.neighborhood}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>
    </TripShell>
  );
}

function FallbackTravelMap({
  options,
  selectedId,
  onSelect,
}: {
  options: TravelOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[12%] top-[22%] h-[1px] w-[80%] rotate-[-18deg] bg-[#9fb8ac]" />
        <div className="absolute left-[8%] top-[58%] h-[1px] w-[90%] rotate-[10deg] bg-[#9fb8ac]" />
        <div className="absolute left-[42%] top-0 h-full w-[1px] rotate-[24deg] bg-[#b9c9c0]" />
        <div className="absolute left-[66%] top-0 h-full w-[1px] rotate-[-12deg] bg-[#b9c9c0]" />
      </div>
      {options.map((option) => {
        const active = selectedId === option.id;
        return (
          <button
            type="button"
            key={option.id}
            aria-label={`Select ${option.title} on map`}
            onClick={() => onSelect(option.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition ${
              active ? "border-black bg-black text-white" : "border-white bg-white text-primary hover:bg-secondary"
            }`}
            style={{
              left: `${option.coordinates?.x ?? 50}%`,
              top: `${option.coordinates?.y ?? 50}%`,
            }}
          >
            {categoryLabels[option.category]?.slice(0, 1) ?? "P"}
          </button>
        );
      })}
    </div>
  );
}

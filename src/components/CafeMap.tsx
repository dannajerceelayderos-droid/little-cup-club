"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker as MLMarker, StyleSpecification } from "maplibre-gl";
import type { Cafe } from "@/lib/types";
import { MAPBOX_TOKEN, MAP_STYLE_URL } from "@/lib/config";
import { markerSvg } from "./illustrations";
import { Icon } from "./Icon";

export interface MapView {
  lat: number;
  lng: number;
  zoom: number;
}

export interface MapFocus extends MapView {
  key: number;
}

interface Props {
  cafes: Cafe[];
  selectedId?: string | null;
  /** Highlighted (e.g. hovered card) without moving the map. */
  highlightId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (v: { bbox: [number, number, number, number]; center: MapView }) => void;
  initialView: MapView;
  focus?: MapFocus | null;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  interactive?: boolean;
  extraAttribution?: string;
  label?: string;
}

function markerLook(c: Cafe): { fill: string; glyph: "cup" | "matcha" | "leaf" | "book" } {
  if (c.moods.includes("matcha") || (c.amenities.includes("matcha") && !c.amenities.includes("coffee")))
    return { fill: "#C9D9BD", glyph: "matcha" };
  if (c.moods.includes("study")) return { fill: "#F6E7A9", glyph: "book" };
  if (c.moods.includes("garden")) return { fill: "#A9C09A", glyph: "leaf" };
  return { fill: "#DFAE91", glyph: "cup" };
}

/** Recolour the free vector basemap so it reads like a soft, hand-tinted storybook map. */
function storybookify(map: MLMap) {
  const set = (id: string, prop: string, val: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.setPaintProperty(id, prop as any, val);
    } catch {
      /* property not applicable to this layer */
    }
  };
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    if (layer.type === "background") set(layer.id, "background-color", "#FBF4E6");
    else if (layer.type === "fill") {
      if (id.includes("water")) set(layer.id, "fill-color", "#CFE1DC");
      else if (/park|wood|grass|forest|landcover|green|cemetery|golf|pitch/.test(id)) set(layer.id, "fill-color", "#DDE8D2");
      else if (id.includes("building")) {
        set(layer.id, "fill-color", "#F3E2C6");
        set(layer.id, "fill-outline-color", "#E2C9A8");
      } else if (/residential|landuse/.test(id)) set(layer.id, "fill-color", "#F8EEDC");
      else if (/sand|beach/.test(id)) set(layer.id, "fill-color", "#FBF2CF");
    } else if (layer.type === "line") {
      if (id.includes("water") || id.includes("river") || id.includes("stream")) set(layer.id, "line-color", "#B7D3CC");
      else if (id.includes("casing")) set(layer.id, "line-color", "#E5CFB6");
      else if (/road|highway|street|bridge|tunnel|path|minor|major|motorway|trunk|primary|secondary|tertiary/.test(id))
        set(layer.id, "line-color", /motorway|trunk|primary/.test(id) ? "#F6E7A9" : "#FFFFFF");
      else if (id.includes("boundary") || id.includes("admin")) set(layer.id, "line-color", "#C9A88A");
      else if (id.includes("rail")) set(layer.id, "line-color", "#C8BBA6");
    } else if (layer.type === "symbol") {
      set(layer.id, "text-color", id.includes("water") ? "#5E8A80" : "#5C4E3D");
      set(layer.id, "text-halo-color", "#FFF9EE");
      set(layer.id, "text-halo-width", 1.4);
      set(layer.id, "icon-opacity", 0.75);
      try {
        if (map.getLayoutProperty(layer.id, "text-field"))
          map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]]);
      } catch {
        /* layer without text */
      }
    }
  }
}

function mapboxRasterStyle(token: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      mapbox: {
        type: "raster",
        tiles: [`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`],
        tileSize: 256,
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#FBF4E6" } },
      { id: "mapbox", type: "raster", source: "mapbox", paint: { "raster-saturation": -0.35, "raster-opacity": 0.92 } },
    ],
  };
}

export function CafeMap({
  cafes,
  selectedId,
  highlightId,
  onSelect,
  onMove,
  initialView,
  focus,
  userLocation,
  className,
  interactive = true,
  extraAttribution,
  label = "Interactive café map",
}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const markers = useRef(new Map<string, { m: MLMarker; el: HTMLElement }>());
  const youMarker = useRef<MLMarker | null>(null);
  const attribCtl = useRef<unknown>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const onSelectRef = useRef(onSelect);
  const onMoveRef = useRef(onMove);
  onSelectRef.current = onSelect;
  onMoveRef.current = onMove;

  // init
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      const m = new ml.Map({
        container: el.current,
        style: MAPBOX_TOKEN ? mapboxRasterStyle(MAPBOX_TOKEN) : MAP_STYLE_URL,
        center: [initialView.lng, initialView.lat],
        zoom: initialView.zoom,
        attributionControl: false,
        interactive,
        cooperativeGestures: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
      m.touchZoomRotate.disableRotation();
      map.current = m;
      if (interactive) m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      const ac = new ml.AttributionControl({ compact: true, customAttribution: extraAttribution });
      attribCtl.current = ac;
      m.addControl(ac, "bottom-right");

      timeout = setTimeout(() => {
        if (!m.isStyleLoaded()) setStatus((s) => (s === "loading" ? "error" : s));
      }, 15000);
      m.on("style.load", () => {
        if (!MAPBOX_TOKEN) storybookify(m);
      });
      m.on("load", () => {
        clearTimeout(timeout);
        setStatus("ready");
      });
      m.on("error", (e) => {
        // Only a failed style is fatal; individual tile errors are tolerated.
        if (!m.isStyleLoaded() && String(e?.error?.message ?? "").length) setStatus("error");
      });
      const emit = () => {
        const b = m.getBounds();
        const c = m.getCenter();
        onMoveRef.current?.({
          bbox: [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()],
          center: { lat: c.lat, lng: c.lng, zoom: m.getZoom() },
        });
      };
      m.on("moveend", emit);
      m.once("load", emit);
      m.on("click", (e) => {
        const t = e.originalEvent.target as HTMLElement;
        if (!t.closest(".cup-marker")) onSelectRef.current?.(null);
      });
    })();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // markers
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let alive = true;
    (async () => {
      const ml = await import("maplibre-gl");
      if (!alive) return;
      const keep = new Set(cafes.map((c) => c.id));
      for (const [id, { m: mk }] of markers.current) {
        if (!keep.has(id)) {
          mk.remove();
          markers.current.delete(id);
        }
      }
      for (const c of cafes) {
        if (markers.current.has(c.id)) continue;
        const look = markerLook(c);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cup-marker";
        btn.setAttribute("aria-label", `${c.name}${c.source === "sample" ? " (sample café)" : ""}${c.city ? `, ${c.city}` : ""}`);
        btn.innerHTML = markerSvg(look.fill, look.glyph);
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectRef.current?.(c.id);
        });
        const mk = new ml.Marker({ element: btn, anchor: "bottom" }).setLngLat([c.lng, c.lat]).addTo(m);
        markers.current.set(c.id, { m: mk, el: btn });
      }
    })();
    return () => {
      alive = false;
    };
  }, [cafes, status]);

  // selection
  useEffect(() => {
    for (const [id, { el: e }] of markers.current) {
      e.dataset.selected = id === selectedId || id === highlightId ? "true" : "false";
      e.setAttribute("aria-pressed", id === selectedId ? "true" : "false");
    }
    const sel = selectedId ? cafes.find((c) => c.id === selectedId) : null;
    const m = map.current;
    if (sel && m) {
      const b = m.getBounds();
      if (!b.contains([sel.lng, sel.lat])) m.easeTo({ center: [sel.lng, sel.lat], duration: 600 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, cafes, status]);

  useEffect(() => {
    for (const [id, { el: e }] of markers.current) {
      e.dataset.selected = id === selectedId || id === highlightId ? "true" : "false";
    }
  }, [highlightId, selectedId]);

  // fly to focus
  useEffect(() => {
    if (focus && map.current) {
      map.current.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom, duration: 1400, essential: false });
    }
  }, [focus]);

  // user location
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    youMarker.current?.remove();
    youMarker.current = null;
    if (!userLocation) return;
    (async () => {
      const ml = await import("maplibre-gl");
      const d = document.createElement("div");
      d.setAttribute("aria-label", "Your location");
      d.innerHTML =
        '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#7B8767;border:3px solid #FFF9EE;box-shadow:0 0 0 6px rgba(123,135,103,.25)"></span>';
      youMarker.current = new ml.Marker({ element: d }).setLngLat([userLocation.lng, userLocation.lat]).addTo(m);
    })();
  }, [userLocation, status]);

  return (
    <div className={`map-paper relative isolate overflow-hidden ${className ?? ""}`} role="region" aria-label={label}>
      <div ref={el} className="absolute inset-0" />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center bg-cream-deep/60">
          <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold shadow-card">
            <Icon name="compass" className="animate-spin [animation-duration:3s]" /> Unfolding the map…
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-[4] grid place-items-center bg-cream-deep p-6 text-center">
          <div className="max-w-sm space-y-2">
            <Icon name="map" size={32} className="mx-auto text-olive" />
            <p className="font-display text-lg font-semibold">The map tiles didn&apos;t load</p>
            <p className="text-sm text-ink-soft">
              This can happen offline or if the map provider is blocked. You can still browse every café in list view.
              Site owners can configure a Mapbox token in <code className="rounded bg-butter px-1">.env</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

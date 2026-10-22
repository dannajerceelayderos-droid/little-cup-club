"use client";

import type { Amenity, Ambiance, Price } from "@/lib/types";
import { AMBIANCE_LABELS, AMENITY_LABELS, countActive, EMPTY_FILTERS, type Filters } from "@/lib/filters";
import { REGIONS, type RegionKey } from "@/lib/places";
import { Icon, AMENITY_ICONS } from "./Icon";

const FILTER_AMENITIES: Amenity[] = ["coffee", "matcha", "wifi", "outlets", "study", "outdoor", "garden", "pets", "pastries", "aircon"];
const PRICES: Price[] = [1, 2, 3, 4];

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function FilterPanel({
  value,
  onChange,
  priceAvailable = true,
  ambianceAvailable = true,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  priceAvailable?: boolean;
  ambianceAvailable?: boolean;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="label">City &amp; region</legend>
        <select
          className="field"
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value as RegionKey | "all" })}
        >
          <option value="all">Anywhere in the Philippines</option>
          {(Object.keys(REGIONS) as RegionKey[]).map((k) => (
            <option key={k} value={k}>{REGIONS[k].name}</option>
          ))}
        </select>
      </fieldset>

      <fieldset>
        <legend className="label">Price range</legend>
        {priceAvailable ? (
          <div className="flex flex-wrap gap-2">
            {PRICES.map((p) => (
              <button key={p} type="button" className="chip min-w-[3.25rem] justify-center" aria-pressed={value.prices.includes(p)}
                onClick={() => onChange({ ...value, prices: toggle(value.prices, p) })}>
                <span aria-hidden>{"₱".repeat(p)}</span>
                <span className="sr-only">Price level {p} of 4</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">Price info isn&apos;t available from this data source.</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="label">Drinks &amp; amenities</legend>
        <div className="flex flex-wrap gap-2">
          {FILTER_AMENITIES.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={value.amenities.includes(a)}
              onClick={() => onChange({ ...value, amenities: toggle(value.amenities, a) })}>
              <Icon name={AMENITY_ICONS[a]} size={16} /> {AMENITY_LABELS[a]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Ambiance</legend>
        {ambianceAvailable ? (
          <div className="flex flex-wrap gap-2">
            {(Object.keys(AMBIANCE_LABELS) as Ambiance[]).map((a) => (
              <button key={a} type="button" className="chip" aria-pressed={value.ambiance.includes(a)}
                onClick={() => onChange({ ...value, ambiance: toggle(value.ambiance, a) })}>
                {AMBIANCE_LABELS[a]}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">Ambiance tags aren&apos;t available from this data source yet.</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="label">Opening status</legend>
        <button type="button" className="chip cursor-not-allowed opacity-60" disabled aria-describedby="open-now-note">
          <Icon name="clock" size={16} /> Open now
        </button>
        <p id="open-now-note" className="mt-1.5 text-xs text-ink-faint">
          Turns on once verified, current opening hours are connected. We won&apos;t guess.
        </p>
      </fieldset>

      {countActive(value) > 0 && (
        <button type="button" className="btn-ghost -ml-3 text-sm underline" onClick={() => onChange({ ...EMPTY_FILTERS, q: value.q })}>
          Clear all filters
        </button>
      )}
    </div>
  );
}

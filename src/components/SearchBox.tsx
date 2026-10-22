"use client";

import { useId, useMemo, useState } from "react";
import type { Cafe } from "@/lib/types";
import { searchPlaces, type Place } from "@/lib/places";
import { Icon } from "./Icon";

type Suggestion = { kind: "place"; place: Place } | { kind: "cafe"; cafe: Cafe };

export function SearchBox({
  value,
  onChange,
  onSubmit,
  onPickPlace,
  onPickCafe,
  cafes = [],
  placeholder = "Search a town or café — try “Baguio” or “matcha”",
  size = "md",
  buttonLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  onPickPlace?: (p: Place) => void;
  onPickCafe?: (c: Cafe) => void;
  cafes?: Cafe[];
  placeholder?: string;
  size?: "md" | "lg";
  buttonLabel?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) return [];
    const places = searchPlaces(q, 4).map((place) => ({ kind: "place" as const, place }));
    const cs = cafes
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((cafe) => ({ kind: "cafe" as const, cafe }));
    return [...places, ...cs];
  }, [value, cafes]);

  const pick = (s: Suggestion) => {
    setOpen(false);
    setActive(-1);
    if (s.kind === "place") {
      onChange("");
      onPickPlace?.(s.place);
    } else {
      onPickCafe?.(s.cafe);
    }
  };

  const showList = open && suggestions.length > 0;

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && suggestions[active]) return pick(suggestions[active]);
        const exactPlace = searchPlaces(value, 1)[0];
        if (exactPlace && exactPlace.name.toLowerCase().startsWith(value.trim().toLowerCase()) && value.trim().length > 2 && onPickPlace) {
          setOpen(false);
          onChange("");
          onPickPlace(exactPlace);
          return;
        }
        setOpen(false);
        onSubmit?.(value);
      }}
    >
      <label htmlFor={`${id}-input`} className="sr-only">Search cafés or places</label>
      <div
        className={`flex items-center gap-2 rounded-full border-[1.5px] border-ink/25 bg-cream pl-4 shadow-card transition focus-within:border-olive focus-within:ring-4 focus-within:ring-olive/20 ${
          size === "lg" ? "py-1.5 pr-1.5" : "py-1 pr-1"
        }`}
      >
        <Icon name="search" size={size === "lg" ? 22 : 19} className="shrink-0 text-ink-soft" />
        <input
          id={`${id}-input`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent font-semibold text-ink placeholder:font-normal placeholder:text-ink-faint focus:outline-none ${
            size === "lg" ? "py-2.5 text-base sm:text-lg" : "py-2 text-[0.95rem]"
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {value && (
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-ink/5" onClick={() => onChange("")} aria-label="Clear search">
            <Icon name="close" size={16} />
          </button>
        )}
        <button type="submit" className={`btn-primary ${size === "lg" ? "px-6 py-3" : "px-4 py-2 text-sm"}`}>
          {buttonLabel ?? "Search"}
        </button>
      </div>
      {showList && (
        <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ink/15 bg-cream py-1.5 shadow-lift">
          {suggestions.map((s, i) => (
            <li
              key={s.kind === "place" ? `p-${s.place.name}` : `c-${s.cafe.id}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${i === active ? "bg-butter/70" : ""}`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-full ${s.kind === "place" ? "bg-sage-soft" : "bg-biscuit-soft"}`}>
                <Icon name={s.kind === "place" ? "pin" : "cup"} size={16} />
              </span>
              {s.kind === "place" ? (
                <span><b>{s.place.name}</b> <span className="text-ink-faint">· {s.place.province}</span></span>
              ) : (
                <span>
                  <b>{s.cafe.name}</b> <span className="text-ink-faint">· {s.cafe.city}{s.cafe.source === "sample" ? " · sample" : ""}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

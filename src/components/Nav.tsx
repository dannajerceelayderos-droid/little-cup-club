"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";
import { Avatar, LogoMark } from "./illustrations";
import { useStore } from "./StoreProvider";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/explore", label: "Explore", icon: "map" },
  { href: "/collections", label: "Collections", icon: "collection" },
  { href: "/passport", label: "Coffee Passport", icon: "stamp" },
  { href: "/community", label: "Community", icon: "community" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { mode, profile, signedIn } = useStore();
  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
      {mode === "demo" && (
        <p className="bg-butter/70 px-4 py-1.5 text-center text-xs font-bold text-ink">
          Demo mode · sample cafés are fictional, and your saves stay on this device.{" "}
          <Link href="/about#setup" className="underline decoration-biscuit-deep underline-offset-2">How it works</Link>
        </p>
      )}
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 rounded-xl" aria-label="Little Cup Club home">
          <span className="transition group-hover:-rotate-6">
            <LogoMark size={40} />
          </span>
          <span className="font-display text-[1.35rem] font-semibold leading-none tracking-tight" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            Little Cup <span className="italic text-olive-deep">Club</span>
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-[0.95rem] font-bold transition hover:bg-butter/60 ${
                  active(l.href) ? "text-ink" : "text-ink-soft"
                }`}
              >
                {l.label}
                {active(l.href) && (
                  <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-biscuit" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {mode === "supabase" && !signedIn ? (
            <Link href="/signin" className="btn-primary px-4 py-2 text-sm">
              <Icon name="user" size={17} /> Sign in
            </Link>
          ) : (
            <Link href="/profile" className="flex items-center gap-2 rounded-full border border-ink/15 bg-cream py-1 pl-1 pr-3 text-sm font-bold hover:border-ink/35">
              <Avatar variant={profile?.avatar ?? 0} size={30} label="" />
              <span className="hidden max-w-[9rem] truncate sm:inline">{profile?.displayName ?? "Profile"}</span>
            </Link>
          )}
          <button
            type="button"
            className="btn-ghost p-2.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} size={22} />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink/10 lg:hidden"
          >
            <ul className="grid gap-1 px-4 py-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active(l.href) ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold ${active(l.href) ? "bg-sage" : "hover:bg-butter/60"}`}
                  >
                    <Icon name={l.icon} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

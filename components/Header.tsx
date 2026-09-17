"use client";

import { useState } from "react";
import { MapPinIcon, MenuIcon, CloseIcon } from "./icons";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Business Owners", href: "#business-owners" },
  { label: "Property Owners", href: "#property-owners" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green text-white">
            <MapPinIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-text">
            Fyndsol
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-green"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="#sign-in"
            className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-green"
          >
            Sign In
          </a>
          <a
            href="#assessment"
            className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-green-deep"
          >
            Evaluate a Location
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-brand-border p-2 text-brand-text lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <CloseIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-brand-border bg-brand-card px-6 py-4 lg:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-text"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#sign-in"
              className="text-sm font-medium text-brand-text"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </a>
            <a
              href="#assessment"
              className="mt-2 rounded-full bg-brand-green px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
              onClick={() => setMenuOpen(false)}
            >
              Evaluate a Location
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

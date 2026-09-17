import { MapPinIcon } from "./icons";

const FOOTER_LINKS = [
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-card">
      <div className="mx-auto max-w-8xl px-6 py-12 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
                <MapPinIcon className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-brand-text">
                Fyndsol
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-muted">
              Location Intelligence
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-brand-muted transition-colors hover:text-brand-green"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t border-brand-border pt-6 text-xs text-brand-muted">
          © {new Date().getFullYear()} Fyndsol. All indicators are based on
          measured data, provider-reported data, calculated indicators and
          model estimates, and do not guarantee business outcomes.
        </p>
      </div>
    </footer>
  );
}

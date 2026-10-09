import { Link } from "@tanstack/react-router";

const links = [
  { to: "/trees", label: "My Trees" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg shadow-pop">🌳</span>
          <span className="hidden truncate font-display text-lg font-semibold sm:inline">Family Tree<span className="text-brand"> Studio</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-1 text-sm font-semibold">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-brand !text-primary-foreground shadow-pop" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import heroTree from "@/assets/hero-tree.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Family Tree Studio — Build your own family trees" },
      { name: "description", content: "Create your own family trees, add family members, connect relationships, and explore your family's history in one place." },
      { property: "og:title", content: "Family Tree Studio — Build your own family trees" },
      { property: "og:description", content: "A vibrant place to create family trees, connect relationships, and explore your family's history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: "🌳", title: "Your trees, your way", text: "Create separate trees for every branch of your family.", color: "bg-gen-0" },
  { icon: "💞", title: "Meaningful connections", text: "Connect relatives and keep every branch in its place.", color: "bg-gen-1" },
  { icon: "🔍", title: "Find your people", text: "Search members and see how everyone is connected.", color: "bg-gen-2" },
];

function Index() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20">
      <section className="grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
        <div className="animate-pop">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-pop">
            ✨ A little more connected
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
            Grow your <span className="text-brand">family tree</span>, one branch at a time.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Create your own family trees, add family members, connect relationships, and explore your family's history in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/trees" className="rounded-full bg-brand px-6 py-3 font-bold text-primary-foreground shadow-pop transition-transform hover:scale-105">
              Get Started →
            </Link>
            <Link to="/trees" className="rounded-full border-2 border-secondary-foreground/20 bg-card px-6 py-3 font-bold text-secondary-foreground transition-colors hover:bg-secondary">
              Explore My Trees
            </Link>
          </div>
        </div>
        <img src={heroTree} alt="Colourful illustrated family tree" width={1024} height={1024} className="mx-auto w-full max-w-md drop-shadow-xl" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={f.title} className="animate-pop rounded-3xl bg-card p-5 shadow-pop transition-transform hover:-translate-y-1" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${f.color}`}>{f.icon}</div>
            <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FamilyTree } from "@/lib/familyTree";
import { treeStore, useTrees } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/trees/")({
  head: () => ({
    meta: [
      { title: "My Family Trees — Family Tree Studio" },
      { name: "description", content: "Create and manage separate family trees." },
      { property: "og:title", content: "My Family Trees — Family Tree Studio" },
      { property: "og:description", content: "Create and manage multiple independent family trees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TreesPage,
});

const EMOJIS = ["🌳", "🌸", "🏡", "👨‍👩‍👧", "🌻", "⭐", "🦚"];
const CARD_COLORS = ["bg-gen-0", "bg-gen-1", "bg-gen-2", "bg-gen-3", "bg-gen-4", "bg-gen-5"];

function TreesPage() {
  const { ready, trees } = useTrees();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("🌳");

  const openCreate = () => {
    setEditId(null);
    setName("");
    setDesc("");
    setEmoji("🌳");
    setOpen(true);
  };

  const submit = () => {
    if (!name.trim()) return toast.error("Please give your tree a name");
    if (editId) {
      const t = trees.find((x) => x.id === editId)!;
      treeStore.put({ ...t, name: name.trim(), description: desc, emoji });
      toast.success("Tree updated");
      setOpen(false);
    } else {
      const t = treeStore.create(name.trim(), desc, emoji);
      setOpen(false);
      navigate({ to: "/trees/$treeId", params: { treeId: t.id } });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">My Family Trees</h1>
          <p className="text-muted-foreground">Create and manage separate family trees.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-full bg-brand font-bold shadow-pop" onClick={openCreate}>
            + Create New Family Tree
          </Button>
        </div>
      </div>

      {ready && trees.length === 0 && (
        <div className="mt-10 animate-pop rounded-3xl border-2 border-dashed border-primary/30 bg-card/70 p-10 text-center">
          <div className="text-6xl">🌱</div>
          <h2 className="mt-3 text-2xl font-semibold">No family trees yet</h2>
          <p className="mt-1 text-muted-foreground">Plant your first tree — give it a name like “My Family”.</p>
          <Button className="mt-5 rounded-full bg-brand font-bold shadow-pop" onClick={openCreate}>Create Your First Family Tree</Button>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {trees.map((t, i) => {
          const stats = new FamilyTree(t).getStatistics();
          return (
            <div key={t.id} className="group animate-pop overflow-hidden rounded-3xl bg-card shadow-pop transition-transform hover:-translate-y-1" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`flex items-center gap-3 p-5 ${CARD_COLORS[i % CARD_COLORS.length]} text-primary-foreground`}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-card/25 text-2xl">{t.emoji ?? "🌳"}</span>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold">{t.name}</h3>
                  <p className="truncate text-sm opacity-90">{t.description || "Family tree"}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-5 text-center">
                <Stat n={stats.totalMembers} l="Members" />
                <Stat n={stats.generations} l="Generations" />
                <Stat n={stats.couples} l="Couples" />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
                <Link to="/trees/$treeId" params={{ treeId: t.id }} className="rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-primary-foreground">
                  Open
                </Link>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setEditId(t.id); setName(t.name); setDesc(t.description ?? ""); setEmoji(t.emoji ?? "🌳"); setOpen(true); }}>Rename</Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { treeStore.duplicate(t.id); toast.success("Tree duplicated"); }}>Duplicate</Button>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => { if (confirm(`Delete "${t.name}"? This cannot be undone.`)) treeStore.remove(t.id); }}>Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editId ? "Edit family tree" : "Create a new family tree"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tree name, e.g. Sharma Family" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Textarea placeholder="Short description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)} className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition ${emoji === e ? "bg-brand shadow-pop" : "bg-muted"}`}>{e}</button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button className="rounded-full bg-brand font-bold" onClick={submit}>{editId ? "Save" : "Create tree"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-2xl bg-muted p-2">
      <div className="font-display text-2xl font-bold text-primary">{n}</div>
      <div className="text-xs font-semibold text-muted-foreground">{l}</div>
    </div>
  );
}

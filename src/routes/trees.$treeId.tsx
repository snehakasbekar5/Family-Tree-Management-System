import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FamilyTree } from "@/lib/familyTree";
import { treeStore, useTrees } from "@/lib/store";
import { MemberForm } from "@/components/MemberForm";
import { TreeCanvas, genIcon } from "@/components/TreeCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/trees/$treeId")({
  head: () => ({
    meta: [
      { title: "Family Tree Workspace — Family Tree Studio" },
      { name: "description", content: "Add family members, manage relationships, and explore your family tree." },
      { property: "og:title", content: "Family Tree Workspace — Family Tree Studio" },
      { property: "og:description", content: "An interactive family tree editor for your family history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TreePage,
});

type FormMode = { kind: "root" } | { kind: "relative"; baseId: string } | { kind: "edit"; id: string } | null;

function TreePage() {
  const { treeId } = Route.useParams();
  const { ready, trees } = useTrees();
  const data = trees.find((t) => t.id === treeId);
  const tree = useMemo(() => (data ? new FamilyTree(data) : null), [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormMode>(null);
  const [query, setQuery] = useState("");
  const [relA, setRelA] = useState("");
  const [relB, setRelB] = useState("");

  if (!ready) return <div className="p-10 text-center text-muted-foreground">Loading tree…</div>;
  if (!tree || !data)
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <div className="text-6xl">🍂</div>
        <h1 className="mt-3 text-2xl font-bold">Tree not found</h1>
        <Link to="/trees" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 font-bold text-primary-foreground">Back to my trees</Link>
      </div>
    );

  const stats = tree.getStatistics();
  const results = tree.searchMember(query);
  const highlight = new Set(results.map((r) => r.id));
  const selected = selectedId ? tree.findMemberById(selectedId) : undefined;
  const rel = relA && relB && tree.findMemberById(relA) && tree.findMemberById(relB) ? tree.findRelationship(relA, relB) : null;
  if (rel) rel.path.forEach((p) => highlight.add(p.id));

  const formTitle =
    form?.kind === "root" ? "Add the first member 👑" : form?.kind === "edit" ? "Edit member" : form?.kind === "relative" ? "Add a relative" : "";
  const baseName = form?.kind === "relative" ? tree.findMemberById(form.baseId)?.name : undefined;
  const editInitial = form?.kind === "edit" ? tree.findMemberById(form.id) : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/trees" className="text-sm font-bold text-muted-foreground hover:text-primary">← My Trees</Link>
          <h1 className="text-3xl font-bold">{data.emoji} {data.name}</h1>
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
        </div>
        {stats.totalMembers > 0 && (
          <Button className="rounded-full bg-brand font-bold shadow-pop" onClick={() => setForm({ kind: "relative", baseId: selectedId ?? data.rootMemberId! })}>
            + Add family member
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-3 gap-3 md:grid-cols-6">
        {[
          ["👥", stats.totalMembers, "Members", "bg-gen-0"],
          ["🪜", stats.generations, "Generations", "bg-gen-1"],
          ["🌿", stats.branches, "Branches", "bg-gen-2"],
          ["👪", stats.parents, "Parents", "bg-gen-3"],
          ["🍃", stats.leaves, "Leaf nodes", "bg-gen-4"],
          ["💞", stats.couples, "Couples", "bg-gen-5"],
        ].map(([icon, n, l, c]) => (
          <div key={l as string} className={`rounded-2xl p-3 text-primary-foreground shadow-pop ${c}`}>
            <div className="text-lg">{icon}</div>
            <div className="font-display text-2xl font-bold">{n}</div>
            <div className="text-xs font-bold opacity-90">{l}</div>
          </div>
        ))}
      </div>

      {stats.totalMembers === 0 ? (
        <div className="mt-8 animate-pop rounded-3xl border-2 border-dashed border-primary/30 bg-card/70 p-10 text-center">
          <div className="text-6xl">🌱</div>
          <h2 className="mt-3 text-2xl font-semibold">This family tree is empty</h2>
          <p className="mt-1 text-muted-foreground">Start by adding the first person in this family tree.</p>
          <Button className="mt-5 rounded-full bg-brand font-bold shadow-pop" onClick={() => setForm({ kind: "root" })}>+ Add First Family Member</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <TreeCanvas tree={tree} selectedId={selectedId} highlight={highlight} onSelect={setSelectedId} />

          <aside className="rounded-3xl bg-card p-4 shadow-pop">
            <Tabs defaultValue="search">
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="search" className="rounded-full">Search</TabsTrigger>
                <TabsTrigger value="rel" className="rounded-full">Relation</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-3 pt-3">
                <Input placeholder="🔍 Search by name, job, city…" value={query} onChange={(e) => setQuery(e.target.value)} />
                {query && (
                  <p className="text-xs font-bold text-muted-foreground">{results.length} found</p>
                )}
                <div className="space-y-2">
                  {(query ? results : tree.members).map((m) => (
                    <button key={m.id} onClick={() => setSelectedId(m.id)} className="flex w-full items-center gap-2 rounded-xl bg-muted p-2 text-left text-sm font-bold hover:bg-accent">
                      <span>{genIcon(m)}</span>
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rel" className="space-y-3 pt-3">
                <p className="text-sm text-muted-foreground">Choose two people to see how they are connected.</p>
                <MemberSelect tree={tree} value={relA} onChange={setRelA} label="From (person)" />
                <MemberSelect tree={tree} value={relB} onChange={setRelB} label="To (relative)" />
                {rel && (
                  <div className="animate-pop rounded-2xl bg-brand p-4 text-primary-foreground">
                    <p className="font-display text-lg font-semibold">
                      {tree.findMemberById(relB)!.name} is {tree.findMemberById(relA)!.name}'s <u>{rel.label}</u>
                    </p>
                    <p className="mt-2 text-xs font-bold opacity-90">Path: {rel.path.map((p) => p.name).join(" → ")}</p>
                  </div>
                )}
                {relA && relB && !rel && <p className="rounded-xl bg-muted p-3 text-sm font-bold">No connection found.</p>}
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      )}

      {/* Member details */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">{genIcon(selected)} {selected.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full bg-brand font-bold" onClick={() => setForm({ kind: "relative", baseId: selected.id })}>+ Add relative</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setForm({ kind: "edit", id: selected.id })}>Edit</Button>
                  {data.rootMemberId !== selected.id && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => { treeStore.mutate(treeId, (t) => (t.data.rootMemberId = selected.id)); toast.success("Root changed"); }}>Make root</Button>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {([
                    ["Gender", selected.gender],
                    ["Relationship", selected.customLabel],
                    ["Born", selected.dateOfBirth],
                    ["Occupation", selected.occupation],
                    ["Location", selected.location],
                    ["Contact", selected.contact],
                    ["Email", selected.email],
                  ] as const).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-muted p-2">
                      <dt className="text-xs font-bold text-muted-foreground">{k}</dt>
                      <dd className="break-words font-bold capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
                {selected.notes && <p className="rounded-xl bg-accent p-3 text-sm">{selected.notes}</p>}
                {(
                  [
                    ["Parents", tree.findParents(selected.id)],
                    ["Spouse", tree.findSpouses(selected.id)],
                    ["Siblings", tree.findSiblings(selected.id)],
                    ["Children", tree.findChildren(selected.id)],
                    ["Ancestors", tree.findAncestors(selected.id)],
                    ["Descendants", tree.findDescendants(selected.id)],
                  ] as const
                ).map(([label, list]) => (
                  <div key={label}>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{label} ({list.length})</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {list.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
                      {list.map((m) => (
                        <button key={m.id} onClick={() => setSelectedId(m.id)} className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground hover:opacity-80">{m.name}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="space-y-2 border-t border-border pt-4">
                  <Button variant="destructive" className="w-full rounded-full" onClick={() => {
                    if (!confirm(`Delete ${selected.name}? Their links will be removed.`)) return;
                    treeStore.mutate(treeId, (t) => t.deleteMember(selected.id));
                    setSelectedId(null);
                    toast.success("Member deleted");
                  }}>Delete this member</Button>
                  {selected.childrenIds.length > 0 && (
                    <Button variant="outline" className="w-full rounded-full text-destructive" onClick={() => {
                      if (!confirm(`Delete ${selected.name} AND all descendants (whole subtree)?`)) return;
                      treeStore.mutate(treeId, (t) => t.deleteMember(selected.id, true));
                      setSelectedId(null);
                      toast.success("Subtree deleted");
                    }}>Delete with descendants (subtree)</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <MemberForm
        open={!!form}
        onOpenChange={(o) => !o && setForm(null)}
        title={formTitle}
        askRelation={form?.kind === "relative"}
        baseName={baseName}
        initial={editInitial}
        onSubmit={(input, relation) => {
          if (!form) return;
          if (form.kind === "root") {
            treeStore.mutate(treeId, (t) => t.createRoot(input));
            toast.success(`${input.name} is the root of this tree 👑`);
          } else if (form.kind === "edit") {
            treeStore.mutate(treeId, (t) => t.updateMember(form.id, input));
            toast.success("Saved");
          } else if (relation) {
            treeStore.mutate(treeId, (t) => t.addRelative(form.baseId, relation, input));
            toast.success(`${input.name} added`);
          }
          setForm(null);
        }}
      />
    </main>
  );
}

function MemberSelect({ tree, value, onChange, label }: { tree: FamilyTree; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background p-2 text-sm font-bold text-foreground">
        <option value="">Choose…</option>
        {tree.members.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </label>
  );
}

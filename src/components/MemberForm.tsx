import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Gender, MemberInput, Relation } from "@/lib/familyTree";

export const RELATIONS: { value: Relation; label: string; icon: string }[] = [
  { value: "father", label: "Father", icon: "👨" },
  { value: "mother", label: "Mother", icon: "👩" },
  { value: "husband", label: "Husband", icon: "🤵" },
  { value: "wife", label: "Wife", icon: "👰" },
  { value: "son", label: "Son", icon: "👦" },
  { value: "daughter", label: "Daughter", icon: "👧" },
  { value: "brother", label: "Brother", icon: "🧑" },
  { value: "sister", label: "Sister", icon: "👩‍🦰" },
  { value: "grandfather", label: "Grandfather", icon: "👴" },
  { value: "grandmother", label: "Grandmother", icon: "👵" },
  { value: "custom-parent", label: "Custom (as parent)", icon: "⬆️" },
  { value: "custom-child", label: "Custom (as child)", icon: "⬇️" },
  { value: "custom-spouse", label: "Custom (as partner)", icon: "💞" },
  { value: "custom-sibling", label: "Custom (as sibling)", icon: "↔️" },
];

const empty: MemberInput = { name: "", gender: "male" };

export function MemberForm({
  open,
  onOpenChange,
  title,
  initial,
  askRelation,
  baseName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial?: MemberInput;
  askRelation?: boolean;
  baseName?: string;
  onSubmit: (data: MemberInput, relation?: Relation) => void;
}) {
  const [form, setForm] = useState<MemberInput>(empty);
  const [relation, setRelation] = useState<Relation>("son");

  useEffect(() => {
    if (open) {
      setForm(initial ?? empty);
      setRelation("son");
    }
  }, [open, initial]);

  const set = (k: keyof MemberInput, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isCustom = relation.startsWith("custom");
  const fixedGender = askRelation && !isCustom;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            onSubmit({ ...form, name: form.name.trim() }, askRelation ? relation : undefined);
          }}
        >
          {askRelation && (
            <div>
              <p className="mb-2 text-sm font-bold">New person is {baseName}'s…</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {RELATIONS.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRelation(r.value)}
                    className={`rounded-xl px-2 py-2 text-xs font-bold transition ${relation === r.value ? "bg-brand text-primary-foreground shadow-pop" : "bg-muted hover:bg-accent"}`}
                  >
                    <span className="block text-lg">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Input required placeholder="Full name *" value={form.name} onChange={(e) => set("name", e.target.value)} />
          {isCustom && (
            <Input placeholder="Relationship label, e.g. Godfather, Step-son" value={form.customLabel ?? ""} onChange={(e) => set("customLabel", e.target.value)} />
          )}
          {!fixedGender && (
            <div className="flex gap-2">
              {(["male", "female", "other"] as Gender[]).map((g) => (
                <button type="button" key={g} onClick={() => set("gender", g)} className={`flex-1 rounded-xl py-2 text-sm font-bold capitalize ${form.gender === g ? "bg-cool text-primary-foreground" : "bg-muted"}`}>
                  {g}
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-muted-foreground">
              Date of birth
              <Input type="date" value={form.dateOfBirth ?? ""} onChange={(e) => set("dateOfBirth", e.target.value)} />
            </label>
            <label className="text-xs font-bold text-muted-foreground">
              Occupation
              <Input value={form.occupation ?? ""} onChange={(e) => set("occupation", e.target.value)} />
            </label>
            <label className="text-xs font-bold text-muted-foreground">
              Location
              <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
            </label>
            <label className="text-xs font-bold text-muted-foreground">
              Contact
              <Input value={form.contact ?? ""} onChange={(e) => set("contact", e.target.value)} />
            </label>
          </div>
          <Input type="email" placeholder="Email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          <Textarea placeholder="Notes" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          <DialogFooter>
            <Button type="submit" className="rounded-full bg-brand font-bold shadow-pop">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

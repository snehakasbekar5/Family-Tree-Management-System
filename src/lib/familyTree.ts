/**
 * FAMILY TREE — General (N-ary) Tree implementation
 * -------------------------------------------------
 * Every person is a NODE. Parent -> child links are the EDGES of the tree.
 * One parent can have any number of children, so this is a GENERAL / N-ARY
 * tree (not a binary tree).
 *
 * Spouse links are stored separately (spouseIds) because a marriage is not a
 * parent-child edge. The hierarchy stays tree-based; spouses sit "beside" it.
 *
 * This file has NO UI code — it is pure data-structure logic.
 */

export type Gender = "male" | "female" | "other";

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  dateOfBirth?: string;
  contact?: string;
  email?: string;
  occupation?: string;
  location?: string;
  notes?: string;
  customLabel?: string;
  parentIds: string[];
  childrenIds: string[];
  spouseIds: string[];
}

export interface FamilyTreeData {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  rootMemberId: string | null;
  members: Record<string, FamilyMember>;
  createdAt: number;
}

export type MemberInput = Omit<FamilyMember, "id" | "parentIds" | "childrenIds" | "spouseIds">;

export type Relation =
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "husband"
  | "wife"
  | "brother"
  | "sister"
  | "grandfather"
  | "grandmother"
  | "custom-parent"
  | "custom-child"
  | "custom-spouse"
  | "custom-sibling";

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const addUnique = (arr: string[], v: string) => {
  if (!arr.includes(v)) arr.push(v);
};

export class FamilyTree {
  data: FamilyTreeData;

  constructor(data: FamilyTreeData) {
    // deep copy so the original object is never mutated
    this.data = JSON.parse(JSON.stringify(data));
  }

  static empty(name: string, description = "", emoji = "🌳"): FamilyTreeData {
    return { id: makeId(), name, description, emoji, rootMemberId: null, members: {}, createdAt: Date.now() };
  }

  get members(): FamilyMember[] {
    return Object.values(this.data.members);
  }

  get size(): number {
    return this.members.length;
  }

  // ---------- Insertion ----------

  /** Create the ROOT node of an empty tree. O(1) */
  createRoot(input: MemberInput): FamilyMember {
    const m = this.addMember(input);
    this.data.rootMemberId = m.id;
    return m;
  }

  /** Insert a new, unconnected node. O(1) */
  addMember(input: MemberInput): FamilyMember {
    const m: FamilyMember = { ...input, id: makeId(), parentIds: [], childrenIds: [], spouseIds: [] };
    this.data.members[m.id] = m;
    if (!this.data.rootMemberId) this.data.rootMemberId = m.id;
    return m;
  }

  linkParentChild(parentId: string, childId: string) {
    const p = this.findMemberById(parentId);
    const c = this.findMemberById(childId);
    if (!p || !c || parentId === childId) return;
    addUnique(p.childrenIds, childId);
    addUnique(c.parentIds, parentId);
  }

  linkSpouses(aId: string, bId: string) {
    const a = this.findMemberById(aId);
    const b = this.findMemberById(bId);
    if (!a || !b || aId === bId) return;
    addUnique(a.spouseIds, bId);
    addUnique(b.spouseIds, aId);
  }

  /** Make sure `id` has at least one parent (creates an "Unknown parent" placeholder). */
  private ensureParent(id: string): string {
    const m = this.findMemberById(id)!;
    if (m.parentIds.length) return m.parentIds[0];
    const p = this.addMember({ name: `Parent of ${m.name}`, gender: "other", notes: "Placeholder — edit me" });
    this.linkParentChild(p.id, id);
    return p.id;
  }

  /**
   * RELATIONSHIP ENGINE: add a new person relative to an existing one.
   * The correct parent / child / spouse edges are created automatically.
   */
  addRelative(baseId: string, relation: Relation, input: MemberInput): FamilyMember {
    const base = this.findMemberById(baseId);
    if (!base) throw new Error("Base member not found");
    const gender: Gender =
      ["father", "son", "husband", "brother", "grandfather"].includes(relation)
        ? "male"
        : ["mother", "daughter", "wife", "sister", "grandmother"].includes(relation)
          ? "female"
          : input.gender;
    const m = this.addMember({ ...input, gender });

    switch (relation) {
      case "father":
      case "mother":
      case "custom-parent": {
        const existing = [...base.parentIds];
        const siblings = this.findSiblings(baseId);
        this.linkParentChild(m.id, baseId);
        siblings.forEach((s) => this.linkParentChild(m.id, s.id));
        existing.forEach((p) => this.linkSpouses(m.id, p));
        break;
      }
      case "son":
      case "daughter":
      case "custom-child": {
        this.linkParentChild(baseId, m.id);
        base.spouseIds.forEach((s) => this.linkParentChild(s, m.id));
        break;
      }
      case "husband":
      case "wife":
      case "custom-spouse": {
        this.linkSpouses(baseId, m.id);
        // the new spouse also becomes parent of existing children
        base.childrenIds.forEach((c) => this.linkParentChild(m.id, c));
        break;
      }
      case "brother":
      case "sister":
      case "custom-sibling": {
        this.ensureParent(baseId);
        this.findMemberById(baseId)!.parentIds.forEach((p) => this.linkParentChild(p, m.id));
        break;
      }
      case "grandfather":
      case "grandmother": {
        const parentId = this.ensureParent(baseId);
        const parent = this.findMemberById(parentId)!;
        const existing = [...parent.parentIds];
        this.linkParentChild(m.id, parentId);
        this.findSiblings(parentId).forEach((s) => this.linkParentChild(m.id, s.id));
        existing.forEach((g) => this.linkSpouses(m.id, g));
        break;
      }
    }
    return m;
  }

  // ---------- Update ----------

  updateMember(id: string, input: Partial<MemberInput>) {
    const m = this.findMemberById(id);
    if (m) Object.assign(m, input);
  }

  // ---------- Deletion ----------

  /** Delete one node and remove every edge pointing to it. O(n) */
  deleteMember(id: string, withDescendants = false) {
    const ids = withDescendants ? [id, ...this.findDescendants(id).map((d) => d.id)] : [id];
    for (const del of ids) {
      const m = this.findMemberById(del);
      if (!m) continue;
      for (const other of this.members) {
        other.parentIds = other.parentIds.filter((x) => x !== del);
        other.childrenIds = other.childrenIds.filter((x) => x !== del);
        other.spouseIds = other.spouseIds.filter((x) => x !== del);
      }
      delete this.data.members[del];
    }
    if (this.data.rootMemberId && !this.data.members[this.data.rootMemberId]) {
      this.data.rootMemberId = this.members[0]?.id ?? null;
    }
  }

  // ---------- Searching ----------

  findMemberById(id: string): FamilyMember | undefined {
    return this.data.members[id];
  }

  /** Linear search by name / occupation / location. O(n) */
  searchMember(query: string): FamilyMember[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.members.filter((m) =>
      [m.name, m.occupation, m.location].some((f) => f?.toLowerCase().includes(q)),
    );
  }

  findParents(id: string) {
    return (this.findMemberById(id)?.parentIds ?? []).map((p) => this.data.members[p]).filter(Boolean);
  }

  findChildren(id: string) {
    return (this.findMemberById(id)?.childrenIds ?? []).map((c) => this.data.members[c]).filter(Boolean);
  }

  findSpouses(id: string) {
    return (this.findMemberById(id)?.spouseIds ?? []).map((c) => this.data.members[c]).filter(Boolean);
  }

  /** Siblings = other children of my parents. */
  findSiblings(id: string): FamilyMember[] {
    const set = new Set<string>();
    this.findParents(id).forEach((p) => p.childrenIds.forEach((c) => c !== id && set.add(c)));
    return [...set].map((s) => this.data.members[s]).filter(Boolean);
  }

  /** Walk up the family tree through parent relationships. */
  findAncestors(id: string): FamilyMember[] {
    const out: FamilyMember[] = [];
    const seen = new Set([id]);
    const queue = [...(this.findMemberById(id)?.parentIds ?? [])];
    while (queue.length) {
      const cur = queue.shift()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      const m = this.data.members[cur];
      if (!m) continue;
      out.push(m);
      queue.push(...m.parentIds);
    }
    return out;
  }

  /** Walk down the family tree through child relationships. */
  findDescendants(id: string): FamilyMember[] {
    const out: FamilyMember[] = [];
    const seen = new Set([id]);
    const queue = [...(this.findMemberById(id)?.childrenIds ?? [])];
    while (queue.length) {
      const cur = queue.shift()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      const m = this.data.members[cur];
      if (!m) continue;
      out.push(m);
      queue.push(...m.childrenIds);
    }
    return out;
  }

  // ---------- Family roots ----------

  /** Top-level nodes: people with no parents. Root's top ancestor comes first. */
  topLevel(): FamilyMember[] {
    const tops = this.members.filter((m) => m.parentIds.length === 0);
    const root = this.data.rootMemberId;
    if (root) {
      const anc = [root, ...this.findAncestors(root).map((a) => a.id)];
      tops.sort((a, b) => Number(anc.includes(b.id)) - Number(anc.includes(a.id)));
    }
    return tops;
  }

  // ---------- Generations ----------

  /** Generation number for each member (0 = oldest generation). */
  getGenerations(): Record<string, number> {
    const level: Record<string, number> = {};
    for (const start of this.members) {
      if (start.id in level) continue;
      level[start.id] = 0;
      const queue = [start.id];
      while (queue.length) {
        const id = queue.shift()!;
        const m = this.data.members[id];
        const l = level[id];
        const push = (n: string, v: number) => {
          if (!(n in level) && this.data.members[n]) {
            level[n] = v;
            queue.push(n);
          }
        };
        m.parentIds.forEach((p) => push(p, l - 1));
        m.childrenIds.forEach((c) => push(c, l + 1));
        m.spouseIds.forEach((s) => push(s, l));
      }
    }
    const min = Math.min(0, ...Object.values(level));
    for (const k in level) level[k] -= min;
    return level;
  }

  getStatistics() {
    const gens = this.getGenerations();
    const members = this.members;
    const couples = members.reduce((n, m) => n + m.spouseIds.length, 0) / 2;
    return {
      totalMembers: members.length,
      generations: members.length ? Math.max(...Object.values(gens)) + 1 : 0,
      branches: members.filter((m) => m.childrenIds.length === 0 && m.parentIds.length > 0).length,
      parents: members.filter((m) => m.childrenIds.length > 0).length,
      leaves: members.filter((m) => m.childrenIds.length === 0).length,
      couples,
      males: members.filter((m) => m.gender === "male").length,
      females: members.filter((m) => m.gender === "female").length,
    };
  }

  // ---------- Relationship finder ----------

  /**
   * Find how `targetId` is related to `fromId`.
   * Finds the shortest path through parent, child, and spouse relationships,
   * then translates it into a relationship label.
   */
  findRelationship(fromId: string, targetId: string): { label: string; path: FamilyMember[]; steps: string } | null {
    if (fromId === targetId) return { label: "the same person", path: [this.data.members[fromId]], steps: "" };
    const prev: Record<string, { id: string; step: string } | null> = { [fromId]: null };
    const queue = [fromId];
    while (queue.length) {
      const id = queue.shift()!;
      if (id === targetId) break;
      const m = this.data.members[id];
      const edges: [string, string][] = [
        ...m.parentIds.map((x) => [x, "P"] as [string, string]),
        ...m.childrenIds.map((x) => [x, "C"] as [string, string]),
        ...m.spouseIds.map((x) => [x, "S"] as [string, string]),
      ];
      for (const [n, step] of edges) {
        if (n in prev || !this.data.members[n]) continue;
        prev[n] = { id, step };
        queue.push(n);
      }
    }
    if (!(targetId in prev)) return null;
    const path: FamilyMember[] = [];
    let steps = "";
    let cur: string | undefined = targetId;
    while (cur) {
      path.unshift(this.data.members[cur]);
      const p: { id: string; step: string } | null = prev[cur];
      if (!p) break;
      steps = p.step + steps;
      cur = p.id;
    }
    // Parent-child paths through the same couple are handled by the path search.
    return { label: relationLabel(steps, this.data.members[targetId].gender, path, this), path, steps };
  }
}

function g(gender: Gender, male: string, female: string, other: string) {
  return gender === "male" ? male : gender === "female" ? female : other;
}

export function relationLabel(steps: string, gender: Gender, path: FamilyMember[], tree?: FamilyTree): string {
  const great = (n: number) => "great-".repeat(n);
  if (/^P+$/.test(steps)) {
    const n = steps.length;
    if (n === 1) return g(gender, "father", "mother", "parent");
    return great(n - 2) + g(gender, "grandfather", "grandmother", "grandparent");
  }
  if (/^C+$/.test(steps)) {
    const n = steps.length;
    if (n === 1) return g(gender, "son", "daughter", "child");
    return great(n - 2) + g(gender, "grandson", "granddaughter", "grandchild");
  }
  const map: Record<string, string> = {
    S: g(gender, "husband", "wife", "spouse"),
    PC: g(gender, "brother", "sister", "sibling"),
    PPC: g(gender, "uncle", "aunt", "parent's sibling"),
    PPCS: g(gender, "uncle (by marriage)", "aunt (by marriage)", "parent's sibling's spouse"),
    PCC: g(gender, "nephew", "niece", "sibling's child"),
    SPCC: g(gender, "nephew", "niece", "sibling's child"),
    PPCC: "cousin",
    PPPCC: "first cousin once removed",
    PPPCCC: "second cousin",
    PPPC: g(gender, "grand-uncle", "grand-aunt", "grand-uncle/aunt"),
    PCCC: g(gender, "grand-nephew", "grand-niece", "grand-nephew/niece"),
    SP: g(gender, "father-in-law", "mother-in-law", "parent-in-law"),
    SPP: g(gender, "grandfather-in-law", "grandmother-in-law", "grandparent-in-law"),
    SPC: g(gender, "brother-in-law", "sister-in-law", "sibling-in-law"),
    PCS: g(gender, "brother-in-law", "sister-in-law", "sibling-in-law"),
    SPCS: g(gender, "brother-in-law", "sister-in-law", "sibling-in-law"),
    CS: g(gender, "son-in-law", "daughter-in-law", "child-in-law"),
    CCS: g(gender, "grandson-in-law", "granddaughter-in-law", "grandchild-in-law"),
    PS: g(gender, "step-father", "step-mother", "step-parent"),
    SC: g(gender, "step-son", "step-daughter", "step-child"),
  };
  if (map[steps]) return map[steps];
  // fallback: describe the chain, e.g. "father's sister's son"
  const words = steps.split("").map((s, i) => {
    const node = path[i + 1];
    const gd = node?.gender ?? "other";
    return s === "P" ? g(gd, "father", "mother", "parent") : s === "C" ? g(gd, "son", "daughter", "child") : g(gd, "husband", "wife", "spouse");
  });
  void tree;
  return words.join("'s ");
}

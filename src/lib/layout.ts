import type { FamilyTree } from "./familyTree";

export const CARD_W = 172;
export const CARD_H = 104;
const GAP = 28;
const ROW_H = 190;

export interface NodePos {
  id: string;
  x: number;
  y: number;
  gen: number;
}

/**
 * Simple recursive tree layout:
 * each "unit" (a person + spouse) is placed above its children,
 * and the subtree is centred under / over the unit.
 */
export function layoutTree(tree: FamilyTree) {
  const gens = tree.getGenerations();
  const pos: Record<string, NodePos> = {};
  const placed = new Set<string>();
  let cursor = 0;

  const place = (id: string): string[] => {
    const m = tree.findMemberById(id)!;
    const unit = [id, ...m.spouseIds.filter((s) => !placed.has(s) && tree.findMemberById(s))];
    unit.forEach((u) => placed.add(u));
    const start = cursor;
    const childIds: string[] = [];
    unit.forEach((u) =>
      tree.findMemberById(u)!.childrenIds.forEach((c) => {
        if (!placed.has(c) && !childIds.includes(c) && tree.findMemberById(c)) childIds.push(c);
      }),
    );
    const subtree: string[] = [];
    childIds.forEach((c) => {
      if (!placed.has(c)) subtree.push(...place(c));
    });
    const childWidth = subtree.length ? cursor - start - GAP : 0;
    const unitWidth = unit.length * CARD_W + (unit.length - 1) * GAP;
    let unitX = start;
    if (childWidth > unitWidth) {
      unitX = start + (childWidth - unitWidth) / 2;
    } else {
      const shift = (unitWidth - childWidth) / 2;
      subtree.forEach((s) => (pos[s].x += shift));
      cursor = Math.max(cursor, start + unitWidth + GAP);
    }
    unit.forEach((u, i) => {
      pos[u] = { id: u, x: unitX + i * (CARD_W + GAP), y: (gens[u] ?? 0) * ROW_H, gen: gens[u] ?? 0 };
    });
    if (!subtree.length) cursor = Math.max(cursor, start + unitWidth + GAP);
    return [...unit, ...subtree];
  };

  // start from the oldest generation so ancestors sit at the top
  const order = [...tree.topLevel()].sort((a, b) => (gens[a.id] ?? 0) - (gens[b.id] ?? 0));
  order.forEach((m) => !placed.has(m.id) && place(m.id));
  tree.members.forEach((m) => !placed.has(m.id) && place(m.id));

  const nodes = Object.values(pos);
  const width = Math.max(CARD_W, ...nodes.map((n) => n.x + CARD_W));
  const height = Math.max(CARD_H, ...nodes.map((n) => n.y + CARD_H));

  // parent -> child connector lines (from the couple's midpoint)
  const edges: { key: string; d: string; childId: string; parentIds: string[] }[] = [];
  const seen = new Set<string>();
  tree.members.forEach((c) => {
    if (!c.parentIds.length || !pos[c.id]) return;
    const ps = c.parentIds.filter((p) => pos[p]);
    if (!ps.length) return;
    const key = ps.slice().sort().join("-") + ">" + c.id;
    if (seen.has(key)) return;
    seen.add(key);
    const px = ps.reduce((s, p) => s + pos[p].x + CARD_W / 2, 0) / ps.length;
    const py = Math.max(...ps.map((p) => pos[p].y)) + CARD_H;
    const cx = pos[c.id].x + CARD_W / 2;
    const cy = pos[c.id].y;
    const mid = py + (cy - py) / 2;
    edges.push({ key, d: `M ${px} ${py} V ${mid} H ${cx} V ${cy}`, childId: c.id, parentIds: ps });
  });

  // spouse links
  const spouses: { key: string; x1: number; x2: number; y: number }[] = [];
  tree.members.forEach((m) =>
    m.spouseIds.forEach((s) => {
      if (m.id > s || !pos[m.id] || !pos[s]) return;
      const a = pos[m.id];
      const b = pos[s];
      const [l, r] = a.x < b.x ? [a, b] : [b, a];
      spouses.push({ key: m.id + s, x1: l.x + CARD_W, x2: r.x, y: Math.min(l.y, r.y) + CARD_H / 2 });
    }),
  );

  return { pos, width, height, edges, spouses };
}

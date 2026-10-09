import { useMemo, useState } from "react";
import type { FamilyTree, FamilyMember } from "@/lib/familyTree";
import { CARD_H, CARD_W, layoutTree } from "@/lib/layout";

const GEN_BG = ["bg-gen-0", "bg-gen-1", "bg-gen-2", "bg-gen-3", "bg-gen-4", "bg-gen-5"];
const PAD = 40;

export function genIcon(m: FamilyMember) {
  return m.gender === "male" ? "👨" : m.gender === "female" ? "👩" : "🧑";
}

export function TreeCanvas({
  tree,
  selectedId,
  highlight,
  onSelect,
}: {
  tree: FamilyTree;
  selectedId: string | null;
  highlight: Set<string>;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => layoutTree(tree), [tree]);
  const [zoom, setZoom] = useState(1);
  const w = layout.width + PAD * 2;
  const h = layout.height + PAD * 2;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 shadow-pop">
      <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-full bg-card p-1 shadow-pop">
        <button className="h-8 w-8 rounded-full font-bold hover:bg-muted" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} aria-label="Zoom out">−</button>
        <button className="h-8 rounded-full px-2 text-xs font-bold hover:bg-muted" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button className="h-8 w-8 rounded-full font-bold hover:bg-muted" onClick={() => setZoom((z) => Math.min(2, z + 0.15))} aria-label="Zoom in">+</button>
      </div>
      <div className="max-h-[70vh] min-h-[360px] overflow-auto">
        <div style={{ width: w * zoom, height: h * zoom }}>
          <div className="relative origin-top-left transition-transform" style={{ width: w, height: h, transform: `scale(${zoom})` }}>
            <svg className="absolute inset-0" width={w} height={h}>
              <g transform={`translate(${PAD},${PAD})`}>
                {layout.edges.map((e) => (
                  <path key={e.key} d={e.d} fill="none" stroke="var(--gen-2)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
                ))}
                {layout.spouses.map((s) => (
                  <g key={s.key}>
                    <line x1={s.x1} x2={s.x2} y1={s.y} y2={s.y} stroke="var(--gen-1)" strokeWidth={3} strokeDasharray="6 5" />
                    <text x={(s.x1 + s.x2) / 2} y={s.y + 6} textAnchor="middle" fontSize={16}>❤️</text>
                  </g>
                ))}
              </g>
            </svg>
            {tree.members.map((m) => {
              const p = layout.pos[m.id];
              if (!p) return null;
              const isRoot = tree.data.rootMemberId === m.id;
              const sel = selectedId === m.id;
              const hl = highlight.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className={`absolute animate-pop rounded-2xl p-[3px] text-left transition-all hover:-translate-y-1 hover:shadow-xl ${GEN_BG[p.gen % GEN_BG.length]} ${sel ? "ring-4 ring-foreground/70" : ""} ${hl ? "animate-ring" : ""}`}
                  style={{ left: p.x + PAD, top: p.y + PAD, width: CARD_W, height: CARD_H }}
                >
                  <div className="flex h-full flex-col justify-between rounded-[13px] bg-card p-2.5">
                    <div className="flex items-start gap-2">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg ${GEN_BG[p.gen % GEN_BG.length]}`}>{genIcon(m)}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold leading-tight">{m.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{m.customLabel || m.occupation || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      <span>Gen {p.gen + 1}{isRoot ? " · 👑 root" : ""}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

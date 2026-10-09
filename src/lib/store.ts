import { useEffect, useState } from "react";
import { FamilyTree, makeId, type FamilyTreeData } from "./familyTree";

const KEY = "family-trees-v1";
let trees: FamilyTreeData[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    trees = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    trees = [];
  }
}

function save(next: FamilyTreeData[]) {
  trees = next;
  localStorage.setItem(KEY, JSON.stringify(trees));
  listeners.forEach((l) => l());
}

export function useTrees() {
  const [state, setState] = useState<{ ready: boolean; trees: FamilyTreeData[] }>({ ready: false, trees: [] });
  useEffect(() => {
    load();
    const update = () => setState({ ready: true, trees });
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return state;
}

export const treeStore = {
  create(name: string, description = "", emoji = "🌳") {
    const t = FamilyTree.empty(name, description, emoji);
    save([...trees, t]);
    return t;
  },
  put(t: FamilyTreeData) {
    save(trees.map((x) => (x.id === t.id ? t : x)));
  },
  /** Run a mutation on a tree through the FamilyTree class and save the result. */
  mutate<R>(id: string, fn: (tree: FamilyTree) => R): R | undefined {
    const data = trees.find((t) => t.id === id);
    if (!data) return;
    const tree = new FamilyTree(data);
    const r = fn(tree);
    this.put(tree.data);
    return r;
  },
  remove(id: string) {
    save(trees.filter((t) => t.id !== id));
  },
  duplicate(id: string) {
    const t = trees.find((x) => x.id === id);
    if (!t) return;
    save([...trees, { ...JSON.parse(JSON.stringify(t)), id: makeId(), name: t.name + " (copy)", createdAt: Date.now() }]);
  },
};

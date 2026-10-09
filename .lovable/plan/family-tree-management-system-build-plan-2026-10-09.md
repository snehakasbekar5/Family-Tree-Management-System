# Family Tree Management System — Build Plan

A vibrant, multi-family-tree builder that demonstrates a General (N-ary) Tree for a DSA project. No family is pre-filled; every tree starts empty.

## Note on tech stack
The brief asks for HTML/CSS/JS + Express. This platform builds with React + TypeScript (TanStack Start), so the app will use that instead. The DSA logic stays in one plain, well-commented `FamilyTree` class so it is still easy to explain in a viva. Data is saved in the browser (no login needed), so trees persist on that device.

## Pages
- **Home (/)** — colourful landing with tree illustration, "Get started" button, quick explanation.
- **My Family Trees (/trees)** — dashboard of cards (name, members, generations), create / rename / delete / duplicate tree. Optional "Load demo family" button, clearly separate.
- **Tree view (/trees/$id)** — the main workspace:
  - Empty state: "Add the first member" (root).
  - Visual tree: generation-coloured member cards, connector lines, spouses side-by-side with a heart link, zoom + pan, scrollable on mobile.
  - Click a member: side panel with details, Edit, Delete, "Add relative".
  - Add relative: pick relation (father, mother, son, daughter, brother, sister, husband, wife, grandfather, grandmother, custom) — engine wires parent/child/spouse links automatically.
  - Search box with highlight.
  - Relationship finder: choose two people, get e.g. "Rahul is Priya's uncle" plus the path.
  - DFS / BFS panel: run traversal, animated step-by-step highlight and visit order.
  - Statistics strip: total members, generations, branches, parents, leaves, spouses couples.
- **DSA Concepts (/dsa)** — colourful cards with simple diagrams: tree, node, edge, root, parent, child, leaf, subtree, generation, DFS, BFS, search, insertion, deletion, plus time complexities.
- **Viva Q&A (/viva)** — 20+ questions and answers in an accordion (also shipped as `VIVA.md`), plus `README.md`.

## Visual style
"Modern SaaS dashboard + colourful tree": warm gradient backgrounds (coral, amber, teal, violet), rounded cards, gradient buttons, one colour per generation, gender/role icons, subtle animations (card hover, node appear, modal open, search pulse). Fun but readable display font paired with a clean body font.

## Technical details
- `src/lib/familyTree.ts`: `FamilyTree` class — members map with `parentIds`, `childrenIds`, `spouseIds`; methods createRoot, addMember, addRelative, updateMember, deleteMember (with re-linking / subtree choice), searchMember, findMemberById, findParents, findChildren, findSiblings, findAncestors, findDescendants, findRelationship (BFS shortest path over parent/child/spouse edges, translated to a label), dfs, bfs (both return visit order), getGenerations, getStatistics.
- Spouse links kept separate from the parent-child hierarchy (explained in README/VIVA).
- `src/lib/store.ts`: list of independent trees, saved to localStorage, read after hydration.
- Tree layout computed by a simple recursive width algorithm, rendered as SVG lines + HTML cards; zoom/pan via CSS transform.
- Each route gets its own title/description metadata.
- Unit tests for the FamilyTree class (relationships, DFS/BFS order, deletion).

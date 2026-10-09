import { describe, expect, it } from "vitest";
import { FamilyTree } from "./familyTree";

function demo() {
  const t = new FamilyTree(FamilyTree.empty("Test"));
  const grandpa = t.createRoot({ name: "Grandpa", gender: "male" });
  const grandma = t.addRelative(grandpa.id, "wife", { name: "Grandma", gender: "female" });
  const dad = t.addRelative(grandpa.id, "son", { name: "Dad", gender: "male" });
  const aunt = t.addRelative(dad.id, "sister", { name: "Aunt", gender: "female" });
  const mom = t.addRelative(dad.id, "wife", { name: "Mom", gender: "female" });
  const me = t.addRelative(mom.id, "son", { name: "Me", gender: "male" });
  const cousin = t.addRelative(aunt.id, "daughter", { name: "Cousin", gender: "female" });
  return { t, grandpa, grandma, dad, aunt, mom, me, cousin };
}

describe("FamilyTree", () => {
  it("links parents, children and spouses", () => {
    const { t, dad, me, mom, grandma } = demo();
    expect(t.findParents(me.id).map((m) => m.id).sort()).toEqual([dad.id, mom.id].sort());
    expect(t.findChildren(grandma.id).length).toBe(2);
  });

  it("finds relationships", () => {
    const { t, me, aunt, cousin, grandpa, mom } = demo();
    expect(t.findRelationship(me.id, aunt.id)?.label).toBe("aunt");
    expect(t.findRelationship(me.id, cousin.id)?.label).toBe("cousin");
    expect(t.findRelationship(me.id, grandpa.id)?.label).toBe("grandfather");
    expect(t.findRelationship(grandpa.id, mom.id)?.label).toBe("daughter-in-law");
  });

  it("computes generations and deletes", () => {
    const { t, me, dad } = demo();
    expect(t.getStatistics().generations).toBe(3);
    t.deleteMember(dad.id, true);
    expect(t.findMemberById(me.id)).toBeUndefined();
  });
});

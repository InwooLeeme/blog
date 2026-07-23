import assert from "node:assert/strict";
import test from "node:test";
import {
  getNoteSlugs,
  getNoteBySlug,
  getNotesTree,
  firstNoteSlug,
  type NotesTreeNode,
} from "./notes.ts";

const slugs = getNoteSlugs();

test("getNoteSlugs: finds at least one note under a category folder", () => {
  assert.ok(slugs.length > 0);
  for (const slug of slugs) {
    assert.ok(slug.length >= 2, `slug should have folder + file segments: ${slug}`);
  }
});

test("getNoteSlugs: no segment starts with '.' or '_'", () => {
  for (const slug of slugs) {
    for (const segment of slug) {
      assert.ok(!segment.startsWith("."), `unexpected dotfile segment: ${segment}`);
      assert.ok(!segment.startsWith("_"), `unexpected underscore segment: ${segment}`);
    }
  }
});

test("getNoteBySlug: unknown slug returns null", () => {
  assert.equal(getNoteBySlug(["__does-not-exist__"]), null);
});

test("getNoteBySlug: known slug returns matching content", () => {
  const target = slugs[0];
  const note = getNoteBySlug(target);
  assert.ok(note);
  assert.deepEqual(note!.slug, target);
  assert.ok(note!.content.length > 0);
});

function flattenFiles(nodes: NotesTreeNode[]): { slug: string[] }[] {
  return nodes.flatMap((n) =>
    n.type === "file" ? [{ slug: n.slug }] : flattenFiles(n.children),
  );
}

test("getNotesTree: flattened file count matches getNoteSlugs count", () => {
  const tree = getNotesTree();
  const files = flattenFiles(tree);
  assert.equal(files.length, slugs.length);
});

test("firstNoteSlug: returns the first file slug in a flat list", () => {
  const nodes: NotesTreeNode[] = [
    { type: "file", name: "b", slug: ["b"] },
    { type: "file", name: "a", slug: ["a"] },
  ];
  assert.deepEqual(firstNoteSlug(nodes), ["b"]);
});

test("firstNoteSlug: descends into folders before trying sibling files, matching display order", () => {
  const nodes: NotesTreeNode[] = [
    {
      type: "folder",
      name: "Graph",
      path: "Graph",
      children: [{ type: "file", name: "Dijkstra", slug: ["Graph", "Dijkstra"] }],
    },
    { type: "file", name: "top-level", slug: ["top-level"] },
  ];
  assert.deepEqual(firstNoteSlug(nodes), ["Graph", "Dijkstra"]);
});

test("firstNoteSlug: skips empty folders to find a file deeper in the tree", () => {
  const nodes: NotesTreeNode[] = [
    { type: "folder", name: "Empty", path: "Empty", children: [] },
    { type: "file", name: "only-file", slug: ["only-file"] },
  ];
  assert.deepEqual(firstNoteSlug(nodes), ["only-file"]);
});

test("firstNoteSlug: empty tree returns null", () => {
  assert.equal(firstNoteSlug([]), null);
});

test("getNotesTree: folders are sorted before files at every level, alphabetically within each group", () => {
  function assertOrdered(nodes: NotesTreeNode[]) {
    let seenFile = false;
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i - 1].type === "folder" && nodes[i].type === "folder") {
        assert.ok(nodes[i - 1].name.localeCompare(nodes[i].name) <= 0);
      }
    }
    for (const node of nodes) {
      if (node.type === "file") seenFile = true;
      if (node.type === "folder") assert.ok(!seenFile, "folder found after a file");
    }
    for (const node of nodes) {
      if (node.type === "folder") assertOrdered(node.children);
    }
  }
  assertOrdered(getNotesTree());
});

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";

export type NoteMeta = {
  title?: string;
  description?: string;
};

export type NoteItem = {
  slug: string[];
  meta: NoteMeta;
  content: string;
};

export type NotesTreeNode =
  | {
      type: "folder";
      name: string;
      path: string;
      children: NotesTreeNode[];
    }
  | {
      type: "file";
      name: string;
      slug: string[];
    };

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

/** 카테고리 폴더명 표시용 포맷 — 전부 소문자인 폴더명만 첫 글자를 올려 다른 카테고리(DataStructure, DP 등)와
 *  대소문자 표기를 맞춘다. 경로(URL)에는 영향 없음 — 표시 라벨만 다듬는다. */
export function formatCategoryLabel(name: string): string {
  if (/^[a-z][a-z0-9-]*$/.test(name)) {
    return name[0].toUpperCase() + name.slice(1);
  }
  return name;
}

function safeReaddir(dir: string): fs.Dirent[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true });
}

function walk(dir: string, relSegments: string[] = []): string[][] {
  const out: string[][] = [];
  for (const entry of safeReaddir(dir)) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const nextRel = [...relSegments, entry.name];
    if (entry.isDirectory()) {
      out.push(...walk(path.join(dir, entry.name), nextRel));
    } else if (entry.name.endsWith(".mdx")) {
      nextRel[nextRel.length - 1] = nextRel[nextRel.length - 1].replace(/\.mdx$/, "");
      out.push(nextRel);
    }
  }
  return out;
}

export const getNoteSlugs = cache((): string[][] => walk(NOTES_DIR));

export const getNoteBySlug = cache((slug: string[]): NoteItem | null => {
  const filePath = path.join(NOTES_DIR, ...slug) + ".mdx";
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(file);
  return { slug, meta: data as NoteMeta, content };
});

function buildTree(dir: string, relPath: string = ""): NotesTreeNode[] {
  const folders: NotesTreeNode[] = [];
  const files: NotesTreeNode[] = [];

  for (const entry of safeReaddir(dir)) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const childRel = relPath ? `${relPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = buildTree(path.join(dir, entry.name), childRel);
      folders.push({
        type: "folder",
        name: formatCategoryLabel(entry.name),
        path: childRel,
        children,
      });
    } else if (entry.name.endsWith(".mdx")) {
      const baseName = entry.name.replace(/\.mdx$/, "");
      const slug = childRel.replace(/\.mdx$/, "").split("/");
      const file = fs.readFileSync(path.join(dir, entry.name), "utf8");
      const { data } = matter(file);
      const displayName = (data as NoteMeta).title ?? baseName;
      files.push({ type: "file", name: displayName, slug });
    }
  }

  folders.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));
  return [...folders, ...files];
}

export const getNotesTree = cache((): NotesTreeNode[] => buildTree(NOTES_DIR));

/** 트리 안의 노트(파일) 총 개수를 센다 */
export function countNotes(nodes: NotesTreeNode[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "file") n++;
    else n += countNotes(node.children);
  }
  return n;
}

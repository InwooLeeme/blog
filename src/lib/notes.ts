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
        name: entry.name,
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

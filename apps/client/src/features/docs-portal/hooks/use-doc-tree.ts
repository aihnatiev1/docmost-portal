import { useMemo } from "react";
import { IDocTreeItem, ITreeNode } from "../types/docs-portal.types";

export function buildTree(items: IDocTreeItem[]): ITreeNode[] {
  const map = new Map<string, ITreeNode>();
  const roots: ITreeNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentPageId && map.has(item.parentPageId)) {
      map.get(item.parentPageId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function flattenTree(nodes: ITreeNode[]): ITreeNode[] {
  const result: ITreeNode[] = [];
  function walk(items: ITreeNode[]) {
    for (const item of items) {
      result.push(item);
      if (item.children.length > 0) {
        walk(item.children);
      }
    }
  }
  walk(nodes);
  return result;
}

export function useFlatTree(items: IDocTreeItem[] | undefined) {
  return useMemo(() => {
    if (!items) return { tree: [], flat: [] };
    const tree = buildTree(items);
    const flat = flattenTree(tree);
    return { tree, flat };
  }, [items]);
}

export function buildPageSlug(title: string | null, slugId: string): string {
  if (!title) return slugId;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${slug}-${slugId}` : slugId;
}

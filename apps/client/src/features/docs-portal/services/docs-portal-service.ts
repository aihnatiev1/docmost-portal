import api from "@/lib/api-client";
import {
  IDocSpace,
  IDocTreeItem,
  IDocPageResult,
  IDocSearchResult,
  IDocTranslation,
} from "../types/docs-portal.types";

export async function getDocSpace(spaceSlug: string): Promise<IDocSpace> {
  const req = await api.get<IDocSpace>(`/docs-portal/${spaceSlug}`);
  return req.data;
}

export async function getDocSpaceHome(
  spaceSlug: string,
): Promise<{ id: string; slugId: string; title: string } | null> {
  const req = await api.get(`/docs-portal/${spaceSlug}/home`);
  return req.data;
}

export async function getDocTree(
  spaceSlug: string,
): Promise<IDocTreeItem[]> {
  const req = await api.get<IDocTreeItem[]>(`/docs-portal/${spaceSlug}/tree`);
  return req.data;
}

export async function getDocPage(
  spaceSlug: string,
  pageSlug: string,
): Promise<IDocPageResult> {
  const req = await api.get<IDocPageResult>(
    `/docs-portal/${spaceSlug}/pages/${pageSlug}`,
  );
  return req.data;
}

export async function searchDocs(
  spaceSlug: string,
  query: string,
): Promise<IDocSearchResult[]> {
  const req = await api.get<IDocSearchResult[]>(
    `/docs-portal/${spaceSlug}/search`,
    { params: { q: query } },
  );
  return req.data;
}

export async function getDocTranslations(
  spaceSlug: string,
): Promise<IDocTranslation[]> {
  const req = await api.get<IDocTranslation[]>(
    `/docs-portal/${spaceSlug}/translations`,
  );
  return req.data;
}

export async function submitFeedback(
  pageId: string,
  isHelpful: boolean,
  comment?: string,
): Promise<{ success: boolean }> {
  const req = await api.post<{ success: boolean }>("/docs-portal/feedback", {
    pageId,
    isHelpful,
    comment,
  });
  return req.data;
}

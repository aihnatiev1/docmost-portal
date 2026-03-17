import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDocSpace,
  getDocTree,
  getDocPage,
  getDocSpaceHome,
  searchDocs,
  getDocTranslations,
  submitFeedback,
} from "../services/docs-portal-service";

export function useDocSpaceQuery(spaceSlug: string) {
  return useQuery({
    queryKey: ["doc-space", spaceSlug],
    queryFn: () => getDocSpace(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocSpaceHomeQuery(spaceSlug: string) {
  return useQuery({
    queryKey: ["doc-space-home", spaceSlug],
    queryFn: () => getDocSpaceHome(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocTreeQuery(spaceSlug: string) {
  return useQuery({
    queryKey: ["doc-tree", spaceSlug],
    queryFn: () => getDocTree(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocPageQuery(spaceSlug: string, pageSlug: string) {
  return useQuery({
    queryKey: ["doc-page", spaceSlug, pageSlug],
    queryFn: () => getDocPage(spaceSlug, pageSlug),
    enabled: !!spaceSlug && !!pageSlug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDocSearchQuery(spaceSlug: string, query: string) {
  return useQuery({
    queryKey: ["doc-search", spaceSlug, query],
    queryFn: () => searchDocs(spaceSlug, query),
    enabled: !!spaceSlug && !!query && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useDocTranslationsQuery(spaceSlug: string) {
  return useQuery({
    queryKey: ["doc-translations", spaceSlug],
    queryFn: () => getDocTranslations(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeedbackMutation() {
  return useMutation({
    mutationFn: ({
      pageId,
      isHelpful,
      comment,
    }: {
      pageId: string;
      isHelpful: boolean;
      comment?: string;
    }) => submitFeedback(pageId, isHelpful, comment),
  });
}

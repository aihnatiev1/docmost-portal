export interface IDocSpace {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  portalSettings: IPortalSettings;
}

export interface IPortalSettings {
  logo?: string;
  favicon?: string;
  title?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    codeFontFamily?: string;
  };
  customDomain?: string;
  analyticsId?: string;
  customCss?: string;
  footerLinks?: Array<{ label: string; url: string }>;
  locales?: string[];
}

export interface IDocTreeItem {
  id: string;
  title: string;
  slugId: string;
  icon: string | null;
  parentPageId: string | null;
  position: string | null;
  spaceId: string;
}

export interface IDocPage {
  id: string;
  title: string;
  slugId: string;
  icon: string | null;
  content: any;
  parentPageId: string | null;
  metaDescription: string | null;
  coverPhoto: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface IDocPageResult {
  page: IDocPage;
  space: {
    id: string;
    name: string;
    slug: string;
    portalSettings: IPortalSettings;
  };
}

export interface IDocSearchResult {
  id: string;
  title: string;
  slugId: string;
  icon: string | null;
  highlight: string;
  rank: number;
}

export interface IDocTranslation {
  locale: string;
  targetSlug: string;
  targetName: string;
}

export interface ITreeNode extends IDocTreeItem {
  children: ITreeNode[];
}

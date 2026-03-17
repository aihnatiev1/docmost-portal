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
  logoDark?: string;
  favicon?: string;
  title?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    codeFontFamily?: string;
    preset?: "clean" | "muted" | "bold" | "gradient";
    tintStyle?: "none" | "subtle" | "bold";
    cornerStyle?: "rounded" | "sharp";
    sidebarBackground?: "default" | "filled";
    sidebarListStyle?: "default" | "pill" | "line";
  };
  // Layout settings
  headerEnabled?: boolean;
  searchBarStyle?: "default" | "subtle";
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementUrl?: string;
  paginationEnabled?: boolean;
  footerEnabled?: boolean;
  // Configure settings
  primaryLink?: string;
  externalLinksTarget?: "same_tab" | "new_tab";
  pageRatingsEnabled?: boolean;
  privacyPolicyUrl?: string;
  // Navigation items (header)
  navigationItems?: Array<{ label: string; url: string; type: "link" | "menu" }>;
  // Sidebar inserts (headers & external links placed between pages)
  sidebarInserts?: Array<{
    type: "header" | "link";
    label: string;
    url?: string;       // only for type "link"
    position: number;   // insert before root page at this index (0=top)
  }>;
  // Existing fields
  customDomain?: string;
  analyticsId?: string;
  customCss?: string;
  footerLinks?: Array<{ label: string; url: string }>;
  locales?: string[];
  // Sharing
  socialPreviewImage?: string;
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

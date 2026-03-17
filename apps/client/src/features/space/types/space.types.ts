import { SpaceRole } from "@/lib/types.ts";
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from "@/features/space/permissions/permissions.type.ts";
import { ExportFormat } from "@/features/page/types/page.types.ts";

export interface ISpaceSharingSettings {
  disabled?: boolean;
}

export interface ISpaceSettings {
  sharing?: ISpaceSharingSettings;
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
  // Navigation items
  navigationItems?: Array<{ label: string; url: string; type: "link" | "menu" }>;
  // Existing fields
  customDomain?: string;
  analyticsId?: string;
  customCss?: string;
  footerLinks?: Array<{ label: string; url: string }>;
  locales?: string[];
  // Sharing
  socialPreviewImage?: string;
}

export interface ISpace {
  id: string;
  name: string;
  description: string;
  logo?: string;
  slug: string;
  hostname: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  spaceId?: string;
  membership?: IMembership;
  settings?: ISpaceSettings;
  type?: string;
  portalSettings?: IPortalSettings;
  // for updates
  disablePublicSharing?: boolean;
}

interface IMembership {
  userId: string;
  role: SpaceRole;
  permissions?: Permissions;
}

interface Permission {
  action: SpaceCaslAction;
  subject: SpaceCaslSubject;
}

type Permissions = Permission[];

export interface IAddSpaceMember {
  spaceId: string;
  userIds?: string[];
  groupIds?: string[];
}

export interface IRemoveSpaceMember {
  spaceId: string;
  userId?: string;
  groupId?: string;
}

export interface IChangeSpaceMemberRole {
  spaceId: string;
  userId?: string;
  groupId?: string;
}

// space member
export interface SpaceUserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  type: "user";
}

export interface SpaceGroupInfo {
  id: string;
  name: string;
  isDefault: boolean;
  memberCount: number;
  type: "group";
}

export type ISpaceMember = { role: string } & (SpaceUserInfo | SpaceGroupInfo);

export interface IExportSpaceParams {
  spaceId: string;
  format: ExportFormat;
  includeAttachments?: boolean;
}

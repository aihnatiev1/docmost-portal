import { SpaceRole } from "@/lib/types.ts";
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from "@/features/space/permissions/permissions.type.ts";
import { ExportFormat } from "@/features/page/types/page.types.ts";

export interface ISpaceSharingSettings {
  disabled?: boolean;
}

export interface ISpaceCommentsSettings {
  allowViewerComments?: boolean;
}

export interface ISpaceSettings {
  sharing?: ISpaceSharingSettings;
  comments?: ISpaceCommentsSettings;
}

export interface IPortalSettings {
  logo?: string;
  logoDark?: string;
  favicon?: string;
  title?: string;
  description?: string;
  theme?: {
    preset?: string;
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    codeFontFamily?: string;
    cornerStyle?: string;
    tintStyle?: string;
    sidebarBackground?: string;
    sidebarListStyle?: string;
  };
  headerEnabled?: boolean;
  paginationEnabled?: boolean;
  footerEnabled?: boolean;
  customDomain?: string;
  analyticsId?: string;
  customCss?: string;
  footerLinks?: Array<{ label: string; url: string }>;
  locales?: string[];
  socialPreviewImage?: string;
  pageRatingsEnabled?: boolean;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementUrl?: string;
  sidebarInserts?: any[];
  externalLinksTarget?: "same_tab" | "new_tab";
  navigationItems?: Array<{ label: string; url: string; type: string }>;
  searchBarStyle?: string;
  primaryLink?: string;
  privacyPolicyUrl?: string;
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
  allowViewerComments?: boolean;
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

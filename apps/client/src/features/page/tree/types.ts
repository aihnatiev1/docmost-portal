export type SpaceTreeNode = {
  id: string;
  slugId: string;
  name: string;
  icon?: string;
  position: string;
  spaceId: string;
  parentPageId: string;
  hasChildren: boolean;
  canEdit?: boolean;
  children: SpaceTreeNode[];
  // Sidebar insert fields (for header/link items)
  _insertType?: "header" | "link";
  _insertUrl?: string;
};

export interface SidebarInsert {
  type: "header" | "link";
  label: string;
  url?: string;
  position: number;
}

type DeleteInsertFn = (insert: SidebarInsert) => Promise<void>;

// Module-level ref for the delete callback (set by SpaceSidebar, used by tree Node)
let _deleteInsertFn: DeleteInsertFn | null = null;

export function setDeleteInsertFn(fn: DeleteInsertFn | null) {
  _deleteInsertFn = fn;
}

export function getDeleteInsertFn(): DeleteInsertFn | null {
  return _deleteInsertFn;
}

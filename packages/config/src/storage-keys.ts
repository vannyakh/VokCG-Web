/** Central registry of localStorage keys used by Zustand persist middleware */
export const STORAGE_KEYS = {
  adminUi: 'mpt-admin-ui',
  /** @deprecated Use `userAuth` or `adminAuth` */
  auth: 'mpt-auth',
  userAuth: 'mpt-user-auth',
  adminAuth: 'mpt-admin-auth',
  sidebar: 'mpt-sidebar',
  workspace: 'mpt-workspace',
  createStudio: 'mpt-create-studio',
  createDraft: 'mpt-create-draft',
  tasksViewMode: 'mpt-tasks-view',
  locale: 'mpt-ui-locale',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

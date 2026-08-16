export type Role = 'super_admin' | 'admin' | 'editor' | 'supervisor' | 'researcher' | 'creator' | 'moderator' | 'translator' | 'photographer' | 'volunteer' | 'viewer' | 'member';

export type Permission = 
  | 'content.create' | 'content.edit' | 'content.delete' | 'content.publish'
  | 'media.upload' | 'media.delete'
  | 'users.manage' | 'users.view'
  | 'settings.view' | 'settings.edit'
  | 'translations.manage'
  | 'analytics.view'
  | 'admin.access'
  | 'theme.view' | 'theme.edit'
  | 'branding.view' | 'branding.edit'
  | 'navigation.manage'
  | 'pages.view' | 'pages.create' | 'pages.edit' | 'pages.delete' | 'pages.publish'
  | 'video.view' | 'video.create' | 'video.edit' | 'video.delete' | 'video.publish'
  | 'reels.view' | 'reels.create' | 'reels.edit' | 'reels.delete' | 'reels.publish'
  | 'permissions.manage'
  | 'assets.manage';

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 90,
  supervisor: 85,
  editor: 70,
  moderator: 65,
  creator: 60,
  researcher: 45,
  translator: 35,
  photographer: 25,
  volunteer: 10,
  viewer: 5,
  member: 0,
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'content.create', 'content.edit', 'content.delete', 'content.publish',
    'media.upload', 'media.delete',
    'users.manage', 'users.view',
    'settings.view', 'settings.edit',
    'translations.manage',
    'analytics.view',
    'admin.access',
    'theme.view', 'theme.edit',
    'branding.view', 'branding.edit',
    'navigation.manage',
    'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
    'video.view', 'video.create', 'video.edit', 'video.delete', 'video.publish',
    'reels.view', 'reels.create', 'reels.edit', 'reels.delete', 'reels.publish',
    'permissions.manage',
    'assets.manage',
  ],
  admin: [
    'content.create', 'content.edit', 'content.delete', 'content.publish',
    'media.upload', 'media.delete',
    'users.view',
    'settings.view',
    'translations.manage',
    'analytics.view',
    'admin.access',
    'theme.view', 'theme.edit',
    'branding.view', 'branding.edit',
    'navigation.manage',
    'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
    'video.view', 'video.create', 'video.edit', 'video.delete', 'video.publish',
    'reels.view', 'reels.create', 'reels.edit', 'reels.delete', 'reels.publish',
    'assets.manage',
  ],
  supervisor: [
    'content.create', 'content.edit', 'content.delete', 'content.publish',
    'media.upload', 'media.delete',
    'users.view',
    'settings.view', 'settings.edit',
    'translations.manage',
    'analytics.view',
    'admin.access',
    'theme.view', 'theme.edit',
    'branding.view', 'branding.edit',
    'navigation.manage',
    'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
    'video.view', 'video.create', 'video.edit', 'video.delete', 'video.publish',
    'reels.view', 'reels.create', 'reels.edit', 'reels.delete', 'reels.publish',
    'assets.manage',
  ],
  editor: [
    'content.create', 'content.edit', 'content.publish',
    'media.upload',
    'admin.access',
    'pages.view', 'pages.create', 'pages.edit', 'pages.publish',
    'video.view', 'video.create', 'video.edit', 'video.publish',
    'reels.view', 'reels.create', 'reels.edit', 'reels.publish',
  ],
  moderator: [
    'content.edit',
    'media.upload',
    'admin.access',
    'pages.view',
    'video.view', 'video.edit',
    'reels.view', 'reels.edit',
    'analytics.view',
  ],
  creator: [
    'content.create',
    'media.upload',
    'pages.view', 'pages.create', 'pages.edit',
    'video.view', 'video.create', 'video.edit',
    'reels.view', 'reels.create', 'reels.edit',
    'analytics.view',
  ],
  researcher: ['content.create', 'content.edit', 'media.upload'],
  translator: ['translations.manage', 'content.edit'],
  photographer: ['media.upload'],
  volunteer: [],
  viewer: [
    'users.view',
    'analytics.view',
    'pages.view',
    'video.view',
    'reels.view',
    'theme.view',
    'branding.view',
    'settings.view',
  ],
  member: [],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function hasRole(userRole: Role, minimumRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minimumRole] ?? 0);
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    supervisor: 'Supervisor',
    editor: 'Editor',
    moderator: 'Moderator',
    creator: 'Creator',
    researcher: 'Researcher',
    translator: 'Translator',
    photographer: 'Photographer',
    volunteer: 'Volunteer',
    viewer: 'Viewer',
    member: 'Member',
  };
  return labels[role];
}

export const ALL_ROLES: Role[] = ['super_admin', 'admin', 'supervisor', 'editor', 'moderator', 'creator', 'researcher', 'translator', 'photographer', 'volunteer', 'viewer', 'member'];

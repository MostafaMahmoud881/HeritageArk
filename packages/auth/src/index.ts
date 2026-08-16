export {
  type Role,
  type Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
  getRoleLabel,
  ALL_ROLES,
} from './roles';

export interface User {
  id: string;
  email: string;
  name: string;
  role: import('./roles').Role;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

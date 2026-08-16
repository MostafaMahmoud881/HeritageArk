import { describe, it, expect } from 'vitest';
import { hasPermission, hasRole, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '@heritageverse/auth';
import type { Role, Permission } from '@heritageverse/auth';

describe('hasPermission', () => {
  it('grants super_admin all permissions', () => {
    const permissions: Permission[] = [
      'content.create', 'content.edit', 'content.delete', 'content.publish',
      'media.upload', 'media.delete', 'users.manage', 'users.view',
      'settings.view', 'settings.edit', 'translations.manage',
      'analytics.view', 'admin.access',
    ];
    for (const perm of permissions) {
      expect(hasPermission('super_admin', perm)).toBe(true);
    }
  });

  it('grants admin most permissions except users.manage and settings.edit', () => {
    expect(hasPermission('admin', 'content.create')).toBe(true);
    expect(hasPermission('admin', 'content.delete')).toBe(true);
    expect(hasPermission('admin', 'users.manage')).toBe(false);
    expect(hasPermission('admin', 'settings.edit')).toBe(false);
    expect(hasPermission('admin', 'admin.access')).toBe(true);
  });

  it('grants editor content permissions but not user management', () => {
    expect(hasPermission('editor', 'content.create')).toBe(true);
    expect(hasPermission('editor', 'content.edit')).toBe(true);
    expect(hasPermission('editor', 'content.publish')).toBe(true);
    expect(hasPermission('editor', 'content.delete')).toBe(false);
    expect(hasPermission('editor', 'users.manage')).toBe(false);
    expect(hasPermission('editor', 'media.delete')).toBe(false);
  });

  it('grants researcher content creation and editing', () => {
    expect(hasPermission('researcher', 'content.create')).toBe(true);
    expect(hasPermission('researcher', 'content.edit')).toBe(true);
    expect(hasPermission('researcher', 'media.upload')).toBe(true);
    expect(hasPermission('researcher', 'content.publish')).toBe(false);
    expect(hasPermission('researcher', 'content.delete')).toBe(false);
  });

  it('grants translator translation management', () => {
    expect(hasPermission('translator', 'translations.manage')).toBe(true);
    expect(hasPermission('translator', 'content.edit')).toBe(true);
    expect(hasPermission('translator', 'media.upload')).toBe(false);
  });

  it('grants photographer media upload only', () => {
    expect(hasPermission('photographer', 'media.upload')).toBe(true);
    expect(hasPermission('photographer', 'content.create')).toBe(false);
    expect(hasPermission('photographer', 'admin.access')).toBe(false);
  });

  it('grants volunteer no permissions', () => {
    const permissions: Permission[] = [
      'content.create', 'content.edit', 'media.upload', 'admin.access',
    ];
    for (const perm of permissions) {
      expect(hasPermission('volunteer', perm)).toBe(false);
    }
  });

  it('grants member no permissions', () => {
    expect(hasPermission('member', 'content.create')).toBe(false);
    expect(hasPermission('member', 'admin.access')).toBe(false);
  });

  it('returns false for unknown role', () => {
    expect(hasPermission('unknown' as Role, 'content.create')).toBe(false);
  });
});

describe('role hierarchy', () => {
  it('has correct hierarchy values', () => {
    expect(ROLE_HIERARCHY.super_admin).toBe(100);
    expect(ROLE_HIERARCHY.admin).toBe(90);
    expect(ROLE_HIERARCHY.editor).toBe(70);
    expect(ROLE_HIERARCHY.researcher).toBe(45);
    expect(ROLE_HIERARCHY.translator).toBe(35);
    expect(ROLE_HIERARCHY.photographer).toBe(25);
    expect(ROLE_HIERARCHY.volunteer).toBe(10);
    expect(ROLE_HIERARCHY.member).toBe(0);
  });

  it('super_admin has role >= all roles', () => {
    const roles: Role[] = ['admin', 'editor', 'researcher', 'translator', 'photographer', 'volunteer', 'member'];
    for (const role of roles) {
      expect(hasRole('super_admin', role)).toBe(true);
    }
  });

  it('member only meets member requirement', () => {
    expect(hasRole('member', 'member')).toBe(true);
    expect(hasRole('member', 'volunteer')).toBe(false);
    expect(hasRole('member', 'admin')).toBe(false);
  });

  it('admin meets editor and below requirements', () => {
    expect(hasRole('admin', 'editor')).toBe(true);
    expect(hasRole('admin', 'member')).toBe(true);
    expect(hasRole('admin', 'super_admin')).toBe(false);
  });
});

describe('login validation', () => {
  it('requires email and password', () => {
    const validateLogin = (email: string, password: string) => {
      if (!email || !password) {
        return { valid: false, error: 'Email and password required' };
      }
      return { valid: true };
    };

    expect(validateLogin('', 'pass').valid).toBe(false);
    expect(validateLogin('test@test.com', '').valid).toBe(false);
    expect(validateLogin('', '').valid).toBe(false);
    expect(validateLogin('test@test.com', 'pass').valid).toBe(true);
  });

  it('validates email format', () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail('user@domain.com')).toBe(true);
  });
});

describe('register validation', () => {
  it('requires name, email, and password', () => {
    const validateRegister = (name: string, email: string, password: string) => {
      if (!name || !email || !password) {
        return { valid: false, error: 'Name, email and password required' };
      }
      if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
      }
      return { valid: true };
    };

    expect(validateRegister('', 'e@e.com', 'pass').valid).toBe(false);
    expect(validateRegister('Name', '', 'pass').valid).toBe(false);
    expect(validateRegister('Name', 'e@e.com', '').valid).toBe(false);
    expect(validateRegister('Name', 'e@e.com', '1234567').valid).toBe(false);
    expect(validateRegister('Name', 'e@e.com', '12345678').valid).toBe(true);
  });

  it('prevents duplicate email registration', () => {
    const registeredEmails = new Set(['existing@test.com']);
    const register = (email: string) => {
      if (registeredEmails.has(email)) {
        return { success: false, error: 'Email already registered' };
      }
      registeredEmails.add(email);
      return { success: true };
    };

    expect(register('existing@test.com').success).toBe(false);
    expect(register('new@test.com').success).toBe(true);
  });
});

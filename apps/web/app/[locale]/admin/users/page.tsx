'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { Button, Input, Badge } from '@heritageverse/ui';
import type { Role, Permission } from '@heritageverse/auth';
import { ROLE_PERMISSIONS, getRoleLabel } from '@heritageverse/auth';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'verified' | 'unverified';
  lastLogin: string | null;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ALL_PERMISSIONS: Permission[] = [
  'admin.access', 'content.create', 'content.edit', 'content.delete', 'content.publish',
  'media.upload', 'media.delete', 'users.view', 'users.manage',
  'settings.view', 'settings.edit', 'translations.manage', 'analytics.view',
  'theme.view', 'theme.edit', 'branding.view', 'branding.edit',
  'navigation.manage',
  'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
  'video.view', 'video.create', 'video.edit', 'video.delete', 'video.publish',
  'reels.view', 'reels.create', 'reels.edit', 'reels.delete', 'reels.publish',
  'permissions.manage', 'assets.manage',
];

const ALL_ROLES: Role[] = ['super_admin', 'admin', 'supervisor', 'editor', 'moderator', 'creator', 'researcher', 'translator', 'photographer', 'volunteer', 'viewer', 'member'];

const PERMISSION_LABELS: Record<Permission, string> = {
  'admin.access': 'Admin Access',
  'content.create': 'Create Content',
  'content.edit': 'Edit Content',
  'content.delete': 'Delete Content',
  'content.publish': 'Publish Content',
  'media.upload': 'Upload Media',
  'media.delete': 'Delete Media',
  'users.view': 'View Users',
  'users.manage': 'Manage Users',
  'settings.view': 'View Settings',
  'settings.edit': 'Edit Settings',
  'translations.manage': 'Manage Translations',
  'analytics.view': 'View Analytics',
  'theme.view': 'View Theme',
  'theme.edit': 'Edit Theme',
  'branding.view': 'View Branding',
  'branding.edit': 'Edit Branding',
  'navigation.manage': 'Manage Navigation',
  'pages.view': 'View Pages',
  'pages.create': 'Create Pages',
  'pages.edit': 'Edit Pages',
  'pages.delete': 'Delete Pages',
  'pages.publish': 'Publish Pages',
  'video.view': 'View Videos',
  'video.create': 'Create Videos',
  'video.edit': 'Edit Videos',
  'video.delete': 'Delete Videos',
  'video.publish': 'Publish Videos',
  'reels.view': 'View Reels',
  'reels.create': 'Create Reels',
  'reels.edit': 'Edit Reels',
  'reels.delete': 'Delete Reels',
  'reels.publish': 'Publish Reels',
  'permissions.manage': 'Manage Permissions',
  'assets.manage': 'Manage Assets',
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('heritageverse_access_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function UsersPage() {
  const { can, user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canManage = can('users.manage');

  // Add user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit user form
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('editor');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('heritageverse_access_token');
      const params = new URLSearchParams({ search: q, limit: '100' });
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(search);
  }, [fetchUsers, search]);

  const resetAddForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('editor');
    setFormError(null);
  };

  const openAdd = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const handleAddUser = async () => {
    setFormError(null);
    if (!name.trim() || !email.trim() || !password) {
      setFormError('Name, email and password are required');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowAddModal(false);
      resetAddForm();
      fetchUsers(search);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (u: AdminUser, newRole: Role) => {
    if (newRole === u.role) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, role: newRole } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      fetchUsers(search);
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditPassword('');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditError(null);
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { name: editName.trim(), role: editRole };
      if (editPassword) payload.password = editPassword;
      const res = await fetch(`/api/admin/users/${editTarget.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      setShowEditModal(false);
      setEditTarget(null);
      fetchUsers(search);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      fetchUsers(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const canChangeRoleTo = (target: Role): boolean => {
    if (currentUser?.role === 'super_admin') return target !== 'super_admin' || currentUser.role === 'super_admin';
    return target !== 'super_admin';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">User Management</h1>
          <p className="text-muted mt-1">{loading ? 'Loading...' : `${total} registered users`}</p>
        </div>
        {canManage && (
          <Button variant="primary" size="md" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add User
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="text-left py-3.5 px-4 font-medium text-muted">User</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted">Role</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted">Status</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted">Last Login</th>
                <th className="text-right py-3.5 px-4 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">Loading users...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-danger">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">No users found.</td>
                </tr>
              ) : users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                const disabled = !canManage || isSelf || (u.role === 'super_admin' && currentUser?.role !== 'super_admin');
                return (
                <tr key={u.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-accent text-sm font-bold">{u.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-navy">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {canManage ? (
                      <select
                        value={u.role}
                        disabled={disabled}
                        onChange={e => handleRoleChange(u, e.target.value as Role)}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ALL_ROLES.map(r => (
                          <option key={r} value={r} disabled={!canChangeRoleTo(r)}>{getRoleLabel(r)}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="navy" size="sm">{getRoleLabel(u.role)}</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'verified' ? 'success' : 'muted'} size="sm">
                      {u.status === 'verified' ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                  <td className="py-3.5 px-4 text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          disabled={!canManage || (u.role === 'super_admin' && currentUser?.role !== 'super_admin')}
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={!canManage || isSelf || (u.role === 'super_admin' && currentUser?.role !== 'super_admin')}
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-medium text-muted sticky left-0 bg-white">Permission</th>
                {ALL_ROLES.map(r => (
                  <th key={r} className="text-center py-2 px-2 font-medium text-muted whitespace-nowrap">
                    {getRoleLabel(r)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map(perm => (
                <tr key={perm} className="border-t border-border/30">
                  <td className="py-2.5 px-3 text-navy font-medium sticky left-0 bg-white">
                    {PERMISSION_LABELS[perm]}
                  </td>
                  {ALL_ROLES.map(r => {
                    const has = ROLE_PERMISSIONS[r]?.includes(perm);
                    return (
                      <td key={r} className="text-center py-2.5 px-2">
                        {has ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" className="mx-auto">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-border">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <h2 className="text-lg font-semibold text-navy mb-5">Add New User</h2>
            <div className="space-y-4">
              <Input label="Full Name" placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Email" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              <Input label="Password" type="password" placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r} disabled={r === 'super_admin' && currentUser?.role !== 'super_admin'}>{getRoleLabel(r)}</option>
                  ))}
                </select>
              </div>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)} disabled={busy}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleAddUser} disabled={busy}>
                  {busy ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <h2 className="text-lg font-semibold text-navy mb-1">Edit User</h2>
            <p className="text-xs text-muted mb-5">{editTarget.email}</p>
            <div className="space-y-4">
              <Input label="Full Name" value={editName} onChange={e => setEditName(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Role</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r} disabled={r === 'super_admin' && currentUser?.role !== 'super_admin'}>{getRoleLabel(r)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Reset Password <span className="text-muted font-normal">(leave blank to keep)</span></label>
                <Input type="password" placeholder="New password (min 8 chars)" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              {editError && <p className="text-sm text-danger">{editError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowEditModal(false)} disabled={busy}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={handleEditSave} disabled={busy}>
                  {busy ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

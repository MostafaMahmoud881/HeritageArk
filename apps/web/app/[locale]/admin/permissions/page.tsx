'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { Button, Badge } from '@heritageverse/ui';
import { getCsrfToken } from '@/lib/api';

interface Role {
  id: number;
  name: string;
  label: string;
  level: number;
  isSystem: boolean;
  description: string;
  permissionIds: number[];
}

interface PermissionDefinition {
  id: number;
  key: string;
  label: string;
  group: string;
  description: string;
}

const PERMISSION_GROUPS = ['Content', 'Media', 'Design', 'Studio', 'Administration'] as const;

const GROUP_COLORS: Record<string, string> = {
  Content: 'bg-blue-50 border-blue-200 text-blue-700',
  Media: 'bg-purple-50 border-purple-200 text-purple-700',
  Design: 'bg-pink-50 border-pink-200 text-pink-700',
  Studio: 'bg-orange-50 border-orange-200 text-orange-700',
  Administration: 'bg-teal-50 border-teal-200 text-teal-700',
};

export default function PermissionsPage() {
  const { can } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [roles, setRoles] = useState<Role[]>([]);
  const [definitions, setDefinitions] = useState<PermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Set<number>>(new Set());
  const [savingRole, setSavingRole] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rolesRes, defsRes] = await Promise.all([
          fetch('/api/admin/permissions'),
          fetch('/api/admin/permissions/definitions'),
        ]);
        if (!rolesRes.ok) throw new Error('Failed to fetch roles');
        if (!defsRes.ok) throw new Error('Failed to fetch permission definitions');
        const rolesBody = await rolesRes.json();
        const defsBody = await defsRes.json();
        setRoles(rolesBody.data ?? rolesBody);
        setDefinitions(defsBody.data ?? defsBody);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const grouped = PERMISSION_GROUPS.map(group => ({
    group,
    permissions: definitions.filter(d => d.group === group),
  }));

  const togglePermission = (roleId: number, permId: number) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const next = new Set(r.permissionIds);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return { ...r, permissionIds: Array.from(next) };
    }));
  };

  const handleSavePermissions = async (role: Role) => {
    setSavingRole(role.id);
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['x-csrf-token'] = csrfToken;
      const res = await fetch(`/api/admin/permissions/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ permissionIds: role.permissionIds }),
      });
      if (!res.ok) throw new Error('Failed to save permissions');
      setExpandedRole(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save permissions');
    } finally {
      setSavingRole(null);
    }
  };

  if (!can('permissions.manage')) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton-pulse rounded" />
        <div className="h-4 w-72 skeleton-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 skeleton-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 skeleton-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif text-navy">Permissions</h1>
        <div className="bg-danger/10 text-danger p-4 rounded-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Permissions</h1>
          <p className="text-muted mt-1">Manage roles and granular permission assignments across the platform</p>
        </div>
      </div>

      {/* Roles Section */}
      <div>
        <h2 className="text-lg font-semibold text-navy mb-4">Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                expandedRole === role.id
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border hover:border-accent/40 hover:shadow-card'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy">{role.label}</h3>
                    {role.isSystem && (
                      <Badge variant="navy" size="sm">System</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">Level {role.level} &middot; {role.name}</p>
                </div>
                {role.isSystem ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0 mt-0.5" aria-label="System role - locked">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <button
                    onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                    className="p-1 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors shrink-0"
                    title="Edit permissions"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>
              {role.description && (
                <p className="text-xs text-muted leading-relaxed">{role.description}</p>
              )}

              {/* Inline Permission Editor */}
              {expandedRole === role.id && !role.isSystem && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {grouped.map(({ group, permissions }) => {
                    if (permissions.length === 0) return null;
                    return (
                      <div key={group}>
                        <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">{group}</p>
                        <div className="space-y-1.5">
                          {permissions.map(perm => {
                            const checked = role.permissionIds.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                    checked
                                      ? 'bg-accent border-accent'
                                      : 'border-border group-hover:border-accent/50'
                                  }`}
                                  onClick={() => togglePermission(role.id, perm.id)}
                                >
                                  {checked && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-xs text-navy">{perm.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={savingRole === role.id}
                      onClick={() => handleSavePermissions(role)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-navy">Permission Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-bg/50">
                <th className="text-left py-3 px-4 font-medium text-muted sticky left-0 bg-bg/50 min-w-[200px]">Permission</th>
                {roles.map(r => (
                  <th key={r.id} className="text-center py-3 px-3 font-medium text-muted whitespace-nowrap min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      {r.label}
                      {r.isSystem && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ group, permissions }) => {
                if (permissions.length === 0) return null;
                return (
                  <>
                    <tr key={group} className="bg-bg/30">
                      <td
                        colSpan={roles.length + 1}
                        className="py-2 px-4 text-xs font-semibold uppercase tracking-wider"
                      >
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${GROUP_COLORS[group] || 'bg-bg text-muted'}`}>
                          {group}
                        </span>
                      </td>
                    </tr>
                    {permissions.map(perm => (
                      <tr key={perm.id} className="border-t border-border/30 hover:bg-bg/20 transition-colors">
                        <td className="py-2.5 px-4 text-navy font-medium sticky left-0 bg-white hover:bg-bg/20 min-w-[200px]">
                          <div>
                            <p className="text-xs font-medium">{perm.label}</p>
                            <p className="text-[10px] text-muted/70">{perm.key}</p>
                          </div>
                        </td>
                        {roles.map(r => {
                          const has = r.permissionIds.includes(perm.id);
                          return (
                            <td key={r.id} className="text-center py-2.5 px-3">
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
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

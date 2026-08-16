'use client';

import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Badge } from '@heritageverse/ui';

type NavItem = {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'dropdown' | 'mega_menu' | 'divider';
  target: '_self' | '_blank';
  parentId: string | null;
  order: number;
  megaMenuColumns?: number;
};

type Menu = {
  id: string;
  name: string;
  slug: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  items: NavItem[];
};

const LOCATIONS = [
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'mobile', label: 'Mobile' },
];

const ITEM_TYPES = [
  { value: 'link', label: 'Link' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'mega_menu', label: 'Mega Menu' },
  { value: 'divider', label: 'Divider' },
];

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heritageverse_access_token');
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function NavigationPage() {
  const { user } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', slug: '', location: 'header' as Menu['location'] });
  const [itemForm, setItemForm] = useState<{
    label: string; url: string; type: NavItem['type']; target: '_self' | '_blank';
    parentId: string | null; order: number; megaMenuColumns: number;
  }>({ label: '', url: '', type: 'link', target: '_self', parentId: null, order: 0, megaMenuColumns: 3 });

  const editingMenu = menus.find(m => m.id === editingMenuId);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/navigation', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load navigation');
      const body = await res.json();
      const data = body.data ?? body;
      setMenus(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  async function fetchItemsForMenu(menuId: string) {
    try {
      const res = await fetch(`/api/admin/navigation/${menuId}/items`, { headers: authHeaders() });
      if (!res.ok) return;
      const items = await res.json();
      setMenus(prev => prev.map(m => m.id === menuId ? { ...m, items: Array.isArray(items) ? items : [] } : m));
    } catch {
      // silent
    }
  }

  function handleEditMenu(menu: Menu) {
    setEditingMenuId(menu.id);
    setMenuForm({ name: menu.name, slug: menu.slug, location: menu.location });
    if (!menu.items) fetchItemsForMenu(menu.id);
  }

  function handleCloseEditor() {
    setEditingMenuId(null);
    setShowAddItem(false);
  }

  // Menu CRUD
  async function handleSaveMenu() {
    if (!editingMenuId) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/navigation/${editingMenuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(menuForm),
      });
      if (!res.ok) throw new Error('Failed to update menu');
      setSuccess('Menu updated successfully');
      fetchMenus();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteMenu(menuId: string) {
    if (!confirm('Are you sure you want to delete this menu?')) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/navigation/${menuId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete menu');
      setSuccess('Menu deleted successfully');
      if (editingMenuId === menuId) setEditingMenuId(null);
      fetchMenus();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleCreateMenu() {
    if (!menuForm.name.trim() || !menuForm.slug.trim()) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(menuForm),
      });
      if (!res.ok) throw new Error('Failed to create menu');
      setShowAddMenu(false);
      setMenuForm({ name: '', slug: '', location: 'header' });
      setSuccess('Menu created successfully');
      fetchMenus();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Item CRUD
  async function handleAddItem() {
    if (!editingMenuId || !itemForm.label.trim()) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/navigation/${editingMenuId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(itemForm),
      });
      if (!res.ok) throw new Error('Failed to add item');
      setShowAddItem(false);
      setItemForm({ label: '', url: '', type: 'link', target: '_self', parentId: null, order: 0, megaMenuColumns: 3 });
      setSuccess('Item added successfully');
      fetchItemsForMenu(editingMenuId);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!editingMenuId || !confirm('Delete this item?')) return;
    try {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/admin/navigation/${editingMenuId}/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete item');
      setSuccess('Item deleted');
      fetchItemsForMenu(editingMenuId);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleMoveItem(itemId: string, direction: 'up' | 'down') {
    if (!editingMenuId || !editingMenu) return;
    const items = [...editingMenu.items];
    const idx = items.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= items.length) return;
    const a = items[idx];
    const b = items[swap];
    if (!a || !b) return;
    items[idx] = b;
    items[swap] = a;
    items.forEach((item, i) => { item.order = i; });
    try {
      setError(null);
      const res = await fetch(`/api/admin/navigation/${editingMenuId}/items/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ items: items.map(i => ({ id: i.id, order: i.order })) }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      setMenus(prev => prev.map(m => m.id === editingMenuId ? { ...m, items } : m));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton-pulse rounded" />
        <div className="h-4 w-64 skeleton-pulse rounded" />
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-6">
              <div className="h-5 w-32 skeleton-pulse rounded mb-2" />
              <div className="h-3 w-20 skeleton-pulse rounded mb-4" />
              <div className="h-10 w-full skeleton-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy">Navigation Management</h1>
          <p className="text-muted mt-1">Create and manage your site navigation menus</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { setShowAddMenu(true); setMenuForm({ name: '', slug: '', location: 'header' }); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Menu
        </Button>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-5 py-3 text-danger text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl px-5 py-3 text-success text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      {/* Menu List */}
      <div className="grid grid-cols-1 gap-4">
        {menus.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-border p-10 text-center">
            <p className="text-muted">No menus yet. Click &quot;Add Menu&quot; to create one.</p>
          </div>
        )}

        {menus.map(menu => (
          <div
            key={menu.id}
            className={`bg-white rounded-xl border transition-shadow ${
              editingMenuId === menu.id ? 'border-accent shadow-card' : 'border-border hover:shadow-card'
            }`}
          >
            {/* Menu Card Header */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-navy">{menu.name}</h3>
                  <p className="text-xs text-muted">/{menu.slug}</p>
                </div>
                <Badge variant={menu.location === 'header' ? 'accent' : menu.location === 'footer' ? 'navy' : 'gold'}>
                  {LOCATIONS.find(l => l.value === menu.location)?.label || menu.location}
                </Badge>
                <Badge variant="muted">
                  {menu.items?.length || 0} items
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditMenu(menu)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteMenu(menu.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </Button>
              </div>
            </div>

            {/* Inline Editor */}
            {editingMenuId === menu.id && (
              <div className="border-t border-border px-6 py-5 space-y-5">
                <h4 className="text-sm font-semibold text-navy uppercase tracking-wider">Edit Menu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Menu Name"
                    value={menuForm.name}
                    onChange={e => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="Slug"
                    value={menuForm.slug}
                    onChange={e => setMenuForm(prev => ({ ...prev, slug: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Location</label>
                    <select
                      value={menuForm.location}
                      onChange={e => setMenuForm(prev => ({ ...prev, location: e.target.value as Menu['location'] }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    >
                      {LOCATIONS.map(loc => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleSaveMenu}>
                    Save Menu
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCloseEditor}>
                    Close
                  </Button>
                </div>

                {/* Items Section */}
                <div className="border-t border-border pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-navy uppercase tracking-wider">Menu Items</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemForm({
                          label: '', url: '', type: 'link', target: '_self',
                          parentId: null, order: menu.items?.length || 0, megaMenuColumns: 3,
                        });
                        setShowAddItem(true);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Add Item
                    </Button>
                  </div>

                  {(!menu.items || menu.items.length === 0) && (
                    <p className="text-sm text-muted py-4 text-center">No items in this menu.</p>
                  )}

                  <div className="space-y-2">
                    {menu.items?.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-bg/50 border border-border/50 group"
                      >
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveItem(item.id, 'up')}
                            disabled={idx === 0}
                            className="text-muted hover:text-navy disabled:opacity-30 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                          </button>
                          <button
                            onClick={() => handleMoveItem(item.id, 'down')}
                            disabled={idx === (menu.items?.length || 0) - 1}
                            className="text-muted hover:text-navy disabled:opacity-30 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                        </div>

                        {/* Item content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-navy truncate">{item.label || '(divider)'}</span>
                            <Badge variant={item.type === 'dropdown' ? 'gold' : item.type === 'mega_menu' ? 'navy' : item.type === 'divider' ? 'muted' : 'accent'} size="sm">
                              {item.type === 'mega_menu' ? 'mega' : item.type}
                            </Badge>
                            {item.target === '_blank' && (
                              <Badge variant="navy" size="sm">_blank</Badge>
                            )}
                            {item.parentId && <Badge variant="muted" size="sm">nested</Badge>}
                          </div>
                          {item.url && (
                            <p className="text-xs text-muted truncate">{item.url}</p>
                          )}
                          {item.type === 'mega_menu' && item.megaMenuColumns && (
                            <p className="text-xs text-muted">{item.megaMenuColumns} columns</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-danger/50 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Menu Modal */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold text-navy mb-4">Create New Menu</h3>
            <div className="space-y-4">
              <Input
                label="Menu Name"
                value={menuForm.name}
                onChange={e => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Main Navigation"
              />
              <Input
                label="Slug"
                value={menuForm.slug}
                onChange={e => setMenuForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="main-nav"
              />
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Location</label>
                <select
                  value={menuForm.location}
                  onChange={e => setMenuForm(prev => ({ ...prev, location: e.target.value as Menu['location'] }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" size="md" onClick={() => setShowAddMenu(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleCreateMenu} disabled={!menuForm.name.trim() || !menuForm.slug.trim()}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && editingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-navy mb-4">Add Menu Item</h3>
            <div className="space-y-4">
              <Input
                label="Label"
                value={itemForm.label}
                onChange={e => setItemForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Home"
              />
              <Input
                label="URL"
                value={itemForm.url}
                onChange={e => setItemForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="/home"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Type</label>
                  <select
                    value={itemForm.type}
                    onChange={e => setItemForm(prev => ({ ...prev, type: e.target.value as NavItem['type'] }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  >
                    {ITEM_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Target</label>
                  <select
                    value={itemForm.target}
                    onChange={e => setItemForm(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>
              {itemForm.type === 'mega_menu' && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Mega Menu Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={itemForm.megaMenuColumns}
                    onChange={e => setItemForm(prev => ({ ...prev, megaMenuColumns: parseInt(e.target.value) || 3 }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Parent Item (for nesting)</label>
                <select
                  value={itemForm.parentId || ''}
                  onChange={e => setItemForm(prev => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">None (top-level)</option>
                  {editingMenu.items?.filter(i => i.type !== 'divider').map(item => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Order"
                type="number"
                min={0}
                value={String(itemForm.order)}
                onChange={e => setItemForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" size="md" onClick={() => setShowAddItem(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleAddItem} disabled={!itemForm.label.trim()}>Add Item</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

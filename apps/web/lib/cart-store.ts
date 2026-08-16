import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  origin: string;
  artisan: string;
  qty: number;
  flag: string;
}

interface CartStore {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) return { items: s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
          return { items: [...s.items, { ...item, qty: 1 }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      increment: (id) => set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) })),
      decrement: (id) =>
        set((s) => ({
          items: s.items.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'hv-cart' }
  )
);

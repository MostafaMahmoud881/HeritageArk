'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';
import { useCart } from '@/lib/cart-store';
import { CRAFTS } from '@/lib/data';

function localePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

const COPY = {
  en: {
    badge: 'Community-Owned',
    title: 'Indigenous Artisan Marketplace',
    subtitle: 'Every product is handcrafted by indigenous artisans — preserving traditions, sustaining communities, and sharing authentic cultural heritage with the world.',
    cart: 'My Cart',
    searchPlaceholder: '🔍  Search artisans, communities, crafts...',
    categories: ['All', 'Pottery', 'Textiles', 'Jewelry', 'Art', 'Accessories'],
    countries: ['All', 'Egypt', 'Morocco', 'Turkey', 'India', 'Guatemala'],
    sortOptions: [
      { value: 'popular', label: 'Most Popular' },
      { value: 'price_asc', label: 'Price: Low → High' },
      { value: 'price_desc', label: 'Price: High → Low' },
      { value: 'rating', label: 'Top Rated' },
    ],
    trustBadges: [
      { icon: '🤝', title: 'Community Owned', desc: 'Sold directly by indigenous artisans' },
      { icon: '🌍', title: 'Fair Trade', desc: 'Fair wages, transparent supply chains' },
      { icon: '✅', title: 'Authentic', desc: 'Verified traditional craft techniques' },
      { icon: '📦', title: 'Global Shipping', desc: 'Express delivery worldwide' },
    ],
    productsCount: 'authentic products',
    fairTrade: '✓ Fair Trade',
    express: '🚀 Express',
    fixedNoHaggling: 'Fixed · No haggling',
    addToCart: 'Add to Cart',
    added: '✓ Added',
    inCart: 'In Cart',
    noProducts: 'No products match your search.',
    clearFilters: 'Clear filters',
    yourCart: 'Your Cart',
    item: 'item',
    items: 'items',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue shopping',
    subtotal: 'Subtotal',
    shipping: 'Express Shipping',
    free: 'FREE',
    deliveryNote: 'Delivered to your hotel or address within 24–48 hours',
    checkout: 'Proceed to Checkout',
    shippingTo: 'Subtotal',
    back: '/marketplace',
    artisanLabel: 'Artisan',
    communityLabel: 'Community',
  },
  ar: {
    badge: 'ملكية مجتمعية',
    title: 'سوق الحرفيين الأصليين',
    subtitle: 'كل منتج مصنوع يدوياً بواسطة حرفيين أصليين — للحفاظ على التقاليد، ودعم المجتمعات، ومشاركة التراث الثقافي الأصيل مع العالم.',
    cart: 'سلّتي',
    searchPlaceholder: '🔍  ابحث عن الحرفيين، المجتمعات، الحرف...',
    categories: ['الكل', 'خزف', 'منسوجات', 'مجوهرات', 'فن', 'إكسسوارات'],
    countries: ['الكل', 'مصر', 'المغرب', 'تركيا', 'الهند', 'غواتيمالا'],
    sortOptions: [
      { value: 'popular', label: 'الأكثر شعبية' },
      { value: 'price_asc', label: 'السعر: من الأقل إلى الأعلى' },
      { value: 'price_desc', label: 'السعر: من الأعلى إلى الأقل' },
      { value: 'rating', label: 'الأعلى تقييماً' },
    ],
    trustBadges: [
      { icon: '🤝', title: 'ملكية مجتمعية', desc: 'تباع مباشرة بواسطة حرفيين أصليين' },
      { icon: '🌍', title: 'تجارة عادلة', desc: 'أجور عادلة، سلاسل توريد شفافة' },
      { icon: '✅', title: 'أصلي', desc: 'تقنيات حرفية تقليدية موثقة' },
      { icon: '📦', title: 'شحن عالمي', desc: 'توصيل سريع حول العالم' },
    ],
    productsCount: 'منتجاً أصيلاً',
    fairTrade: '✓ تجارة عادلة',
    express: '🚀 سريع',
    fixedNoHaggling: 'سعر ثابت · بدون مساومة',
    addToCart: 'أضف إلى السلة',
    added: '✓ تمت الإضافة',
    inCart: 'في السلة',
    noProducts: 'لا توجد منتجات تطابق البحث.',
    clearFilters: 'مسح الفلاتر',
    yourCart: 'سلة التسوق',
    item: 'منتج',
    items: 'منتجات',
    emptyCart: 'سلتك فارغة',
    continueShopping: 'تابع التسوق',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن السريع',
    free: 'مجاني',
    deliveryNote: 'يصل إلى الفندق أو العنوان خلال 24–48 ساعة',
    checkout: 'الانتقال إلى الدفع',
    shippingTo: 'المجموع الفرعي',
    back: '/marketplace',
    artisanLabel: 'حرفي',
    communityLabel: 'مجتمع',
  },
} as const;

const TRANSLATED_CRAFTS: Record<string, Partial<typeof CRAFTS[number]>> = {
  c1: { name: 'لوحة بردي منقوشة يدوياً', origin: 'الأقصر، مصر', cat: 'فن', desc: 'لوحة بردي أصلية مرسومة يدوياً من ورق البردي مع مشاهد من الأساطير القديمة.', artisan: 'الاستاذ عمرو رمسيس' },
  c2: { name: 'سجادة أمازيغية', origin: 'جبال الأطلس، المغرب', cat: 'منسوجات', desc: 'سجادة أمازيغية أصلية منسوجة يدوياً على يد نساء جبال الأطلس.', artisan: 'فاطمة آيت بنحدو' },
  c3: { name: 'طقم مجوهرات نوبية فضية', origin: 'النوبة', cat: 'مجوهرات', desc: 'عقد وأقراط من الفضة الإسترلينية المصنوعة يدوياً بزخارف نوبية تقليدية.', artisan: 'عائشة محمد النوبية' },
  c4: { name: 'شال كشميري من الباشمينا', origin: 'كشمير، الهند', cat: 'منسوجات', desc: 'صوف باشمينا نقي مطرز يدوياً بتفاصيل زهرية كشميرية.', artisan: 'محمد أشرف بهات' },
  c5: { name: 'طقم سيراميك عثماني من إزنيك', origin: 'إزنيك، تركيا', cat: 'خزف', desc: 'قطع سيراميك على طراز إزنيك مزخرفة يدوياً بنقوش عثمانية.', artisan: 'محمد تشيني أستا' },
  c6: { name: 'نسيج مايا على نول الظهر', origin: 'تشيتشيكاستينانغو، غواتيمالا', cat: 'منسوجات', desc: 'منسوجات يدوية من نساء المايا على أنوال الظهر التقليدية.', artisan: 'إيشيل أجو' },
  c7: { name: 'لوحة بردي مصرية', origin: 'الأقصر، مصر', cat: 'فن', desc: 'مرسومة يدوياً على بردي أصلي مع مشاهد من الأساطير القديمة.', artisan: 'عمرو رمسيس' },
  c8: { name: 'حقيبة جلد مغربية يدوية', origin: 'فاس، المغرب', cat: 'إكسسوارات', desc: 'جلد ماعز مخيط يدوياً ومصبوغ بالحناء الطبيعية.', artisan: 'يوسف التانيري' },
};

function CartItemRow({ item }: { item: import('@/lib/cart-store').CartItem }) {
  const { increment, decrement, remove } = useCart();
  return (
    <div className="flex items-center gap-3 bg-[#F8F5F0] rounded-xl p-3">
      <span className="text-3xl">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0B132B] truncate">{item.name}</p>
        <p className="text-xs text-[#6B7280]">{item.flag} {item.origin.split(',')[0]}</p>
        <p className="text-[10px] text-[#D4A373]">by {item.artisan}</p>
        <p className="text-sm font-bold text-[#0B132B] mt-0.5">${(item.price * item.qty).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => decrement(item.id)} className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] text-[#0B132B] font-bold hover:border-[#D4A373] transition-colors flex items-center justify-center">−</button>
        <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
        <button onClick={() => increment(item.id)} className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D9] text-[#0B132B] font-bold hover:border-[#D4A373] transition-colors flex items-center justify-center">+</button>
        <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors flex items-center justify-center ml-1 text-xs">✕</button>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { locale } = useTranslate();
  const copy = locale === 'ar' ? COPY.ar : COPY.en;
  const { items, add, count, total } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(copy.categories[0]);
  const [country, setCountry] = useState<string>(copy.countries[0]);
  const [sort, setSort] = useState('popular');
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const displayCrafts = useMemo(() => {
    if (locale !== 'ar') return CRAFTS;
    return CRAFTS.map((item) => ({ ...item, ...TRANSLATED_CRAFTS[item.id] }));
  }, [locale]);

  const categories = copy.categories;
  const countries = copy.countries;

  const filtered = useMemo(() => {
    let list = [...displayCrafts];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.origin.toLowerCase().includes(search.toLowerCase()));
    if (category !== categories[0]) list = list.filter(c => c.cat === category);
    if (country !== countries[0]) list = list.filter(c => c.origin.includes(country));
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [search, category, country, sort, displayCrafts, categories, countries]);

  const handleAdd = (item: typeof CRAFTS[0]) => {
    add({ id: item.id, name: item.name, price: item.price, emoji: item.emoji, origin: item.origin, artisan: item.artisan, flag: item.flag });
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const cartCount = count();
  const cartTotal = total();

  return (
    <div className="min-h-screen bg-[#F8F5F0]">

      {/* Hero */}
      <div className="bg-[#0B132B] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/30 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse" />
                <span className="text-[#D4A373] text-xs tracking-widest uppercase font-medium">{copy.badge}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-white">{copy.title}</h1>
              <p className="text-white/50 mt-3 max-w-xl text-sm leading-relaxed">
                {copy.subtitle}
              </p>
              <Link href={localePath(locale, '/indigenous')} className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
                🌍 Connect with Indigenous Communities
              </Link>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#D4A373] text-[#0B132B] font-semibold hover:bg-[#E8C49A] transition-all"
            >
              <span className="text-xl">🛒</span>
              <span>{copy.cart}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#0B132B] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {copy.trustBadges.map((b) => (
              <div key={b.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{b.title}</p>
                  <p className="text-white/40 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E8E2D9] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="flex-1 min-w-[180px] bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2 text-sm text-[#0B132B] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#D4A373] transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat ? 'bg-[#0B132B] text-white' : 'bg-[#F8F5F0] text-[#6B7280] hover:bg-[#E8E2D9]'}`}>
                {cat}
              </button>
            ))}
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#D4A373]">
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-[#0B132B] focus:outline-none focus:border-[#D4A373]">
            {copy.sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-[#6B7280] mb-6">{filtered.length} {copy.productsCount}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const isAdded = added === item.id;
            const inCart = items.find(i => i.id === item.id);
            return (
              <div key={item.id} className="group bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden hover:shadow-lg hover:border-[#D4A373]/40 transition-all duration-300 flex flex-col">
                <div className="aspect-square flex items-center justify-center text-7xl relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${item.col}30, ${item.col}08)` }}>
                  <span className="group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                  {item.fairtrade && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{copy.fairTrade}</span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 rounded-full text-[#0B132B] shadow-sm">
                    {item.flag} {item.origin.split(',')[0]}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-semibold text-[#D4A373] uppercase tracking-wider">{item.cat}</span>
                  <h3 className="font-serif text-[#0B132B] mt-1 group-hover:text-[#D4A373] transition-colors leading-snug">{item.name}</h3>
                  <p className="text-xs text-[#6B7280] mt-1">{copy.artisanLabel}: {item.artisan}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{copy.communityLabel}: {item.origin}</p>
                  <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 flex-1">{item.desc}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-medium text-[#0B132B]">{item.rating}</span>
                    <span className="text-xs text-[#6B7280]">({item.reviews})</span>
                    <span className="ml-auto text-xs text-green-600 font-medium">{copy.express}</span>
                  </div>
                  <div className="flex items-end justify-between mt-4 pt-3 border-t border-[#F8F5F0]">
                    <div>
                      <span className="text-2xl font-bold text-[#0B132B]">${item.price}</span>
                      <p className="text-[10px] text-[#6B7280]">{copy.fixedNoHaggling}</p>
                    </div>
                    <button
                      onClick={() => handleAdd(item)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isAdded ? 'bg-green-500 text-white scale-95'
                        : inCart ? 'bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/40'
                        : 'bg-[#0B132B] text-white hover:bg-[#D4A373]'
                      }`}
                    >
                      {isAdded ? copy.added : inCart ? `${copy.inCart} (${inCart.qty})` : copy.addToCart}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <span className="text-6xl">🔍</span>
            <p className="text-[#6B7280] text-lg mt-4">{copy.noProducts}</p>
            <button onClick={() => { setSearch(''); setCategory(categories[0]); setCountry(countries[0]); }}
              className="mt-3 text-[#D4A373] text-sm hover:underline">{copy.clearFilters}</button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E8E2D9]">
              <div>
                <h2 className="text-xl font-serif text-[#0B132B]">{copy.yourCart}</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{cartCount} {cartCount === 1 ? copy.item : copy.items}</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-[#F8F5F0] flex items-center justify-center text-[#6B7280] hover:text-[#0B132B] transition-colors text-lg">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-5xl">🛒</span>
                  <p className="text-[#6B7280] mt-4 text-sm">{copy.emptyCart}</p>
                  <button onClick={() => setCartOpen(false)} className="mt-3 text-[#D4A373] text-sm hover:underline">{copy.continueShopping}</button>
                </div>
              ) : (
                items.map((item) => <CartItemRow key={item.id} item={item} />)
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#E8E2D9] space-y-3 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">{copy.subtotal} ({cartCount} {cartCount === 1 ? copy.item : copy.items})</span>
                  <span className="font-bold text-[#0B132B] text-lg">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">{copy.shipping}</span>
                  <span className="text-green-600 font-semibold">{copy.free}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
                  <span>🚀</span>
                  <span>{copy.deliveryNote}</span>
                </div>
                <Link href={localePath(locale, '/marketplace/checkout')} onClick={() => setCartOpen(false)}
                  className="block w-full text-center py-4 rounded-2xl bg-[#0B132B] text-white font-semibold hover:bg-[#D4A373] transition-all duration-300 text-sm">
                  {copy.checkout} — ${cartTotal.toFixed(2)} →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

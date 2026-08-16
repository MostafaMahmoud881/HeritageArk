'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

type Step = 'shipping' | 'payment' | 'confirm';

const DELIVERY_OPTIONS = [
  { id: 'hotel', label: 'Hotel Delivery', desc: 'Delivered to your hotel reception', icon: '🏨', time: '24 hours', price: 0 },
  { id: 'address', label: 'Home / Address', desc: 'Delivered to any address worldwide', icon: '🏠', time: '3–5 days', price: 0 },
  { id: 'express', label: 'Express International', desc: 'Priority courier worldwide', icon: '✈️', time: '48 hours', price: 15 },
];

const CARD_ICONS: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
};

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirm', label: 'Confirm' },
  ];
  const idx = steps.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx ? 'bg-green-500 text-white' : i === idx ? 'bg-[#0B132B] text-white' : 'bg-[#E8E2D9] text-[#6B7280]'
            }`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === idx ? 'text-[#0B132B]' : 'text-[#6B7280]'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${i < idx ? 'bg-green-500' : 'bg-[#E8E2D9]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState<Step>('shipping');
  const [delivery, setDelivery] = useState('hotel');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    hotelName: '', roomNumber: '', address: '', city: '', country: '', zip: '',
  });

  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: '',
  });

  const cartTotal = total();
  const cartCount = count();
  const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === delivery)!;
  const deliveryFee = selectedDelivery?.price ?? 0;
  const grandTotal = cartTotal + deliveryFee;

  const formatCard = (val: string) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  const [needLogin, setNeedLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { login, register } = useAuth();

  const handlePlaceOrder = async () => {
    // Require login before placing order
    if (!user) {
      setNeedLogin(true);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setOrderPlaced(true);
    clear();
  };

  const handleLoginSubmit = async () => {
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill in all required fields.');
      return;
    }
    setLoginLoading(true);
    try {
      if (loginMode === 'login') {
        await login(loginForm.email, loginForm.password);
      } else {
        if (!loginForm.name) {
          setLoginError('Please enter your name.');
          setLoginLoading(false);
          return;
        }
        await register(loginForm.name, loginForm.email, loginForm.password);
      }
      setNeedLogin(false);
    } catch {
      setLoginError('Invalid credentials. Please try again.');
    }
    setLoginLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
            🎉
          </div>
          <h1 className="text-3xl font-serif text-[#0B132B] mb-3">Order Confirmed!</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-2">
            Your authentic heritage products are on their way.
          </p>
          <div className="bg-[#F8F5F0] rounded-2xl p-4 my-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Order ID</span>
              <span className="font-mono font-bold text-[#0B132B]">HV-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Delivery</span>
              <span className="font-medium text-[#0B132B]">{selectedDelivery?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Estimated</span>
              <span className="font-medium text-green-600">{selectedDelivery?.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 mb-6">
            <span>📧</span>
            <span>Confirmation sent to {shipping.email}</span>
          </div>
          <Link href="/marketplace"
            className="block w-full py-3 rounded-2xl bg-[#0B132B] text-white font-semibold text-sm hover:bg-[#D4A373] transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl">🛒</span>
          <p className="text-[#6B7280] mt-4 text-lg">Your cart is empty</p>
          <Link href="/marketplace" className="mt-4 inline-block text-[#D4A373] hover:underline text-sm">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace" className="text-[#6B7280] text-sm hover:text-[#D4A373] transition-colors flex items-center gap-1 mb-4">
            ← Back to Marketplace
          </Link>
          <h1 className="text-3xl font-serif text-[#0B132B]">Checkout</h1>
          <p className="text-[#6B7280] text-sm mt-1">Secure, encrypted payment — fixed prices guaranteed</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Steps */}
          <div className="lg:col-span-2">
            <StepIndicator current={step} />

            {/* ── Step 1: Shipping ── */}
            {step === 'shipping' && (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-6">
                <h2 className="text-xl font-serif text-[#0B132B]">📦 Delivery Information</h2>

                {/* Delivery type */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#0B132B]">Delivery Method</p>
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${delivery === opt.id ? 'border-[#0B132B] bg-[#0B132B]/5' : 'border-[#E8E2D9] hover:border-[#D4A373]/50'}`}>
                      <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="sr-only" />
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-[#0B132B] text-sm">{opt.label}</p>
                        <p className="text-xs text-[#6B7280]">{opt.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0B132B]">{opt.price === 0 ? 'FREE' : `+$${opt.price}`}</p>
                        <p className="text-xs text-green-600">{opt.time}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Contact */}
                <div>
                  <p className="text-sm font-medium text-[#0B132B] mb-3">Contact Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'firstName', label: 'First Name', placeholder: 'John', col: 1 },
                      { key: 'lastName', label: 'Last Name', placeholder: 'Smith', col: 1 },
                      { key: 'email', label: 'Email Address', placeholder: 'john@email.com', col: 2 },
                      { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+1 234 567 8900', col: 2 },
                    ].map((f) => (
                      <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                        <label className="text-xs text-[#6B7280] mb-1 block">{f.label}</label>
                        <input
                          type={f.key === 'email' ? 'email' : 'text'}
                          placeholder={f.placeholder}
                          value={shipping[f.key as keyof typeof shipping]}
                          onChange={(e) => setShipping(s => ({ ...s, [f.key]: e.target.value }))}
                          className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address fields */}
                <div>
                  <p className="text-sm font-medium text-[#0B132B] mb-3">
                    {delivery === 'hotel' ? '🏨 Hotel Details' : '🏠 Delivery Address'}
                  </p>
                  {delivery === 'hotel' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-[#6B7280] mb-1 block">Hotel Name</label>
                        <input placeholder="e.g. Marriott Cairo" value={shipping.hotelName}
                          onChange={(e) => setShipping(s => ({ ...s, hotelName: e.target.value }))}
                          className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">Room Number</label>
                        <input placeholder="e.g. 412" value={shipping.roomNumber}
                          onChange={(e) => setShipping(s => ({ ...s, roomNumber: e.target.value }))}
                          className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B7280] mb-1 block">City</label>
                        <input placeholder="e.g. Cairo" value={shipping.city}
                          onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                          className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-[#6B7280] mb-1 block">Street Address</label>
                        <input placeholder="123 Main Street" value={shipping.address}
                          onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
                          className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                      </div>
                      {[
                        { key: 'city', label: 'City', placeholder: 'New York' },
                        { key: 'zip', label: 'ZIP / Postal Code', placeholder: '10001' },
                        { key: 'country', label: 'Country', placeholder: 'United States' },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="text-xs text-[#6B7280] mb-1 block">{f.label}</label>
                          <input placeholder={f.placeholder} value={shipping[f.key as keyof typeof shipping]}
                            onChange={(e) => setShipping(s => ({ ...s, [f.key]: e.target.value }))}
                            className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled={!shipping.firstName || !shipping.email}
                  className="w-full py-4 rounded-2xl bg-[#0B132B] text-white font-semibold text-sm hover:bg-[#D4A373] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-6">
                <h2 className="text-xl font-serif text-[#0B132B]">💳 Payment Details</h2>

                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  <span>🔒</span>
                  <span>Your payment is encrypted and secure. We never store card details.</span>
                </div>

                {/* Card logos */}
                <div className="flex items-center gap-3">
                  {['VISA', 'MC', 'AMEX', 'PayPal'].map((brand) => (
                    <div key={brand} className="px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-xs font-bold text-[#6B7280] bg-[#F8F5F0]">{brand}</div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#6B7280] mb-1 block">Cardholder Name</label>
                    <input
                      placeholder="John Smith"
                      value={payment.cardName}
                      onChange={(e) => setPayment(p => ({ ...p, cardName: e.target.value }))}
                      className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B7280] mb-1 block">Card Number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                      maxLength={19}
                      className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#0B132B] font-mono focus:outline-none focus:border-[#D4A373] transition-colors tracking-widest"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#6B7280] mb-1 block">Expiry Date</label>
                      <input
                        placeholder="MM/YY"
                        value={payment.expiry}
                        onChange={(e) => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        maxLength={5}
                        className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#0B132B] font-mono focus:outline-none focus:border-[#D4A373] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#6B7280] mb-1 block">CVV</label>
                      <input
                        placeholder="•••"
                        type="password"
                        value={payment.cvv}
                        onChange={(e) => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        maxLength={4}
                        className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#0B132B] font-mono focus:outline-none focus:border-[#D4A373] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('shipping')}
                    className="px-6 py-3 rounded-2xl border border-[#E8E2D9] text-[#6B7280] text-sm hover:border-[#0B132B] hover:text-[#0B132B] transition-all">
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.cardName}
                    className="flex-1 py-3 rounded-2xl bg-[#0B132B] text-white font-semibold text-sm hover:bg-[#D4A373] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 'confirm' && (
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-6">
                <h2 className="text-xl font-serif text-[#0B132B]">✅ Review Your Order</h2>

                {/* Shipping summary */}
                <div className="bg-[#F8F5F0] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#0B132B] uppercase tracking-wider mb-3">Delivery</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedDelivery?.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[#0B132B]">{selectedDelivery?.label}</p>
                      <p className="text-xs text-[#6B7280]">
                        {delivery === 'hotel' ? `${shipping.hotelName}, Room ${shipping.roomNumber}, ${shipping.city}` : `${shipping.address}, ${shipping.city}, ${shipping.country}`}
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Estimated: {selectedDelivery?.time}</p>
                    </div>
                  </div>
                </div>

                {/* Payment summary */}
                <div className="bg-[#F8F5F0] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#0B132B] uppercase tracking-wider mb-3">Payment</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-medium text-[#0B132B]">{payment.cardName}</p>
                      <p className="text-xs text-[#6B7280] font-mono">•••• •••• •••• {payment.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-[#0B132B] uppercase tracking-wider mb-3">Items ({cartCount})</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#0B132B] truncate">{item.name}</p>
                          <p className="text-[10px] text-[#D4A373]">by {item.artisan}</p>
                          <p className="text-[10px] text-[#6B7280]">{item.flag} {item.origin.split(',')[0]}</p>
                        </div>
                        <span className="font-bold text-[#0B132B]">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('payment')}
                    className="px-6 py-3 rounded-2xl border border-[#E8E2D9] text-[#6B7280] text-sm hover:border-[#0B132B] hover:text-[#0B132B] transition-all">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-3 rounded-2xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order — $${grandTotal.toFixed(2)} ✓`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 sticky top-24">
              <h3 className="font-serif text-[#0B132B] text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0B132B] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#D4A373]">by {item.artisan}</p>
                      <p className="text-[10px] text-[#6B7280]">{item.flag} {item.origin.split(',')[0]}</p>
                    </div>
                    <span className="text-sm font-bold text-[#0B132B]">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E8E2D9] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="text-[#0B132B]">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'text-[#0B132B]'}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-[#E8E2D9]">
                  <span className="text-[#0B132B]">Total</span>
                  <span className="text-[#D4A373]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="mt-4 space-y-2">
                {[
                  { icon: '🏷️', text: 'Fixed prices — no hidden fees' },
                  { icon: '✅', text: '100% authentic artisan products' },
                  { icon: '🔒', text: 'Secure encrypted payment' },
                  { icon: '↩️', text: '30-day return guarantee' },
                ].map((t) => (
                  <div key={t.text} className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span>{t.icon}</span>
                    <span>{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Login / Register Required Modal ── */}
      {needLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#0B132B] p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#E9C46A] flex items-center justify-center text-2xl mx-auto mb-3">🔐</div>
              <h2 className="text-xl font-serif text-white">{loginMode === 'login' ? 'Sign In to Continue' : 'Create Your Account'}</h2>
              <p className="text-white/50 text-xs mt-1">Please log in or create an account to complete your order.</p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Toggle Login / Register */}
              <div className="flex bg-[#F8F5F0] rounded-xl p-1.5 gap-1">
                {(['login', 'register'] as const).map(mode => (
                  <button key={mode} onClick={() => { setLoginMode(mode); setLoginError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      loginMode === mode ? 'bg-white text-[#0B132B] shadow-sm' : 'text-[#6B7280] hover:text-[#0B132B]'
                    }`}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-3">
                {loginMode === 'register' && (
                  <div>
                    <label className="text-xs text-[#6B7280] mb-1 block">Full Name</label>
                    <input placeholder="Your name" value={loginForm.name}
                      onChange={(e) => setLoginForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Email Address</label>
                  <input type="email" placeholder="you@email.com" value={loginForm.email}
                    onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1 block">Password</label>
                  <input type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLoginSubmit(); }}
                    className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-sm text-[#0B132B] focus:outline-none focus:border-[#D4A373] transition-colors" />
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">{loginError}</div>
                )}

                <button onClick={handleLoginSubmit} disabled={loginLoading}
                  className="w-full py-3 rounded-2xl bg-[#0B132B] text-white font-semibold text-sm hover:bg-[#D4A373] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loginLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {loginMode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    loginMode === 'login' ? 'Sign In →' : 'Create Account & Continue →'
                  )}
                </button>
              </div>

              {/* Cancel */}
              <button onClick={() => setNeedLogin(false)}
                className="w-full py-2 text-center text-sm text-[#6B7280] hover:text-[#0B132B] transition-colors">
                Cancel and go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

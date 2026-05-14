import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import useCartStore from '../store/cartStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#111827',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': { color: '#9ca3af' }
    },
    invalid: { color: '#ef4444' }
  }
};

// ─── Inner form (needs Stripe context) ───────────────────────────────────────
function CheckoutForm({ cart, address, setAddress, grandTotal, deliveryFee, taxes, setIsOrdered }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    if (paymentMethod === 'card' && (!stripe || !elements)) return;

    setIsProcessing(true);
    setCardError('');

    try {
      console.log('Starting order placement...', { paymentMethod, address });
      // Create order + payment intent on backend
      const data = await api.post('/payment/create-intent', {
        deliveryAddress: address,
        deliveryLocation: { type: 'Point', coordinates: [0, 0] },
        paymentMethod
      });
      console.log('Order intent created:', data);

      // ── COD: done ──────────────────────────────────────────────────────
      if (paymentMethod === 'cod') {
        const orderId = data.order?._id;
        if (!orderId) throw new Error('Order ID missing from server response');
        
        setIsOrdered(true);
        toast.success('Order placed! Pay on delivery 💵');
        
        // Clear local store immediately
        useCartStore.setState({ cart: null });
        
        // Use a slight delay to ensure the state update is processed
        setTimeout(() => {
          navigate(`/orders/${orderId}`, { replace: true });
        }, 50);
        return;
      }

      // ── Card: confirm with Stripe ──────────────────────────────────────
      const { clientSecret } = data;
      const cardNumber = elements.getElement(CardNumberElement);

      console.log('Confirming card payment...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardNumber }
      });

      if (error) {
        console.error('Stripe error:', error);
        setCardError(error.message);
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, confirming on backend...');
        // Tell backend to confirm
        const confirmed = await api.post('/payment/confirm', {
          paymentIntentId: paymentIntent.id
        });
        
        const orderId = confirmed.order?._id;
        if (!orderId) throw new Error('Order ID missing after confirmation');

        setIsOrdered(true);
        toast.success('Payment successful! 🎉');

        useCartStore.setState({ cart: null });
        setTimeout(() => {
          navigate(`/orders/${orderId}`, { replace: true });
        }, 50);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Toggle */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
            { id: 'cod', label: 'Cash on Delivery', icon: '💵' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPaymentMethod(m.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                paymentMethod === m.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className={`text-sm font-semibold ${paymentMethod === m.id ? 'text-orange-700' : 'text-gray-700'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Fields */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
            <div className="border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-500 transition-colors bg-white">
              <CardNumberElement options={CARD_STYLE} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
              <div className="border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-500 transition-colors bg-white">
                <CardExpiryElement options={CARD_STYLE} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CVC</label>
              <div className="border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-orange-500 transition-colors bg-white">
                <CardCvcElement options={CARD_STYLE} />
              </div>
            </div>
          </div>
          {cardError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span>⚠️</span> {cardError}
            </p>
          )}
          {/* Test card hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">🧪 Test Card Numbers:</p>
            <p>Success: <span className="font-mono">4242 4242 4242 4242</span></p>
            <p>Decline: <span className="font-mono">4000 0000 0000 0002</span></p>
            <p>Any future date · Any 3-digit CVC</p>
          </div>
        </div>
      )}

      {/* COD info */}
      {paymentMethod === 'cod' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">💵</span>
          <div>
            <p className="font-semibold text-amber-800">Cash on Delivery</p>
            <p className="text-sm text-amber-700 mt-1">
              Keep <span className="font-bold">${grandTotal.toFixed(2)}</span> ready when your order arrives.
            </p>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📍 Delivery Address
        </label>
        <textarea
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none resize-none transition-colors"
          rows={2}
          placeholder="Street, Apartment, Landmark..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        disabled={isProcessing || (paymentMethod === 'card' && !stripe)}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {paymentMethod === 'card' ? '💳' : '💵'}
            {paymentMethod === 'card' ? `Pay $${grandTotal.toFixed(2)}` : `Place Order · $${grandTotal.toFixed(2)}`}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        🔒 Secured by Stripe · Your card info is never stored
      </p>
    </form>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function Checkout() {
  const { cart } = useCartStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  // Use useEffect for redirecting to avoid render-time navigation
  useEffect(() => {
    if (!isOrdered && (!cart || cart.items?.length === 0)) {
      navigate('/cart');
    }
  }, [cart, isOrdered, navigate]);

  if (!cart && !isOrdered) return null;

  const restaurantName = cart?.restaurantName || 'Restaurant';
  const cartItems = cart?.items || [];
  const deliveryFee = 2.99;
  const itemTotal = cart?.totalAmount || 0;
  const taxes = parseFloat((itemTotal * 0.05).toFixed(2));
  const grandTotal = parseFloat((itemTotal + deliveryFee + taxes).toFixed(2));

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          ← Back to Cart
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                cart={cart}
                address={address}
                setAddress={setAddress}
                grandTotal={grandTotal}
                deliveryFee={deliveryFee}
                taxes={taxes}
                setIsOrdered={setIsOrdered}
              />
            </Elements>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <p className="text-sm text-gray-500 mb-4">From {restaurantName}</p>

              <div className="space-y-3 mb-6 max-h-52 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                        {item.quantity}
                      </span>
                      <span className="text-gray-700 truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>${itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxes (5%)</span><span>${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

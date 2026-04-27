import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateItem, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-400 mt-2">Add some delicious items to get started</p>
        <button onClick={() => navigate('/restaurants')} className="btn-primary mt-6">Browse Restaurants</button>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    setIsOrdering(true);
    try {
      const data = await api.post('/orders', {
        deliveryAddress: address,
        deliveryLocation: { type: 'Point', coordinates: [0, 0] }
      });
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
      <p className="text-gray-500 mb-6">From: {cart.restaurantName}</p>

      <div className="card divide-y divide-gray-100 mb-6">
        {cart.items?.map(item => (
          <div key={item.menuItemId} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-orange-600 text-sm">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateItem(item.menuItemId, item.quantity - 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg">−</button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateItem(item.menuItemId, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg">+</button>
            </div>
            <p className="font-semibold text-gray-900 w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Subtotal</span><span>${cart.totalAmount?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-2 mt-2">
          <span>Total</span><span>${cart.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
        <textarea className="input resize-none" rows={2} placeholder="Enter your full delivery address..."
          value={address} onChange={e => setAddress(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => clearCart()} className="btn-secondary flex-1">Clear Cart</button>
        <button onClick={handleOrder} disabled={isOrdering} className="btn-primary flex-1 py-3">
          {isOrdering ? 'Placing Order...' : `Place Order • $${cart.totalAmount?.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

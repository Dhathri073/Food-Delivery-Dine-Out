import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Button from '../components/Button';

export default function Cart() {
  const { cart, updateItem, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 animate-bounce">
          🛒
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 text-lg mb-10 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/restaurants')} variant="primary" size="lg">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!address.trim()) { 
      toast.error('Please enter a delivery address'); 
      return; 
    }
    setIsOrdering(true);
    try {
      const data = await api.post('/orders', {
        deliveryAddress: address,
        deliveryLocation: { type: 'Point', coordinates: [0, 0] }
      });
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  const deliveryFee = 2.99;
  const taxes = cart.totalAmount * 0.05;
  const grandTotal = cart.totalAmount + deliveryFee + taxes;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Review Order</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span className="text-orange-500">📍</span> From {cart.restaurantName}
                </p>
              </div>
              <button 
                onClick={() => clearCart()}
                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <span>🗑️</span> Clear All
              </button>
            </div>

            <div className="space-y-4">
              {cart.items?.map(item => (
                <div key={item.menuItemId} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-6 group hover:border-orange-200 transition-all">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                    {item.category === 'Main' ? '🥘' : item.category === 'Appetizer' ? '🥟' : '🍰'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-orange-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button 
                        onClick={() => updateItem(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-500 hover:shadow-sm transition-all"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateItem(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-500 hover:shadow-sm transition-all"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address Section */}
            <div className="mt-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">📍</div>
                  <h3 className="text-lg font-black text-gray-900">Delivery Address</h3>
                </div>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none resize-none" 
                  rows={3} 
                  placeholder="Street name, Apartment, Landmark..."
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Right Side: Summary */}
          <div className="w-full md:w-[380px]">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-28">
              <h3 className="text-xl font-black text-gray-900 mb-6">Bill Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Item Total</span>
                  <span>${cart.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Taxes & Charges</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">Grand Total</span>
                    <span className="text-2xl font-black text-orange-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-xs text-orange-800 font-medium leading-relaxed">
                    By placing this order, you agree to our Terms and Conditions. Your delivery partner will contact you shortly.
                  </p>
                </div>
                
                <Button 
                  onClick={handleOrder} 
                  loading={isOrdering} 
                  fullWidth 
                  className="py-4 text-lg"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-[60] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
            <p className="text-xl font-black text-gray-900">${grandTotal.toFixed(2)}</p>
          </div>
          <Button 
            onClick={handleOrder} 
            loading={isOrdering} 
            className="flex-1"
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}

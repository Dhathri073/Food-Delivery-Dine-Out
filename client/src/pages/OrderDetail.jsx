import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import PaymentBadge from '../components/PaymentBadge';

const STEPS = [
  { status: 'PLACED', label: 'Order Placed', icon: '📝' },
  { status: 'ACCEPTED', label: 'Accepted', icon: '✅' },
  { status: 'PREPARING', label: 'Preparing', icon: '🍳' },
  { status: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: '🚴' },
  { status: 'DELIVERED', label: 'Delivered', icon: '🎁' }
];

function ReviewModal({ orderId, onClose, onSubmit, isOpen }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get(`/reviews/suggestions/${orderId}`)
        .then(d => setSuggestions(d.suggestions || []))
        .catch(() => {});
    }
  }, [orderId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await api.post('/reviews', { orderId, reviewText: text, rating });
      toast.success(`Review submitted! You earned ${data.review.pointsEarned} points 🏆`);
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="How was your meal? 🏆"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Tap to Rate</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button 
                key={n} 
                type="button" 
                onClick={() => setRating(n)}
                className={`text-4xl transition-all hover:scale-110 active:scale-90 ${n <= rating ? 'grayscale-0' : 'grayscale opacity-30'}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">AI Suggestions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((s, i) => (
              <button 
                key={i} 
                onClick={() => setText(t => t ? `${t} ${s}` : s)}
                className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors border border-orange-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Your Experience</p>
            <textarea 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none resize-none" 
              rows={4} 
              required 
              minLength={10}
              placeholder="Tell us what you loved or what we can improve..." 
              value={text} 
              onChange={e => setText(e.target.value)} 
            />
            <div className="flex justify-between mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min 10 characters</p>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} fullWidth>Maybe Later</Button>
            <Button type="submit" loading={isSubmitting} fullWidth>Submit Review</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`),
    retry: 1
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('TRACK_ORDER', id);
    const handler = (payload) => {
      if (payload.orderId === id) {
        toast.success(`Order status: ${payload.status}`);
        refetch();
      }
    };
    socket.on('ORDER_STATUS_UPDATED', handler);
    socket.on('ORDER_ACCEPTED', handler);
    return () => { 
      socket.off('ORDER_STATUS_UPDATED', handler); 
      socket.off('ORDER_ACCEPTED', handler); 
    };
  }, [id, refetch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-6xl animate-bounce mb-4">🍔</div>
        <p className="text-gray-500 font-bold animate-pulse">Tracking your order...</p>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-3xl font-black text-gray-900 mb-3">Order Not Found</h2>
        <p className="text-gray-500 text-lg mb-10">{error?.message || "We couldn't find the order you're looking for."}</p>
        <Button onClick={() => navigate('/orders')} variant="primary" size="lg">
          View My Orders
        </Button>
      </div>
    );
  }

  const order = data.order;
  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <ReviewModal 
        isOpen={showReview} 
        orderId={id} 
        onClose={() => setShowReview(false)} 
        onSubmit={refetch} 
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Track Order</h1>
            <p className="text-gray-500 mt-1 font-medium">Order ID: <span className="text-orange-600 font-bold">#{order._id?.slice(-8).toUpperCase()}</span></p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-sm font-bold text-gray-700">Live Updates</span>
          </div>
        </div>

        {/* Status Stepper */}
        {order.status !== 'CANCELLED' ? (
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 mb-8 overflow-hidden">
            <div className="relative flex justify-between items-start">
              {/* Progress Line */}
              <div className="absolute top-7 left-0 right-0 h-1 bg-gray-100 -z-0">
                <div 
                  className="h-full bg-orange-500 transition-all duration-1000" 
                  style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((step, i) => {
                const isCompleted = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isPending = i > currentStepIndex;

                return (
                  <div key={step.status} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
                      isCompleted ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-90' :
                      isCurrent ? 'bg-white text-orange-500 border-4 border-orange-500 scale-110 shadow-xl' :
                      'bg-white text-gray-300 border-4 border-gray-50'
                    }`}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <p className={`mt-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-center ${
                      isCurrent ? 'text-orange-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center mb-8">
            <span className="text-4xl mb-4 block">🚫</span>
            <h3 className="text-xl font-black text-red-900">Order Cancelled</h3>
            <p className="text-red-600 mt-2 font-medium">This order was cancelled. Please contact support if you have any questions.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span>📦</span> Items from {order.restaurantName}
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg">
                        {item.category === 'Main' ? '🥘' : item.category === 'Appetizer' ? '🥟' : '🍰'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-6 border-t border-dashed border-gray-100 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">Total Paid</span>
                    <span className="text-2xl font-black text-orange-600">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span>📍</span> Delivery Details
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">🏠</div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                    <p className="text-gray-700 font-bold leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                </div>

                {/* Payment Badge */}
                <PaymentBadge orderId={order._id} />

                {order.courier && (
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">🚴</div>
                    <div>
                      <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Your Delivery Partner</p>
                      <p className="text-orange-900 font-black text-lg">{order.courier.name}</p>
                      <button className="text-orange-600 text-sm font-bold mt-1 flex items-center gap-1">
                        <span>📞</span> Contact Partner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review & Help Section */}
          <div className="space-y-6">
            {order.status === 'DELIVERED' && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-[32px] text-white shadow-xl shadow-orange-200">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-black mb-2">How was the food?</h3>
                <p className="text-orange-100 text-sm font-medium leading-relaxed mb-6">
                  Share your experience and earn loyalty points for your next order!
                </p>
                {order.isReviewed ? (
                  <div className="bg-white/20 backdrop-blur-md py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-black border border-white/20">
                    <span>✅</span> REVIEWED
                  </div>
                ) : (
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => setShowReview(true)}
                    className="!bg-white !text-orange-600 border-none hover:!bg-orange-50"
                  >
                    Rate Now
                  </Button>
                )}
              </div>
            )}

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">If you have any issues with your order, our support team is available 24/7.</p>
              <button className="w-full py-3 px-6 rounded-2xl border-2 border-gray-100 font-black text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <span>💬</span> Chat with Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

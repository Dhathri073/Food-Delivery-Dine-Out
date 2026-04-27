import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';

const STEPS = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function ReviewModal({ orderId, onClose, onSubmit }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    api.get(`/reviews/suggestions/${orderId}`).then(d => setSuggestions(d.suggestions || [])).catch(() => {});
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/reviews', { orderId, reviewText: text, rating });
      toast.success(`Review submitted! You earned ${data.review.pointsEarned} points 🏆`);
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Write a Review 🏆</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">AI Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => setText(t => t ? `${t} ${s}` : s)}
                className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full hover:bg-orange-100">
                {s}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-2xl transition-transform ${n <= rating ? 'scale-110' : 'opacity-30'}`}>⭐</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Review (more words = more points!)</label>
            <textarea className="input resize-none" rows={4} required minLength={10}
              placeholder="Share your experience..." value={text} onChange={e => setText(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Review</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showReview, setShowReview] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`)
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
    return () => { socket.off('ORDER_STATUS_UPDATED', handler); socket.off('ORDER_ACCEPTED', handler); };
  }, [id]);

  const order = data?.order;
  if (!order) return <div className="flex justify-center py-20 text-4xl animate-spin">🍔</div>;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showReview && <ReviewModal orderId={id} onClose={() => setShowReview(false)} onSubmit={refetch} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <span className="text-sm text-gray-400">#{order._id?.slice(-8)}</span>
      </div>

      {/* Progress Tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">Order Progress</h3>
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= stepIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <p className="text-xs text-center mt-1 text-gray-500 hidden sm:block">
                  {step.replace(/_/g, ' ')}
                </p>
                {i < STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${i < stepIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="card p-4 mb-4">
        <h3 className="font-semibold mb-3">Items from {order.restaurantName}</h3>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span><span>${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="card p-4 mb-4">
        <h3 className="font-semibold mb-2">Delivery Info</h3>
        <p className="text-sm text-gray-600">📍 {order.deliveryAddress}</p>
        {order.courier && (
          <p className="text-sm text-gray-600 mt-1">🚴 Courier: {order.courier.name}</p>
        )}
      </div>

      {/* Review Button */}
      {order.status === 'DELIVERED' && !order.isReviewed && (
        <button onClick={() => setShowReview(true)} className="btn-primary w-full py-3">
          ⭐ Write a Review & Earn Points
        </button>
      )}
      {order.isReviewed && (
        <div className="text-center text-green-600 font-medium py-3">✅ Review submitted</div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function MenuItem({ item, restaurantId }) {
  const { addToCart, isLoading } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      await addToCart(restaurantId, item._id);
    } catch {}
  };

  return (
    <div className={`card p-4 flex justify-between items-start gap-4 ${!item.isAvailable ? 'opacity-50' : ''}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          {!item.isAvailable && <span className="badge bg-red-100 text-red-600">Unavailable</span>}
        </div>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        <p className="text-orange-600 font-semibold mt-2">${item.price.toFixed(2)}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={!item.isAvailable || isLoading}
        className="btn-primary text-sm px-3 py-1.5 shrink-0"
      >
        + Add
      </button>
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => api.get(`/restaurants/${id}`)
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/reviews/restaurant/${id}`)
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin text-4xl">🍔</div></div>;

  const restaurant = data?.restaurant;
  if (!restaurant) return <div className="text-center py-20 text-gray-400">Restaurant not found</div>;

  const categories = ['All', ...new Set(restaurant.menuItems.map(i => i.category))];
  const filtered = activeCategory === 'All'
    ? restaurant.menuItems
    : restaurant.menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-500 mt-1">{restaurant.cuisine?.join(' · ')}</p>
            <p className="text-gray-400 text-sm mt-1">📍 {restaurant.address}</p>
            <p className="text-gray-500 text-sm mt-2">{restaurant.description}</p>
          </div>
          <span className={`badge text-sm px-3 py-1 ${restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
          </span>
        </div>
        <div className="flex gap-6 mt-4 text-sm text-gray-600">
          <span>⭐ {restaurant.rating?.toFixed(1)} ({restaurant.ratingCount} reviews)</span>
          <span>🕐 {restaurant.deliveryTime} min</span>
          <span>🚚 ${restaurant.deliveryFee} delivery</span>
          <span>📦 Min ${restaurant.minOrder}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid gap-3 mb-8">
        {filtered.map(item => <MenuItem key={item._id} item={item} restaurantId={id} />)}
      </div>

      {/* Reviews */}
      {reviewsData?.reviews?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-3">
            {reviewsData.reviews.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                      {r.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{r.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">{'⭐'.repeat(r.rating)}</span>
                    <span className="text-xs text-orange-500 font-medium">+{r.pointsEarned}pts</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">{r.reviewText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

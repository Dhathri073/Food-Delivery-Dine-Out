import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import MenuCard from '../components/MenuCard';
import { MenuCardSkeleton } from '../components/Skeleton';

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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="text-6xl animate-bounce">🥘</div>
      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 animate-progress"></div>
      </div>
    </div>
  );

  const restaurant = data?.restaurant;
  if (!restaurant) return (
    <div className="text-center py-32">
      <div className="text-6xl mb-6">🏜️</div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Restaurant Not Found</h2>
      <p className="text-gray-500 font-medium">It might have moved or been removed.</p>
    </div>
  );

  const categories = ['All', ...new Set(restaurant.menuItems.map(i => i.category))];
  const filtered = activeCategory === 'All'
    ? restaurant.menuItems
    : restaurant.menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-64 sm:h-96 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-black/60 z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-30 blur-sm">
          {restaurant.cuisine?.[0] === 'Italian' ? '🍕' : restaurant.cuisine?.[0] === 'Indian' ? '🍛' : '🍔'}
        </div>
        
        <div className="relative z-20 max-w-5xl mx-auto h-full px-4 flex flex-col justify-end pb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {restaurant.cuisine?.map(c => (
              <span key={c} className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-white/20">
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">{restaurant.name}</h1>
          <div className="flex flex-wrap gap-6 text-white/90 font-bold text-sm">
            <span className="flex items-center gap-2">⭐ {restaurant.rating?.toFixed(1)} <span className="opacity-60">({restaurant.ratingCount}+ Ratings)</span></span>
            <span className="flex items-center gap-2">🕐 {restaurant.deliveryTime} MINS</span>
            <span className="flex items-center gap-2">🚚 FREE DELIVERY</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-30 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 mb-8 border border-gray-100">
              {/* Category Filter */}
              <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mb-8 border-b border-gray-50">
                {categories.map(cat => (
                  <button key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${
                      activeCategory === cat 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu List */}
              <div className="space-y-6 mb-12">
                {filtered.length > 0 ? (
                  filtered.map(item => <MenuCard key={item._id} item={item} restaurantId={id} />)
                ) : (
                  <div className="text-center py-12 text-gray-400 font-medium">No items found in this category.</div>
                )}
              </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Customer Reviews</h2>
                <div className="text-orange-500 font-black">⭐ {restaurant.rating?.toFixed(1)}</div>
              </div>
              
              <div className="space-y-6">
                {reviewsData?.reviews?.length > 0 ? (
                  reviewsData.reviews.map(r => (
                    <div key={r._id} className="p-6 bg-gray-50 rounded-[24px] border border-gray-100/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 font-black shadow-sm">
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-sm text-gray-900">{r.user?.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Foodie</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-xs text-yellow-500 tracking-tighter">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                          <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md">+{r.pointsEarned} PTS</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed italic">"{r.reviewText}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
                <h3 className="font-black text-xl mb-6">Restaurant Info</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Address</div>
                      <div className="text-sm font-bold text-gray-700">{restaurant.address}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Hours</div>
                      <div className="text-sm font-bold text-gray-700">09:00 AM - 11:00 PM</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Average Cost</div>
                      <div className="text-sm font-bold text-gray-700">$20 for two</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] shadow-2xl shadow-orange-200 p-8 text-white">
                <h3 className="font-black text-xl mb-4">Earn Points! 🏆</h3>
                <p className="text-orange-50 font-medium text-sm leading-relaxed mb-6">
                  Order from this restaurant and write a detailed review to earn loyalty points. Use points for future discounts!
                </p>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

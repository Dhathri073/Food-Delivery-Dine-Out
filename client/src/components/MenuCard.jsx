import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function MenuCard({ item, restaurantId }) {
  const { addToCart, isLoading } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleAdd = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      await addToCart(restaurantId, item._id);
      toast.success(`${item.name} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item');
    }
  };

  const emoji = item.category === 'Main' ? '🥘' : 
                item.category === 'Appetizer' ? '🥟' : 
                item.category === 'Dessert' ? '🍰' : 
                item.category === 'Beverage' ? '🥤' : '🍽️';

  return (
    <div className={`group bg-white p-5 flex justify-between items-center gap-6 rounded-3xl border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-black text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h4>
          {!item.isAvailable && <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-500 px-2 py-0.5 rounded-md">Sold Out</span>}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 font-medium leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-orange-600 font-black text-lg">${item.price.toFixed(2)}</span>
          <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
        </div>
      </div>
      <div className="relative shrink-0">
        <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
          {emoji}
        </div>
        <button
          onClick={handleAdd}
          disabled={!item.isAvailable || isLoading}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-orange-500 font-black px-4 py-2 rounded-xl shadow-lg border border-orange-100 hover:bg-orange-500 hover:text-white transition-all active:scale-90 text-sm whitespace-nowrap min-w-[80px]"
        >
          {isLoading ? '...' : 'ADD +'}
        </button>
      </div>
    </div>
  );
}

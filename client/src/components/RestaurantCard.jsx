import { Link } from 'react-router-dom';
import { formatDistance } from '../lib/geolocation';

export default function RestaurantCard({ r }) {
  const emoji = r.cuisine?.[0] === 'Italian' ? '🍕' : 
                r.cuisine?.[0] === 'Indian' ? '🍛' : 
                r.cuisine?.[0] === 'American' ? '🍔' : 
                r.cuisine?.[0] === 'Chinese' ? '🥡' : '🍽️';

  return (
    <Link to={`/restaurants/${r._id}`} className="group">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:-translate-y-2 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="h-full w-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
            {emoji}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-1">
              ⭐ {r.rating?.toFixed(1)}
            </span>
          </div>
          {!r.isOpen && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-30 flex items-center justify-center">
              <span className="bg-white text-black px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase">Closed</span>
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-xl text-gray-900 group-hover:text-orange-500 transition-colors">{r.name}</h3>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1 mb-4 font-medium">{r.cuisine?.join(' • ')}</p>
          <p className="text-xs text-gray-400 mb-4 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {r.address}
          </p>
          <div className="mt-auto flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span className="flex items-center gap-1.5 py-1 px-2.5 bg-gray-50 rounded-lg text-gray-600">
              <span className="text-sm">🕐</span> {r.deliveryTime} MINS
            </span>
            <span className="flex items-center gap-1.5 py-1 px-2.5 bg-gray-50 rounded-lg text-gray-600">
              <span className="text-sm">🚚</span> {r.deliveryFee === 0 ? 'FREE' : `$${r.deliveryFee}`}
            </span>
            {r.distance && (
              <span className="flex items-center gap-1.5 py-1 px-2.5 bg-orange-50 rounded-lg text-orange-600">
                <span className="text-sm">📍</span> {formatDistance(r.distance)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

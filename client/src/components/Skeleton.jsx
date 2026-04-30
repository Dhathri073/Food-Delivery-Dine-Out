export default function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`}></div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/4 mt-4"></div>
      </div>
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white p-5 flex justify-between items-center gap-6 rounded-3xl border border-gray-100 animate-pulse">
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
      </div>
      <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  succeeded:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  refunded:   'bg-purple-100 text-purple-700'
};

const STATUS_ICONS = {
  pending: '⏳', processing: '🔄', succeeded: '✅', failed: '❌', refunded: '↩️'
};

export default function PaymentBadge({ orderId }) {
  const { data } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => api.get(`/payment/order/${orderId}`),
    enabled: !!orderId
  });

  const payment = data?.payment;
  if (!payment) return null;

  return (
    <div className="card p-4 mt-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        💳 Payment Details
      </h3>
      <div className="flex flex-wrap gap-3 items-center">
        <span className={`badge px-3 py-1 text-sm font-semibold ${STATUS_STYLES[payment.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_ICONS[payment.status]} {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
        <span className="text-sm text-gray-600">
          {payment.method === 'cod' ? '💵 Cash on Delivery' : '💳 Card'}
        </span>
        <span className="text-sm font-bold text-gray-900">${payment.amount?.toFixed(2)}</span>
        {payment.paidAt && (
          <span className="text-xs text-gray-400">
            Paid {new Date(payment.paidAt).toLocaleString()}
          </span>
        )}
        {payment.receiptUrl && (
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-500 hover:underline font-medium"
          >
            View Receipt ↗
          </a>
        )}
        {payment.status === 'refunded' && (
          <span className="text-xs text-purple-600 font-medium">
            Refunded ${payment.refundAmount?.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

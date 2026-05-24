import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, RefreshCw, Truck, CheckCircle2, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/v1';

export const BuyerDashboard = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/buyer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    }
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-b border-slate-200 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Purchase Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Track shipping states and review crop receipt details.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mb-4" />
          <p>Fetching purchase records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">No orders found</p>
          <p className="text-sm">Explore the Marketplace to purchase crop listings from verified farmers.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Order Number</span>
                  <p className="font-mono font-bold text-slate-900 text-lg">{order.orderNumber}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block text-right">Order Date</span>
                    <p className="text-sm font-semibold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                    order.status === 'delivered'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : order.status === 'processing'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : order.status === 'shipped'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items details */}
              <div className="space-y-4 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-slate-800">{item.product?.name || 'Unknown Crop Listing'}</p>
                      <p className="text-xs text-slate-400">SKU: {item.product?.sku || 'N/A'} &bull; Quantity: {item.quantity} units</p>
                    </div>
                    <span className="font-bold text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Address details */}
              <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 text-xs">
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shipping Address</p>
                  <p className="text-slate-800">{order.shippingAddress?.street}</p>
                  <p className="text-slate-800">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-slate-800">{order.shippingAddress?.country}</p>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div className="text-right">
                    <p className="font-bold text-slate-500 uppercase tracking-wider mb-1.5">Summary</p>
                    <p className="text-slate-800">Payment Status: <span className="font-semibold capitalize">{order.paymentStatus}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">Total Purchase Price</p>
                    <p className="text-2xl font-extrabold text-primary-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Simple workflow progress timeline */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-primary-600">
                  <Clock className="w-4 h-4" />
                  <span>Order Placed</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${
                  ['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-primary-600' : ''
                }`}>
                  <RefreshCw className={`w-4 h-4 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                  <span>Processing</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${
                  ['shipped', 'delivered'].includes(order.status) ? 'text-primary-600' : ''
                }`}>
                  <Truck className="w-4 h-4" />
                  <span>Shipped</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${
                  order.status === 'delivered' ? 'text-green-600' : ''
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

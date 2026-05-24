import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal, Check, RefreshCw, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/v1';

export const LandingPage = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [qualityGrade, setQualityGrade] = useState('');
  const [organic, setOrganic] = useState(false);
  const [gmoFree, setGmoFree] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Purchase/Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (category) params.category = category;
      if (qualityGrade) params.qualityGrade = qualityGrade;
      if (organic) params.organicCertified = 'true';
      if (gmoFree) params.gmoFree = 'true';
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await axios.get(`${API_URL}/products`, { params });
      setProducts(res.data.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch product listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, qualityGrade, organic, gmoFree]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setQualityGrade('');
    setOrganic(false);
    setGmoFree(false);
    setMinPrice('');
    setMaxPrice('');
    // Trigger fetch manually via timeout or rely on state effects
    setTimeout(fetchProducts, 50);
  };

  const handleOpenCheckout = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setCheckoutSuccess('');
    setCheckoutError('');
    // Pre-fill address if user profile has it
    if (user && user.profile?.address) {
      setStreet(user.profile.address.street || '');
      setCity(user.profile.address.city || '');
      setPostalCode(user.profile.address.postalCode || '');
      setCountry(user.profile.address.country || '');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutSuccess('');

    if (!token) {
      setCheckoutError('Please log in as a buyer to complete your purchase.');
      return;
    }

    if (user && user.role !== 'buyer') {
      setCheckoutError('Only registered buyers can place purchases.');
      return;
    }

    try {
      const orderPayload = {
        items: [
          {
            product: selectedProduct._id,
            quantity: Number(orderQuantity)
          }
        ],
        shippingAddress: { street, city, postalCode, country }
      };

      const res = await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setCheckoutSuccess(`Order placed successfully! Order Number: ${res.data.data.orderNumber}`);
        // Refresh product details/listings
        fetchProducts();
        setTimeout(() => setSelectedProduct(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(err.response?.data?.error || 'Failed to place order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-green-600 rounded-2xl p-8 md:p-12 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Verified Crops Sourced Direct</h1>
        <p className="text-md md:text-xl text-primary-50 max-w-2xl">
          Purchase certified organic and GMO-free agricultural products directly from verified farmers with scan-ready product traceability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-slate-500" />
              <span>Filters</span>
            </h2>
            <button onClick={handleResetFilters} className="text-xs text-primary-600 hover:text-primary-800 font-semibold">
              Reset All
            </button>
          </div>

          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="Herbs">Herbs</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains</option>
              </select>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={e => setQualityGrade(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            {/* Price Limits */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Price Limit</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={fetchProducts}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 mt-2 py-1.5 rounded-lg text-xs font-medium"
              >
                Apply Price
              </button>
            </div>

            {/* Verification Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organic}
                  onChange={e => setOrganic(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Organic Certified</span>
              </label>

              <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gmoFree}
                  onChange={e => setGmoFree(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>GMO-Free</span>
              </label>
            </div>
          </div>
        </div>

        {/* Listings Display */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search crops by name, category, farmer name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mb-4" />
              <p>Fetching active marketplace listings...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">{error}</div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <p className="text-lg font-medium mb-1">No products match your search</p>
              <p className="text-sm">Try resetting filters or adjusting search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Image */}
                    <div className="h-44 bg-slate-100 relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Crop Image</div>
                      )}
                      
                      {/* Quality Grade Label */}
                      <span className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm text-slate-900 border border-slate-100">
                        Grade {product.qualityGrade}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-5">
                      <p className="text-xs text-primary-600 font-semibold uppercase mb-1">{product.category}</p>
                      <h3 className="font-bold text-slate-900 text-lg mb-1 leading-snug">{product.name}</h3>
                      
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-3">
                        <User className="w-3.5 h-3.5" />
                        <span>{product.farmer?.profile?.companyName || `${product.farmer?.profile?.firstName} ${product.farmer?.profile?.lastName}`}</span>
                      </div>

                      <p className="text-slate-600 text-xs line-clamp-2 mb-4">{product.description}</p>

                      {/* Certification Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {product.organicCertified && (
                          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-150 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Organic
                          </span>
                        )}
                        {product.gmoFree && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-150 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> GMO-Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Price per {product.unitOfMeasure}</p>
                      <p className="text-xl font-extrabold text-slate-900">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/trace/${product._id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold text-center transition-colors"
                      >
                        Trace
                      </Link>
                      <button
                        onClick={() => handleOpenCheckout(product)}
                        disabled={product.stockQuantity === 0}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1 ${
                          product.stockQuantity === 0
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{product.stockQuantity === 0 ? 'Sold Out' : 'Buy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Complete Purchase</h3>

            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg mb-4">
              <div className="w-16 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0].startsWith('http') ? selectedProduct.images[0] : `http://localhost:5000${selectedProduct.images[0]}`}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{selectedProduct.name}</h4>
                <p className="text-xs text-slate-500">Grade {selectedProduct.qualityGrade} &bull; {selectedProduct.unitOfMeasure}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">${selectedProduct.price} / {selectedProduct.unitOfMeasure}</p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stockQuantity}
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(Math.min(selectedProduct.stockQuantity, Math.max(1, Number(e.target.value))))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-primary-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400">Available: {selectedProduct.stockQuantity} {selectedProduct.unitOfMeasure}</span>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shipping Details</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-primary-500"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-900 font-bold mb-4">
                <span>Total Amount:</span>
                <span className="text-xl text-primary-600">${(selectedProduct.price * orderQuantity).toFixed(2)}</span>
              </div>

              {checkoutSuccess && <div className="bg-green-50 text-green-700 p-2.5 rounded-lg text-xs">{checkoutSuccess}</div>}
              {checkoutError && <div className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs">{checkoutError}</div>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

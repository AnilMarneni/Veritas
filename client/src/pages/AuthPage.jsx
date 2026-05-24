import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        const address = { street, city, postalCode, country };
        const payload = {
          email,
          password,
          role,
          firstName,
          lastName,
          phone,
          companyName: role === 'farmer' ? companyName : undefined,
          address,
          acceptTerms: true
        };
        await register(payload);
        navigate(role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Sprout className="w-12 h-12 text-primary-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">
          {isLogin ? 'Sign in to Veritas' : 'Register a new account'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-primary-600 hover:text-primary-500 underline"
          >
            {isLogin ? 'create a new account' : 'sign in to existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 sm:rounded-xl sm:px-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold">{error}</div>}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Registration specific fields */}
            {!isLogin && (
              <>
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">I want to register as a:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={role === 'buyer'}
                        onChange={() => setRole('buyer')}
                        className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>Buyer</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="farmer"
                        checked={role === 'farmer'}
                        onChange={() => setRole('farmer')}
                        className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>Farmer</span>
                    </label>
                  </div>
                </div>

                {/* Profile First/Last Names */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </div>

                {/* Farmer only fields */}
                {role === 'farmer' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Farm / Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                )}

                {/* Address Fields */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location Address</label>
                  <input
                    type="text"
                    placeholder="Street address"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
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
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 px-4 rounded-xl font-bold shadow-sm transition-colors text-sm"
              >
                {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

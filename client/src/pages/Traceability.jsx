import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Sprout, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileText, 
  Activity, 
  Clock, 
  Check, 
  AlertCircle,
  QrCode,
  Globe
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/v1';

// Mapping of stages to labels, descriptions, and colors
const stageMapping = {
  seed: {
    label: 'Seed Sourcing',
    color: 'bg-emerald-500 text-white border-emerald-200',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800'
  },
  planting: {
    label: 'Planting & Sowing',
    color: 'bg-green-500 text-white border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800'
  },
  growing: {
    label: 'Growing & Cultivation',
    color: 'bg-teal-500 text-white border-teal-200',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800'
  },
  harvest: {
    label: 'Harvesting',
    color: 'bg-lime-500 text-white border-lime-200',
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-800'
  },
  processing: {
    label: 'Processing',
    color: 'bg-amber-500 text-white border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800'
  },
  packaging: {
    label: 'Packaging',
    color: 'bg-orange-500 text-white border-orange-200',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800'
  },
  shipping: {
    label: 'Shipping & Logistics',
    color: 'bg-blue-500 text-white border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800'
  },
  retail: {
    label: 'Retail & Handover',
    color: 'bg-indigo-500 text-white border-indigo-200',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-800'
  }
};

export const Traceability = () => {
  const { productId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationLogMsg, setLocationLogMsg] = useState('Acquiring scan verification...');

  useEffect(() => {
    const fetchTraceabilityData = async (coordsString = '') => {
      try {
        const url = coordsString 
          ? `${API_URL}/traceability/verify/${productId}?location=${encodeURIComponent(coordsString)}`
          : `${API_URL}/traceability/verify/${productId}`;

        const res = await axios.get(url);
        setData(res.data.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to retrieve crop traceability records.');
      } finally {
        setLoading(false);
      }
    };

    // Ask consumer for location context for audit transparency
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const coordText = `${lat}, ${lng} (Browser Geo)`;
          setLocationLogMsg('Scan location successfully registered for supply chain audit.');
          fetchTraceabilityData(coordText);
        },
        (geoError) => {
          console.warn('Geolocation access denied/failed, scanning without position coordinates.', geoError);
          setLocationLogMsg('Scan verified successfully (location credentials omitted).');
          fetchTraceabilityData();
        },
        { timeout: 8000 }
      );
    } else {
      setLocationLogMsg('Scan verified successfully (geolocation unsupported by browser).');
      fetchTraceabilityData();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Resolving Veritas Supply Chain Ledger...</p>
        <p className="text-xs text-slate-400 mt-2">{locationLogMsg}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Traceability Verification Error</h3>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <Link to="/" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const { product, certifications, history } = data;
  const farmerName = product.farmer?.profile?.companyName || `${product.farmer?.profile?.firstName} ${product.farmer?.profile?.lastName}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Verification Stamp Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-500 text-white rounded-full p-2.5 mt-0.5 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-950">Crop Authenticity Verified</h2>
            <p className="text-xs text-emerald-700 leading-relaxed max-w-xl">
              This agricultural product is registered in the Veritas verification ledger. 
              Its origin coordinates, farming parameters, and approved credentials have been authenticated.
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-800 bg-emerald-100/80 px-3.5 py-2 rounded-xl font-mono text-center md:text-right border border-emerald-200">
          <span className="font-bold block uppercase tracking-wider text-[9px] text-emerald-900 mb-0.5">Audit Event Logged</span>
          {new Date().toLocaleTimeString()} &bull; {locationLogMsg.includes('credentials omitted') ? 'IP Encoded' : 'Coords Registered'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product & Farmer Specs */}
        <div className="space-y-6">
          {/* Crop Profile card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {product.images && product.images.length > 0 && (
              <div className="h-44 bg-slate-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2 mb-1">{product.name}</h1>
            <p className="text-xs text-slate-400 font-mono">SKU: {product.sku}</p>

            <div className="border-t border-slate-100 my-4 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Quality Grade</span>
                <span className="font-bold text-slate-900">Grade {product.qualityGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Harvest Date</span>
                <span className="font-bold text-slate-900">
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yield Price</span>
                <span className="font-bold text-slate-900">${product.price.toFixed(2)} / {product.unitOfMeasure}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
              {product.description}
            </p>
          </div>

          {/* Source Farmer Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>Origin Farmer</span>
            </h3>
            
            <p className="font-bold text-slate-800 text-xs">{farmerName}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{product.farmer?.email}</p>

            {product.farmer?.profile?.address && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-600">{product.farmer.profile.address.street}</p>
                  <p>{product.farmer.profile.address.city}, {product.farmer.profile.address.state} {product.farmer.profile.address.postalCode}</p>
                  <p>{product.farmer.profile.address.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Certifications Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              <span>Approved Credentials</span>
            </h3>

            {certifications.length === 0 ? (
              <p className="text-slate-400 text-xs">No active credentials uploaded for this batch yet.</p>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert._id} className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-primary-700">{cert.certificationType}</span>
                      <span className="bg-green-100 text-green-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-slate-600 text-[10px] font-mono">No: {cert.certificateNumber}</p>
                    <p className="text-slate-400 text-[10px] mt-1">Authority: {cert.issuingAuthority}</p>
                    <p className="text-slate-400 text-[10px]">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                    
                    {cert.certificateUrl && (
                      <a 
                        href={cert.certificateUrl.startsWith('http') ? cert.certificateUrl : `http://localhost:5000${cert.certificateUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline font-semibold mt-2 block flex items-center gap-0.5 text-[10px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Verified Document</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Traceability Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-500" />
            <span>Product Lifecycle Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 mb-8">
            Veritas verified timeline of production events, registered directly by the primary farmer.
          </p>

          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No timeline logged yet</p>
              <p className="text-xs mt-1">The farmer has not registered any tracking states for this product.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-slate-200 ml-4 space-y-8">
              {history.map((record, index) => {
                const stageDetails = stageMapping[record.stage] || {
                  label: record.stage,
                  color: 'bg-slate-500 text-white',
                  bgColor: 'bg-slate-50',
                  textColor: 'text-slate-800'
                };

                return (
                  <div key={record._id} className="relative group">
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center font-bold text-xs ${stageDetails.color}`}>
                      {index + 1}
                    </div>

                    {/* Timeline card */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${stageDetails.bgColor} ${stageDetails.textColor}`}>
                          {stageDetails.label}
                        </span>
                        
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(record.timestamp).toLocaleDateString()} &bull; {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Location details */}
                      <div className="flex items-center text-xs font-bold text-slate-800 mb-3 gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{record.locationDetails}</span>
                      </div>

                      {/* Temperature & Humidity */}
                      {(record.temperature !== undefined || record.humidity !== undefined) && (
                        <div className="flex flex-wrap gap-4 text-slate-600 text-xs mb-3 bg-white px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                          {record.temperature !== undefined && (
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                              <span>{record.temperature}&deg;C</span>
                            </span>
                          )}
                          {record.humidity !== undefined && (
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-blue-400" />
                              <span>{record.humidity}% Humidity</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes logs */}
                      {record.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg">
                          {record.notes}
                        </p>
                      )}

                      {/* Logger details */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Logged by: {record.recordedBy?.profile?.firstName} {record.recordedBy?.profile?.lastName}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                          <Check className="w-3 h-3" />
                          <span>Authentic Entry</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

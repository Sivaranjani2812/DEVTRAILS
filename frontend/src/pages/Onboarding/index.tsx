import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DARK_STORES = [
  { id: 'HSR Layout', name: 'HSR Layout', lat: 12.9141, lng: 77.6411 },
  { id: 'Koramangala', name: 'Koramangala', lat: 12.9279, lng: 77.6271 },
  { id: 'BTM Layout', name: 'BTM Layout', lat: 12.9165, lng: 77.6101 },
  { id: 'Whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bangalore',
    language: 'English',
    platforms: [] as string[],
    dark_store_zones: [] as string[],
    days_per_week: 5,
    shift_timing: 'Morning',
    weekly_income: 4000,
    weekly_budget: 100,
    savings_level: 'Medium',
    disruption_frequency: 'Sometimes',
    past_disruption_types: [] as string[],
    upi_id: ''
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key: 'platforms' | 'past_disruption_types', value: string) => {
    setFormData(prev => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };


  const submitForm = async () => {
    setLoading(true);
    try {
      // Use phone stored during OTP verification, fallback to unique mock
      const storedUser = localStorage.getItem("insure_gig_user");
      const storedPhone = storedUser ? JSON.parse(storedUser).phone : null;
      const phone = storedPhone || `+91${Date.now().toString().slice(-10)}`;

      const payload = {
        ...formData,
        phone,
        platforms_count: Math.max(1, formData.platforms.length),
        device_fingerprint: navigator.userAgent
      };

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/workers/register`, payload);
      localStorage.setItem("userId", res.data.worker.id);
      toast.success("Profile created!");
      
      // Navigate to plan recommendation
      navigate('/premium'); 
    } catch (err: any) {
      console.error("Registration error:", err?.response?.data || err);
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string' && detail.includes("UNIQUE")) {
        toast.error("Phone already registered. Try logging in instead.");
      } else {
        toast.error(`Registration failed: ${JSON.stringify(detail) || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-20 text-slate-200">
      <div className="max-w-xl mx-auto mt-10 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-800 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>

        <div className="p-8">
          <p className="text-emerald-500 font-semibold mb-2">Step {step} of 5</p>
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-white">Identity Details</h2>
              <div>
                <label className="block text-sm mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500" placeholder="Ravi Kumar" />
              </div>
              <div>
                <label className="block text-sm mb-2">City</label>
                <select value={formData.city} onChange={(e) => updateForm('city', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Language</label>
                <select value={formData.language} onChange={(e) => updateForm('language', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Kannada">Kannada</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-white">Platforms</h2>
              <p className="text-sm text-slate-400">Which Q-commerce companies do you deliver for?</p>
              <div className="space-y-3">
                {['Zepto', 'Blinkit', 'Swiggy Instamart'].map(p => (
                  <label key={p} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors">
                    <input type="checkbox" checked={formData.platforms.includes(p)} onChange={() => handleCheckbox('platforms', p)} className="w-5 h-5 accent-emerald-500" />
                    <span className="font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-white">Dark Store Zones</h2>
              <p className="text-sm text-slate-400">Select up to 3 dark stores where you operate. This defines your coverage area.</p>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-700">
                <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {DARK_STORES.map(store => (
                    <Marker key={store.id} position={[store.lat, store.lng]}>
                      <Popup>
                        <div className="text-slate-900">
                          <strong className="block mb-2">{store.name}</strong>
                          <button 
                            onClick={() => {
                              if (formData.dark_store_zones.includes(store.id)) {
                                updateForm('dark_store_zones', formData.dark_store_zones.filter(z => z !== store.id));
                              } else {
                                if (formData.dark_store_zones.length < 3) {
                                  updateForm('dark_store_zones', [...formData.dark_store_zones, store.id]);
                                } else {
                                  toast.error("Max 3 zones allowed");
                                }
                              }
                            }}
                            className="bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                          >
                            {formData.dark_store_zones.includes(store.id) ? 'Remove' : 'Select Zone'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div>
                <p className="text-sm font-medium">Selected Zones:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dark_store_zones.map(z => (
                    <span key={z} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                      {z}
                    </span>
                  ))}
                  {formData.dark_store_zones.length === 0 && <span className="text-slate-500 text-sm">None selected</span>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-white">Work & Finance Profile</h2>
              
              <div>
                <label className="block text-sm mb-2">Days worked per week: {formData.days_per_week}</label>
                <input type="range" min="1" max="7" value={formData.days_per_week} onChange={(e) => updateForm('days_per_week', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Shift Timing</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Morning', 'Evening', 'Night'].map(s => (
                    <button key={s} onClick={() => updateForm('shift_timing', s)} className={`py-2 rounded-lg border ${formData.shift_timing === s ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Weekly Income (₹)</label>
                  <input type="number" value={formData.weekly_income} onChange={(e) => updateForm('weekly_income', parseFloat(e.target.value))} className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Budget (₹)</label>
                  <input type="number" value={formData.weekly_budget} onChange={(e) => updateForm('weekly_budget', parseFloat(e.target.value))} className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Disruption Frequency</label>
                <select value={formData.disruption_frequency} onChange={(e) => updateForm('disruption_frequency', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <option value="Rarely">Rarely</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="Often">Often</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Past Disruption Types</label>
                 <div className="grid grid-cols-2 gap-2">
                  {['Rain', 'Flood', 'Heat', 'Pollution', 'App Outage'].map(p => (
                    <label key={p} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={formData.past_disruption_types.includes(p)} onChange={() => handleCheckbox('past_disruption_types', p)} className="accent-emerald-500" />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-white">Payout details</h2>
              <p className="text-sm text-slate-400">Where should we instantly send your claims?</p>
              
              <div>
                <label className="block text-sm mb-2">UPI ID</label>
                <input type="text" value={formData.upi_id} onChange={(e) => updateForm('upi_id', e.target.value)} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500" placeholder="number@upi" />
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mt-6">
                <h3 className="font-semibold text-emerald-400 mb-2">Summary</h3>
                <ul className="text-sm space-y-1 text-slate-300">
                  <li>Name: {formData.name}</li>
                  <li>Platforms: {formData.platforms.join(', ')}</li>
                  <li>Zones: {formData.dark_store_zones.join(', ')}</li>
                  <li>Shift: {formData.shift_timing}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setStep(prev => prev - 1)} 
              disabled={step === 1}
              className="px-6 py-2 rounded-lg font-medium text-slate-400 hover:text-white disabled:opacity-50"
            >
              Back
            </button>
            <button 
              onClick={() => {
                if (step === 5) {
                  submitForm();
                } else {
                  if (step === 1 && !formData.name) return toast.error("Name required");
                  if (step === 2 && formData.platforms.length === 0) return toast.error("Select at least 1 platform");
                  if (step === 3 && formData.dark_store_zones.length === 0) return toast.error("Select at least 1 zone");
                  setStep(prev => prev + 1);
                }
              }} 
              disabled={loading}
              className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >
              {step === 5 ? (loading ? 'Saving...' : 'Finish') : 'Next'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

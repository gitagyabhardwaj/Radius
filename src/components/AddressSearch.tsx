import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface AddressSearchProps {
  onLocationFound: (lat: number, lng: number, address: string) => void;
}

export default function AddressSearch({ onLocationFound }: AddressSearchProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        onLocationFound(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
        setAddress(result.display_name);
      } else {
        setError('Location not found. Try a different address.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to fetch location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <form onSubmit={handleSearch} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search address or brand location..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
        </div>
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="bg-white hover:bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] px-4 py-2 rounded-2xl text-sm font-bold flex items-center justify-center min-w-[100px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Locate'}
        </button>
      </form>
      {error && <span className="text-xs text-red-500 font-bold">{error}</span>}
    </div>
  );
}

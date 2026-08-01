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
            className="input-field w-full pl-10 pr-4"
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="btn-primary flex items-center justify-center min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Locate'}
        </button>
      </form>
      {error && <span className="text-[11px] font-mono text-red-400">{error}</span>}
    </div>
  );
}

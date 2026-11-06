import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Hub, ProvinceMetric } from '../types';

interface UserInsightsMapProps {
  isDark?: boolean;
  isDarkMode?: boolean;
}

export const UserInsightsMap: React.FC<UserInsightsMapProps> = ({ isDark = false, isDarkMode: propDark = false }) => {
  const isDarkMode = isDark || propDark;
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [metrics, setMetrics] = useState<ProvinceMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    async function loadGISData() {
      try {
        setLoading(true);
        const [hubsRes, metricsRes] = await Promise.all([
          supabase.from('hubs').select('*').order('active_learners_count', { ascending: false }),
          supabase.from('province_metrics').select('*').order('learner_count', { ascending: false }),
        ]);

        if (hubsRes.error) throw hubsRes.error;
        if (metricsRes.error) throw metricsRes.error;

        setHubs(hubsRes.data || []);
        setMetrics(metricsRes.data || []);
      } catch (err) {
        console.error('Failed to load GIS data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGISData();
  }, []);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current || loading) return;

    let isMounted = true;

    // Dynamically load Leaflet styles and script if not loaded
    const initMap = async () => {
      // Ensure Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Check if Leaflet is available on window or import
      let L = (window as any).L;
      if (!L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
        L = (window as any).L;
      }

      if (!isMounted || !mapContainerRef.current || !L) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center on South Africa (-30.5595, 22.9375)
      const map = L.map(mapContainerRef.current, {
        center: [-29.0, 24.5],
        zoom: 6,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Tile layer
      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add real markers from hubs table
      const filtered = filterProvince === 'all' ? hubs : hubs.filter(h => h.province === filterProvince);

      filtered.forEach((hub) => {
        if (!hub.latitude || !hub.longitude) return;

        const customIcon = L.divIcon({
          className: 'custom-hub-pin',
          html: `
            <div style="
              background: #E67012;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            ">
              <i class="fas fa-wifi"></i>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([hub.latitude, hub.longitude], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; padding: 4px;">
            <strong style="color: #E67012; font-size: 14px;">${hub.name}</strong><br/>
            <span style="color: #666;">Type: ${hub.type.replace('_', ' ')}</span><br/>
            <span>Town: ${hub.town} (${hub.province})</span><br/>
            <div style="margin-top: 6px; padding: 4px 8px; background: #FFF4EC; border-radius: 6px; color: #E67012; font-weight: bold;">
              ${hub.active_learners_count.toLocaleString()} Active Learners
            </div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedHub(hub);
        });
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, hubs, filterProvince, isDarkMode]);

  const totalLearners = metrics.reduce((acc, m) => acc + (m.learner_count || 0), 0);
  const totalHubs = hubs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">GIS Digital Inclusion & Hub Insights</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time geospatial distribution of connectivity hubs and active learners across South Africa
          </p>
        </div>

        {/* Province Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Filter Province:</label>
          <select
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <option value="all">All Provinces ({totalHubs} Hubs)</option>
            {metrics.map((m) => (
              <option key={m.province_code} value={m.province_code}>
                {m.province_name} ({m.hub_count || 0} Hubs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <span className="text-xs text-gray-500 font-medium">National Learners</span>
          <p className="text-2xl font-bold text-[#E67012] mt-1">{totalLearners.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <span className="text-xs text-gray-500 font-medium">Connected Hubs</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalHubs}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <span className="text-xs text-gray-500 font-medium">Top Province</span>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {metrics[0]?.province_name || 'Gauteng'}
          </p>
        </div>
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <span className="text-xs text-gray-500 font-medium">Selected Hub</span>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-2 truncate">
            {selectedHub ? selectedHub.name : 'Click any map pin'}
          </p>
        </div>
      </div>

      {/* Map and Regional Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative shadow-sm min-h-[460px]">
          {loading && (
            <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-xs flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-[460px]" style={{ zIndex: 1 }} />
        </div>

        {/* Regional Metrics Breakdown */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between`}>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Provincial Metrics Breakdown</h3>
            <p className="text-xs text-gray-500 mb-4">
              Real-time synchronization with Supabase <code className="font-mono text-orange-600">province_metrics</code> table
            </p>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {metrics.map((m) => {
                const percent = totalLearners > 0 ? Math.round((m.learner_count / totalLearners) * 100) : 0;
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{m.province_name}</span>
                      <span className="text-xs font-semibold text-[#E67012]">{m.learner_count.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#E67012] h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2">
                      <span>Beginners: {m.beginner_count.toLocaleString()}</span>
                      <span>Intermediate: {m.intermediate_count.toLocaleString()}</span>
                      <span>Advanced: {m.advanced_count.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

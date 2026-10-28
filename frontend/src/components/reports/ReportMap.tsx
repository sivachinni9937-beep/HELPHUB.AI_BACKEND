import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ReportItem } from '../../types';

interface ReportMapProps {
  reports: ReportItem[];
  selectedReport?: ReportItem | null;
  onSelectReport?: (report: ReportItem) => void;
  interactivePicker?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  height?: string;
}

export const ReportMap: React.FC<ReportMapProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  interactivePicker = false,
  onPickLocation,
  height = '400px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  // Default coordinate center: Bhubaneswar, Odisha [20.2961, 85.8245]
  const defaultCenter: [number, number] = [20.2961, 85.8245];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (interactivePicker) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (pickMarkerRef.current) {
            pickMarkerRef.current.setLatLng([lat, lng]);
          } else {
            pickMarkerRef.current = L.marker([lat, lng], {
              title: 'Selected approximate location',
            }).addTo(map);
          }
          if (onPickLocation) onPickLocation(lat, lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update report markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    reports.forEach((rep) => {
      if (rep.latitude && rep.longitude) {
        const marker = L.marker([rep.latitude, rep.longitude])
          .addTo(map)
          .bindPopup(
            `<div class="p-1">
              <h4 class="font-bold text-sm text-slate-900">${rep.title}</h4>
              <p class="text-xs text-slate-600 mt-1">${rep.approximate_public_location}</p>
              <div class="mt-2 text-xs font-semibold text-teal-600 uppercase">${rep.status.replace('_', ' ')}</div>
            </div>`
          );

        marker.on('click', () => {
          if (onSelectReport) onSelectReport(rep);
        });

        markersRef.current.push(marker);
        bounds.extend([rep.latitude, rep.longitude]);
      }
    });

    if (markersRef.current.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [reports, onSelectReport]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />
      {interactivePicker && (
        <div className="absolute top-3 left-12 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow border border-slate-200">
          Click on map to select approximate issue location
        </div>
      )}
    </div>
  );
};


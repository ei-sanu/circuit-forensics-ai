'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface LocationOccurrence {
  id: string;
  caseId?: string;
  caseName?: string;
  entityId: string;
  entityName: string;
  entityType: 'person' | 'organization' | 'phone' | 'vehicle';
  category: 'transaction' | 'communication' | 'vehicle_sighting' | 'safehouse';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  city: string;
  stateOrCountry?: string;
  timestamp: string;
  amount?: number;
  counterparty?: string;
  details?: Record<string, any>;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface LiveLocationMapProps {
  occurrences: LocationOccurrence[];
  selectedOccurrence?: LocationOccurrence | null;
  onSelectOccurrence?: (occurrence: LocationOccurrence) => void;
  showTrajectory?: boolean;
}

export function LiveLocationMap({
  occurrences,
  selectedOccurrence,
  onSelectOccurrence,
  showTrajectory = true,
}: LiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default icon issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: false,
        });

        // Crisp OpenStreetMap Carto-Voyager / OSM Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Trajectory
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers & polyline
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      if (occurrences.length === 0) return;

      const latLngs: [number, number][] = [];

      occurrences.forEach((occ) => {
        latLngs.push([occ.latitude, occ.longitude]);

        // Category icon & color configuration
        let bgGradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)'; // Transaction Emerald
        let iconSymbol = '💳';
        let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

        if (occ.category === 'communication') {
          bgGradient = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'; // CDR Blue
          iconSymbol = '📞';
          badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        } else if (occ.category === 'vehicle_sighting') {
          bgGradient = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'; // Vehicle Amber
          iconSymbol = '🚗';
          badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        } else if (occ.category === 'safehouse') {
          bgGradient = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'; // Safehouse Red
          iconSymbol = '🏢';
          badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
        }

        const isSelected = selectedOccurrence?.id === occ.id;
        const pulseEffect = occ.riskLevel === 'critical' ? '<span class="absolute inset-0 rounded-full map-pin-pulse bg-red-500/60 pointer-events-none"></span>' : '';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: `
            <div class="relative flex items-center justify-center">
              ${pulseEffect}
              <div class="custom-map-pin w-9 h-9 text-sm text-white ${isSelected ? 'ring-4 ring-white scale-125' : ''}" style="background: ${bgGradient}; border: 2px solid white;">
                ${iconSymbol}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const popupContent = `
          <div class="p-4 space-y-2 text-xs text-sand-100 font-sans" style="min-width: 250px; max-width: 300px;">
            <div class="flex items-center justify-between gap-2 border-b border-sand-300/20 pb-2">
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${badgeColor}">
                ${occ.category.replace('_', ' ')}
              </span>
              <span class="text-[10px] font-mono text-sand-400">${occ.timestamp.split(' ')[0]}</span>
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-white leading-tight">${occ.title}</h4>
              <p class="text-sand-300 text-[11px] mt-0.5 font-medium">${occ.entityName} (${occ.entityId})</p>
            </div>
            <div class="p-2.5 rounded-xl bg-charcoal-900/90 border border-sand-300/10 space-y-1">
              <p class="text-sand-400 text-[10px]"><strong class="text-sand-200">Location:</strong> ${occ.locationName}, ${occ.city}</p>
              ${occ.amount ? `<p class="text-emerald-400 font-bold font-mono text-xs">₹${occ.amount.toLocaleString('en-IN')}</p>` : ''}
              ${occ.counterparty ? `<p class="text-sand-400 text-[10px]"><strong class="text-sand-200">Counterparty:</strong> ${occ.counterparty}</p>` : ''}
            </div>
            <p class="text-[10px] text-sand-400/90 leading-relaxed">${occ.description}</p>
          </div>
        `;

        const marker = L.marker([occ.latitude, occ.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          onSelectOccurrence?.(occ);
        });

        if (isSelected) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      });

      // Draw Trajectory Path connecting chronological sequence
      if (showTrajectory && latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#1c1f25',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        polylineRef.current = polyline;
      }

      // Fit bounds to show all occurrences
      if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    });
  }, [occurrences, selectedOccurrence, showTrajectory, onSelectOccurrence]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-beige-300/80 bg-white">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}

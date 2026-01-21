'use client'

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet with Next.js
const customArtisanIcon = L.divIcon({
  className: 'custom-artisan-icon',
  html: `
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
      <div class="relative w-12 h-12 bg-white border-4 border-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
        <div class="bg-primary rounded-xl p-1.5 text-white flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]!">plumbing</span>
        </div>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const customClientIcon = L.divIcon({
  className: 'custom-client-icon',
  html: `
    <div class="w-12 h-12 bg-gray-900 border-4 border-white rounded-full shadow-2xl flex items-center justify-center text-white">
      <span class="material-symbols-outlined text-[24px]! fill-current">location_on</span>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Component to handle map view updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function InteractiveMap() {
  const [artisanPos, setArtisanPos] = useState<[number, number]>([6.5244, 3.3792]); // Sample Lagos coordinates
  const [clientPos, setClientPos] = useState<[number, number]>([6.5350, 3.3900]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]);

  // Sample route points based on artisan position
  const routePoints: [number, number][] = [
    artisanPos,
    [6.5260, 3.3800],
    [6.5280, 3.3820],
    [6.5300, 3.3850],
    [6.5330, 3.3880],
    clientPos,
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setClientPos([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Simulate artisan movement for demo
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % routePoints.length;
      // Only simulate if not at client yet
      if (index < routePoints.length) {
        setArtisanPos(routePoints[index]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={routePoints}
          color="#1f7a45"
          weight={6}
          opacity={0.6}
          dashArray="10, 10"
        />

        <Marker position={clientPos} icon={customClientIcon} />
        <Marker position={artisanPos} icon={customArtisanIcon} />

        <MapUpdater center={mapCenter} />
      </MapContainer>

      {/* Map Zoom Controls UI Styling */}
      <style jsx global>{`
        .leaflet-container {
          background-color: transparent !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          margin-top: 100px !important;
          margin-left: 24px !important;
        }
        .leaflet-bar a {
          background-color: white !important;
          color: #1f7a45 !important;
          border: 1px solid #f1f5f9 !important;
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-weight: 900 !important;
        }
        .leaflet-bar a:first-child {
          border-radius: 12px 12px 0 0 !important;
        }
        .leaflet-bar a:last-child {
          border-radius: 0 0 12px 12px !important;
        }
      `}</style>
    </div>
  );
}

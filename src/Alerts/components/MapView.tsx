import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

declare global {
  interface Window {
    initMap: () => void;
  }
}

const MapView: React.FC = () => {
  const { lat, lng, imei } = useParams<{ lat: string; lng: string; imei: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load Google Maps API script dynamically
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAaZ1M_ofwVoLohowruNhY0fyihH9NpcI0&callback=initMap&libraries=maps,marker&v=weekly`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        if (!mapRef.current) return;
        if (!lat || !lng) return;
        
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const position = { lat: latitude, lng: longitude };
        
        // Create the map
        const { Map } = google.maps;
        const map = new Map(mapRef.current, {
          zoom: 15,
          center: position,
          mapId: 'MAP_ID',
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
        });
        
        // Add marker
        const marker = new google.maps.Marker({
          position,
          map,
          title: `Device Location (IMEI: ${imei || 'Unknown'})`
        });
        
        // Optional: open info window with more details
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 8px 0;">Device Location</h3>
              <p style="margin: 0 0 5px 0;"><strong>IMEI:</strong> ${imei || 'Unknown'}</p>
              <p style="margin: 0 0 5px 0;"><strong>Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        // Auto-open info window on load
        infoWindow.open(map, marker);
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleMapsScript();
    
    // Cleanup
    return () => {
      window.initMap = () => {}; // Clear the callback
      // Remove any Google Maps scripts
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => script.remove());
    };
  }, [lat, lng, imei]);
  
  const handleBack = () => {
    navigate('/alerts');
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button
          onClick={handleBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Back to alerts"
        >
          <FiArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Device Location</h1>
          <p className="text-gray-600 text-sm">
            {imei ? `IMEI: ${imei}` : 'View device location on map'}
          </p>
        </div>
      </div>
      
      <div className="flex-grow relative">
        {(!lat || !lng) ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Invalid location data provided.</p>
          </div>
        ) : (
          <div ref={mapRef} className="h-full w-full" id="map"></div>
        )}
      </div>
    </div>
  );
};

export default MapView;
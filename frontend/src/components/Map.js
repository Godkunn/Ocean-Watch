import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ reports, socialPosts }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map only once
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add report markers
    reports.forEach(report => {
      if (report.location && report.location.coordinates) {
        const marker = L.marker([report.location.coordinates[1], report.location.coordinates[0]])
          .addTo(mapInstance.current)
          .bindPopup(`
            <strong>${report.hazardType.replace('_', ' ').toUpperCase()}</strong><br>
            ${report.description}<br>
            <small>Reported by: ${report.userId?.username || 'Unknown'}</small>
          `);
        markersRef.current.push(marker);
      }
    });

    // Add social post markers
    socialPosts.forEach(post => {
      const marker = L.marker([post.location.latitude, post.location.longitude], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          className: 'social-marker'
        })
      })
        .addTo(mapInstance.current)
        .bindPopup(`
          <strong>Social Media Post (${post.platform})</strong><br>
          ${post.text}<br>
          <small>Posted by: ${post.user}</small>
        `);
      markersRef.current.push(marker);
    });
  }, [reports, socialPosts]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default Map;
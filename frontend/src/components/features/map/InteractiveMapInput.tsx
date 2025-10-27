// 🗺️ InteractiveMapInput Component - A map with draggable marker that syncs with lat/lng inputs
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox access token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface InteractiveMapInputProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
}

export default function InteractiveMapInput({
  lat,
  lng,
  onLocationChange,
  height = "400px",
  zoom = 15,
}: InteractiveMapInputProps) {
  // References to DOM elements and map objects
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Track if we're updating from props to prevent infinite loops
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (!containerRef.current) return;

    // Create the map
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/1acto/cmdrwopnh009m01pjdycba2xa/draft",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: true,
    });

    mapRef.current = map;
    // Add geolocate control to the map
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {},
      trackUserLocation: true,
    });

    map.addControl(geolocate);
    // Wait for map to load before setting up interactions
    map.on("load", () => {
      // Ensure map resizes to fit container
      map.resize();
      geolocate.trigger();
    });

    // Create draggable marker
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: "#ec4899", // Red color to match the existing pins
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on("dragend", () => {
      if (isUpdatingFromProps) return;

      const lngLat = marker.getLngLat();
      // Round to 6 decimal places for reasonable precision
      const newLat = Math.round(lngLat.lat * 1000000) / 1000000;
      const newLng = Math.round(lngLat.lng * 1000000) / 1000000;

      onLocationChange(newLat, newLng);
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      if (map) {
        map.resize();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Handle map click to move marker
    map.on("click", (e) => {
      if (isUpdatingFromProps) return;

      const { lng: clickLng, lat: clickLat } = e.lngLat;

      // Update marker position
      marker.setLngLat([clickLng, clickLat]);

      // Round to 6 decimal places
      const newLat = Math.round(clickLat * 1000000) / 1000000;
      const newLng = Math.round(clickLng * 1000000) / 1000000;

      onLocationChange(newLat, newLng);
    });

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // Only run once on mount

  // Update marker position when lat/lng props change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    // Prevent infinite loops when updating from marker drag
    setIsUpdatingFromProps(true);

    // Update marker position
    markerRef.current.setLngLat([lng, lat]);

    // Update map center (smooth transition)
    mapRef.current.easeTo({
      center: [lng, lat],
      duration: 1000, // 1 second animation
    });

    // Reset flag after a small delay
    setTimeout(() => {
      setIsUpdatingFromProps(false);
    }, 100);
  }, [lat, lng]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        marginTop: "10px",
      }}
    >
      {/* Map Container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// 🗺️ MapView Component - Displays an interactive map with location clustering
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  center = [100.923, 13.285],
  zoom = 14,
}: MapViewProps) {
  // References to DOM elements - these let us access HTML elements directly
  const containerRef = useRef<HTMLDivElement>(null); // The div that holds the map
  const mapRef = useRef<mapboxgl.Map | null>(null); // The Mapbox map instance
  const zoomDisplayRef = useRef<HTMLDivElement>(null); // The zoom level display element

  useEffect(() => {
    // Only run if the container element exists
    if (!containerRef.current) return;

    // 🗺️ CREATE THE MAP
    // This creates a new interactive map using Mapbox
    const map = new mapboxgl.Map({
      container: containerRef.current, // Where to put the map (our div)
      style: "mapbox://styles/mapbox/streets-v12", // Map style (streets, satellite, etc.)
      center, // Starting position [longitude, latitude]
      zoom, // Starting zoom level
      attributionControl: true, // Show Mapbox attribution
    });
    mapRef.current = map; // Save reference for later use

    // 🎯 WHEN MAP FINISHES LOADING
    map.on("load", () => {
      console.log("✅ Map loaded successfully");
      map.resize(); // Make sure map fits container properly

      // Update zoom level display when map first loads
      if (zoomDisplayRef.current) {
        zoomDisplayRef.current.textContent = `Zoom: ${map
          .getZoom()
          .toFixed(1)}`;
      }

      // 📡 ADD DATA SOURCE
      // This tells the map where to get location data from our backend
      map.addSource("locations", {
        type: "vector", // Vector tiles (efficient for lots of points)
        tiles: ["http://localhost:3001/locations/mvt/{z}/{x}/{y}.pbf"], // Our backend endpoint
        maxzoom: 22, // Maximum zoom level for data
        minzoom: 0, // Minimum zoom level for data
      });
      // 📍 INDIVIDUAL LOCATION PINS
      // These show when you zoom in close enough to see individual locations
      map.addLayer({
        id: "individual-pins",
        type: "circle",
        source: "locations",
        "source-layer": "locations",
        filter: ["!", ["has", "point_count"]], // Only show points that aren't clustered
        minzoom: 12, // Start showing at zoom level 12
        paint: {
          // Pin size changes with zoom level
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            3, // Zoom 12: 3px radius
            13,
            5, // Zoom 13: 5px radius
            15,
            8, // Zoom 15: 8px radius
            18,
            12, // Zoom 18: 12px radius
          ],
          "circle-color": "#FF6B6B", // Red color
          "circle-stroke-width": 2, // White border thickness
          "circle-stroke-color": "#FFFFFF", // White border color
          "circle-opacity": 0.9, // Slightly transparent
        },
      });
      // 🏷️ LOCATION LABELS
      // These show the names of locations when zoomed in enough
      map.addLayer({
        id: "location-labels",
        type: "symbol",
        source: "locations",
        "source-layer": "locations",
        filter: ["!", ["has", "point_count"]], // Only show labels for individual points
        minzoom: 15, // Start showing labels at zoom 15 (to avoid clutter)
        layout: {
          "text-field": ["get", "loc_name"], // Use the location name
          "text-size": 12, // Text size
          "text-anchor": "top", // Position text above the pin
          "text-offset": [0, 1.2], // Small offset from the pin
          "text-max-width": 8, // Wrap long text
        },
        paint: {
          "text-color": "#2C3E50", // Dark blue-gray text
          "text-halo-color": "#FFFFFF", // White outline around text
          "text-halo-width": 1.5, // Thickness of white outline
        },
      });
      // 🔵 CLUSTER CIRCLES
      // These show when zoomed out - groups nearby locations together
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "locations",
        "source-layer": "locations",
        filter: ["has", "point_count"], // Only show clustered points
        minzoom: 0, // Show from most zoomed out
        maxzoom: 12, // Hide when zoomed in past level 12
        paint: {
          "circle-color": "rgba(0, 0, 0, 0.4)", // Semi-transparent black
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20, // Default size: 20px
            100,
            30, // If 100+ points: 30px
            750,
            40, // If 750+ points: 40px
          ],
        },
      });

      // 🔢 CLUSTER NUMBERS
      // These show how many locations are in each cluster
      map.addLayer({
        id: "cluster-numbers",
        type: "symbol",
        source: "locations",
        "source-layer": "locations",
        filter: ["has", "point_count"], // Only show for clustered points
        minzoom: 0,
        maxzoom: 12,
        layout: {
          "text-field": "{point_count_abbreviated}", // Show number (e.g., "5" or "1k")
          "text-size": 12,
        },
        paint: {
          "text-color": "#000000", // Black text
        },
      });
    });

    // 🚨 ERROR HANDLING
    // Log any map errors to help with debugging
    map.on("error", (e) => {
      console.error("🛑 Map error:", e?.error || e);
    });

    // 📏 ZOOM LEVEL TRACKING
    // Update the zoom display whenever user zooms in/out
    map.on("zoom", () => {
      if (zoomDisplayRef.current) {
        zoomDisplayRef.current.textContent = `Zoom: ${map
          .getZoom()
          .toFixed(1)}`;
      }
    });

    // 🧭 ADD NAVIGATION CONTROLS
    // This adds zoom in/out buttons and compass to the map
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // 🧹 CLEANUP FUNCTION
    // This runs when component is removed to prevent memory leaks
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]); // Re-run effect if center or zoom props change

  // 🎨 RENDER THE COMPONENT
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 80px)",
      }}
    >
      {/* 📊 Zoom Level Indicator */}
      <div
        ref={zoomDisplayRef}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000, // Show above map
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "bold",
          pointerEvents: "none", // Don't block map interactions
        }}
      >
        Zoom: {zoom}
      </div>

      {/* 🗺️ Map Container */}
      <div
        ref={containerRef}
        className="map-container"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

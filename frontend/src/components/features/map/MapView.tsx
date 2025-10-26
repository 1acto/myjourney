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
      style: "mapbox://styles/1acto/cmdrwopnh009m01pjdycba2xa/draft",
      center, // Starting position [longitude, latitude]
      zoom, // Starting zoom level
      attributionControl: true, // Show Mapbox attribution
    });
    mapRef.current = map; // Save reference for later use
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.addControl(geolocate);
    // 🎯 WHEN MAP FINISHES LOADING
    map.on("load", () => {
      console.log("✅ Map loaded successfully");
      map.resize(); // Make sure map fits container properly
      geolocate.trigger();
      map.setPaintProperty("user-location-puck", "circle-color", "#FF0000"); // Change to red
      // Update zoom level display when map first loads
      if (zoomDisplayRef.current) {
        zoomDisplayRef.current.textContent = `Zoom: ${map
          .getZoom()
          .toFixed(1)}`;
      }

      // Add branches source after the style has loaded
      map.addSource("branches", {
        type: "geojson",
        data: `${import.meta.env.VITE_API_URL}/branches/geojson`,
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
      });
      map.addLayer({
        id: "branches-layer",
        type: "circle",
        source: "branches",
        paint: {
          "circle-radius": 8,
          "circle-color": "#007cbf",
        },
      });
      //add labels
      map.addLayer({
        id: "branches-labels",
        type: "symbol",
        source: "branches",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-offset": [0, 1.2],
        },
        paint: {
          "text-color": "#202",
          "text-halo-color": "#fff",
          "text-halo-width": 2,
        },
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "branches",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#51bbd6",
          "circle-radius": 20,
          "circle-opacity": 0.4,
        },
      });

      // show number on cluster
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "branches",
        filter: ["has", "point_count"],
        layout: {
          // use the abbreviated count (e.g. 1.2k) provided by Mapbox clustering
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#063147",
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

      {/* �🗺️ Map Container */}
      <div
        ref={containerRef}
        className="map-container"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

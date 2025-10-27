// 🗺️ MapView Component - Displays an interactive map with location clustering
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    // Only run if the container element exists
    if (!containerRef.current) return;

    // 🗺️ CREATE THE MAP
    // This creates a new interactive map using Mapbox
    const map = new mapboxgl.Map({
      container: containerRef.current, // Where to put the map (our div)
      style: "mapbox://styles/1acto/cmdrwopnh009m01pjdycba2xa/draft", // Use standard style with markers
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

      // Add branches source after the style has loaded
      map.addSource("branches", {
        type: "geojson",
        data: `${import.meta.env.VITE_API_URL}/poi/geojson`,
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
      });

      // Load custom marker icon
      const markerSvg = `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C6.13 0 3 3.13 3 7c0 4.17 4.42 9.92 6.24 12.11.4.48 1.12.48 1.52 0C12.58 16.92 17 11.17 17 7c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ec4899"/>
        </svg>
      `;

      const img = new Image(20, 20);
      img.onload = () => {
        if (!map.hasImage("custom-marker")) {
          map.addImage("custom-marker", img);
        }
      };
      img.src = `data:image/svg+xml;base64,${btoa(markerSvg)}`;

      map.addLayer({
        id: "branches-layer",
        type: "symbol",
        source: "branches",
        layout: {
          "icon-image": "custom-marker",
          "icon-size": 1.5,
          "icon-allow-overlap": true,
        },
      });

      // Add click event to navigate to POI page
      map.on("click", "branches-layer", (e) => {
        if (e.features && e.features[0]) {
          const poiId = e.features[0].properties?.id;
          if (poiId) {
            navigate(`/poi?poiId=${poiId}`);
          }
        }
      });

      // Change cursor to pointer when hovering over POI markers
      map.on("mouseenter", "branches-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "branches-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      // Also handle cluster hover
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      //add labels
      map.addLayer({
        id: "branches-labels",
        type: "symbol",
        source: "branches",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 2.5], // Increased from 1.2 to 2.5 for more space
          "text-font": [
            "LineSeedSansTH",
            "DIN Offc Pro Bold",
            "Open Sans Bold",
          ],
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
        height: "100%",
      }}
    >
      {/* �🗺️ Map Container */}
      <div
        ref={containerRef}
        className="map-container"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

import Header from "@/components/layout/Header";
import MapView from "@/components/features/map/MapView";

export default function MapPage() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1 }}>
        <MapView />
      </div>
    </div>
  );
}

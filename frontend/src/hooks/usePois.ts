// Hook ชุดนี้ไว้จัดการจุดสนใจ (POI - Points of Interest)
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
// โครงข้อมูลที่ฝั่ง UI ใช้
// ─────────────────────────────────────────────
export interface Poi {
  id: number;
  code: string | null;
  name: string | null;
  description: string | null;
  category: string | null;
  categoryColor?: "purple" | "blue" | "pink" | "orange" | null;
  address?: string | null;
  zipCode?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
}

export interface UsePoisReturn {
  pois: Poi[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPoiById: (id: number) => Poi | undefined;
  createPoi: (poiData: Partial<Poi>) => Promise<Poi | null>;
  updatePoi: (id: number, poiData: Partial<Poi>) => Promise<Poi | null>;
  deletePoi: (id: number) => Promise<boolean>;
}

// ─────────────────────────────────────────────
// ฟังก์ชันแปลงข้อมูลจาก Backend → Frontend
// ─────────────────────────────────────────────
const transformBackendPoi = (backendData: any): Poi => {
  const poi = backendData.poi || backendData;
  const location = backendData.location || poi.loc_id;

  // สร้างโค้ดประจำ POI เช่น POI-001
  const generatePoiCode = (id: number | undefined): string => {
    if (!id) return "POI-000";

    return `POI-${id.toString().padStart(3, "0")}`;
  };

  // สีสวยๆ แบบสุ่มตาม id
  const colors: Array<"purple" | "blue" | "pink" | "orange"> = [
    "purple",
    "blue",
    "pink",
    "orange",
  ];
  const randomColor = colors[(poi.poi_id || 0) % colors.length];

  // ฟังก์ชันรวมชื่อผู้สร้าง
  const getFullName = (user: any): string | null => {
    if (!user) return null;
    const first = user.usr_firstname || "";
    const last = user.usr_lastname || "";
    const full = `${first} ${last}`.trim();

    return full || null;
  };

  return {
    id: poi.poi_id,
    code: generatePoiCode(poi.poi_id),
    name: poi.poi_name || null,
    description: poi.poi_description || null,
    category: poi.poi_category || null,
    categoryColor: randomColor,
    address: location?.loc_address || null,
    zipCode: location?.loc_postcode || null,
    province: location?.loc_province || null,
    district: location?.loc_district || null,
    subdistrict: location?.loc_subdistrict || null,
    authorName: getFullName(poi.created_by) || null,
    authorAvatar: poi.created_by?.usr_avatar || null,
    createdAt: poi.created_at || null,
    updatedAt: poi.updated_at || null,
  };
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ─────────────────────────────────────────────
// Hook หลัก: usePois()
// ─────────────────────────────────────────────
export function usePois(): UsePoisReturn {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลทั้งหมด
  const fetchPois = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/pois`);
      const data = res.data;

      if (typeof data === "string" && data.includes("returns all pois")) {
        console.warn("Backend POI not implemented");
        setPois([]);
        setError("Backend API not implemented yet");

        return;
      }

      const transformed: Poi[] = Array.isArray(data)
        ? data.map(transformBackendPoi)
        : data
          ? [transformBackendPoi(data)]
          : [];

      setPois(transformed);
    } catch (err) {
      let msg = "Failed to fetch POIs";

      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      console.error(msg);
      setError(msg);
      setPois([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD ฟังก์ชัน
  const getPoiById = useCallback(
    (id: number): Poi | undefined => pois.find((p) => p.id === id),
    [pois],
  );

  const createPoi = useCallback(
    async (poiData: Partial<Poi>): Promise<Poi | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${API_BASE_URL}/pois`, poiData);
        const newPoi = transformBackendPoi(res.data);

        setPois((prev) => [...prev, newPoi]);

        return newPoi;
      } catch (err) {
        let msg = "Failed to create POI";

        if (axios.isAxiosError(err))
          msg = err.response?.data?.message || err.message;
        else if (err instanceof Error) msg = err.message;
        setError(msg);
        console.error(msg);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePoi = useCallback(
    async (id: number, poiData: Partial<Poi>): Promise<Poi | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.patch(`${API_BASE_URL}/pois/${id}`, poiData);
        const updated = transformBackendPoi(res.data);

        setPois((prev) => prev.map((p) => (p.id === id ? updated : p)));

        return updated;
      } catch (err) {
        let msg = "Failed to update POI";

        if (axios.isAxiosError(err))
          msg = err.response?.data?.message || err.message;
        else if (err instanceof Error) msg = err.message;
        setError(msg);
        console.error(msg);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deletePoi = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/pois/${id}`);
      setPois((prev) => prev.filter((p) => p.id !== id));

      return true;
    } catch (err) {
      let msg = "Failed to delete POI";

      if (axios.isAxiosError(err))
        msg = err.response?.data?.message || err.message;
      else if (err instanceof Error) msg = err.message;
      setError(msg);
      console.error(msg);

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPois();
  }, [fetchPois]);

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  return {
    pois,
    loading,
    error,
    refetch,
    getPoiById,
    createPoi,
    updatePoi,
    deletePoi,
  };
}

// ─────────────────────────────────────────────
// Hook สำหรับดึง POI เดี่ยว ๆ
// ─────────────────────────────────────────────
export function usePoi(id: number) {
  const [poi, setPoi] = useState<Poi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoi = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/pois/${id}`);
      const transformed = transformBackendPoi(res.data);

      setPoi(transformed);
    } catch (err) {
      let msg = "Failed to fetch POI";

      if (axios.isAxiosError(err))
        msg = err.response?.data?.message || err.message;
      else if (err instanceof Error) msg = err.message;
      setError(msg);
      console.error(msg);
      setPoi(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPoi();
  }, [fetchPoi]);

  return { poi, loading, error, refetch: fetchPoi };
}

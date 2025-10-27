// Hook ชุดนี้ไว้จัดการสาขา (branches) ทั้งดึง ดู สร้าง แก้ ลบ
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiClient } from "@/lib/utils";

// โครงข้อมูลที่ฝั่ง UI ใช้
export interface Branch {
  id: number;
  code: string | null;
  name: string | null;
  address: string | null;
  zipCode: string | null;
  parcelCount?: number | null;
  ownerName?: string | null;
  salesName?: string | null;
  supervisorName?: string | null;
  salesAvatar?: string | null;
  supervisorAvatar?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
  color?: "purple" | "blue" | "pink" | "orange" | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
}

export interface UseBranchesReturn {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBranchById: (id: number) => Branch | undefined;
  createBranch: (branchData: Partial<Branch>) => Promise<Branch | null>;
  updateBranch: (
    id: number,
    branchData: Partial<Branch>
  ) => Promise<Branch | null>;
  deleteBranch: (id: number) => Promise<boolean>;
}

// -----------------------------------------------------------
// 🎯 ฟังก์ชันช่วยแปลงข้อมูลจากแบ็กเอนด์ให้เป็นฟอร์แมตที่ฝั่งหน้าจอชอบ
// -----------------------------------------------------------
const transformBackendBranch = (backendData: any): Branch => {
  // ใช้ backendData โดยตรงเพราะ JSON ใหม่มีโครงสร้าง flat
  const branch = backendData.branch || backendData; // Location Object ถูกรวมอยู่ใน branch แล้ว
  const location = branch.location;

  const generateBranchCode = (id: number | undefined): string => {
    if (!id) return "MXP-000";

    return `MXP-${id.toString().padStart(3, "0")}`;
  }; // สีก็สุ่ม ๆ ให้ดูมีชีวิตชีวา (ผูกกับ id เพื่อให้คงที่)

  const colors: Array<"purple" | "blue" | "pink" | "orange"> = [
    "purple",
    "blue",
    "pink",
    "orange",
  ]; // ใช้ branch.id แทน branch.br_id
  const randomColor = colors[(branch.id || 0) % colors.length]; // ฟังก์ชันเล็ก ๆ ไว้รวมชื่อกับนามสกุลเป็นชื่อเต็ม

  const getFullName = (user: any): string | null => {
    if (!user) return null; // สมมติว่าชื่อผู้ใช้อยู่ในฟิลด์ firstName, lastName
    // หรือ usr_firstname, usr_lastname (ใช้ usr_ ตามโค้ดเดิม)
    const firstName = user.usr_firstname || "";
    const lastName = user.usr_lastname || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || null;
  }; // 🚨 บรรทัดนี้ถูกลบทิ้ง เพื่อป้องกัน Error
  // console.log(branch.sales_id?.usr_avatar);

  return {
    id: branch.id, // ใช้ id
    code: generateBranchCode(branch.id), // ใช้ id
    name: branch.name || null, // ใช้ name
    // ✅ ใช้ Optional Chaining กับ location Object
    address: location?.address || null,
    zipCode: location?.zipCode || null,
    parcelCount: null, // ยังคงเป็น null
    // ✅ ใช้ชื่อ Relation ใหม่ (sales, supervisor) และป้องกัน null
    ownerName:
      getFullName(branch.supervisor) || getFullName(branch.sales) || null,
    salesName: getFullName(branch.sales) || null,
    supervisorName: getFullName(branch.supervisor) || null, // ✅ ใช้ Optional Chaining กับ Relation Object ใหม่ (sales, supervisor)
    salesAvatar: branch.sales?.usr_avatar || null,
    supervisorAvatar: branch.supervisor?.usr_avatar || null,
    createdAt: branch.createdAt || null,
    updatedAt: branch.updatedAt || null,
    color: randomColor, // ✅ ใช้ Optional Chaining กับ location properties
    province: location?.province || null,
    district: location?.district || null,
    subdistrict: location?.subDistrict || null, // ใช้ subDistrict
  };
};

// -----------------------------------------------------------
// 🎯 Hook useBranches (สำหรับหน้ารายการทั้งหมด)
// -----------------------------------------------------------
export function useBranches(): UseBranchesReturn {
  // เก็บลิสต์สาขาทั้งหมด
  const [branches, setBranches] = useState<Branch[]>([]); // สถานะโหลดไว้คุม UI เวลารีเควสท์ทำงาน
  const [loading, setLoading] = useState<boolean>(false); // ข้อความผิดพลาดถ้ามี จะได้โชว์แจ้งเตือน
  const [error, setError] = useState<string | null>(null); // ดึงสาขาทั้งหมดจากแบ็กเอนด์

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/branches");
      const data = response.data; // ... (โค้ดจัดการ Stub และ Error เดิม) ...

      let transformedData: Branch[] = [];

      if (Array.isArray(data)) {
        transformedData = data.map(transformBackendBranch);
      } else if (data) {
        transformedData = [transformBackendBranch(data)];
      }

      setBranches(transformedData);
    } catch (err) {
      let errorMessage = "Unknown error occurred";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.warn("Failed to fetch branches from backend:", err);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []); // ... (getBranchById, createBranch, updateBranch, deleteBranch, refetch โค้ดเดิม) ...
  // เอาไว้หยิบสาขาทีละอันจากแคชในสเตต

  const getBranchById = useCallback(
    (id: number): Branch | undefined => {
      return branches.find((branch) => branch.id === id);
    },
    [branches]
  ); // สร้างสาขาใหม่ ง่าย ๆ ส่งข้อมูลเข้าไป

  const createBranch = useCallback(
    async (branchData: Partial<Branch>): Promise<Branch | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post("/branches", branchData);
        const newBranch = transformBackendBranch(response.data);

        setBranches((prev) => [...prev, newBranch]);

        return newBranch;
      } catch (err) {
        let errorMessage = "Failed to create branch";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Failed to create branch:", err);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  ); // อัปเดตข้อมูลสาขาเดิม — ส่ง id กับข้อมูลที่อยากแก้มาเลย

  const updateBranch = useCallback(
    async (id: number, branchData: Partial<Branch>): Promise<Branch | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.patch(`/branches/${id}`, branchData);
        const updatedBranch = transformBackendBranch(response.data);

        setBranches((prev) =>
          prev.map((branch) => (branch.id === id ? updatedBranch : branch))
        );

        return updatedBranch;
      } catch (err) {
        let errorMessage = "Failed to update branch";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Failed to update branch:", err);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  ); // ลบสาขาแบบชัดเจน — ถ้าสำเร็จ จะรีเทิร์น true

  const deleteBranch = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/branches/${id}`);

      setBranches((prev) => prev.filter((branch) => branch.id !== id));

      return true;
    } catch (err) {
      let errorMessage = "Failed to delete branch";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Failed to delete branch:", err);

      return false;
    } finally {
      setLoading(false);
    }
  }, []); // กดรีเฟรชข้อมูลอีกทีก็ได้ เผื่อมีการเปลี่ยนแปลง

  const refetch = useCallback(async () => {
    await fetchBranches();
  }, [fetchBranches]); // เปิดหน้ามาครั้งแรกก็โหลดข้อมูลเลย

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refetch,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}

// -----------------------------------------------------------
// 🎯 Hook แยกสำหรับเคสที่อยากดึงสาขาเดี่ยว ๆ เท่านั้น (useBranch)
// -----------------------------------------------------------
export function useBranch(id: number) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranch = useCallback(async () => {
    if (!id) return; // ถ้าไม่ได้ส่ง id มาก็ยังไม่ต้องทำอะไร

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/branches/${id}`); // 🚨 หาก Backend ส่งข้อมูลเป็น GeoJSON (properties) ต้องแก้ตรงนี้:
      // const dataToTransform = response.data.properties || response.data;
      const transformedBranch = transformBackendBranch(response.data);

      setBranch(transformedBranch);
    } catch (err) {
      let errorMessage = "Failed to fetch branch";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Failed to fetch branch:", err);
      setBranch(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBranch(); // พอ id เปลี่ยนก็โหลดใหม่ให้เลย
  }, [fetchBranch]);

  return {
    branch,
    loading,
    error,
    refetch: fetchBranch,
  };
}

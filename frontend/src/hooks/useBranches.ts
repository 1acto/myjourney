// Hook ชุดนี้ไว้จัดการสาขา (branches) ทั้งดึง ดู สร้าง แก้ ลบ
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

// ฟังก์ชันช่วยแปลงข้อมูลจากแบ็กเอนด์ให้เป็นฟอร์แมตที่ฝั่งหน้าจอชอบ
const transformBackendBranch = (backendData: any): Branch => {
  const branch = backendData.branch || backendData;
  const location = backendData.location || branch.loc_id;

  const generateBranchCode = (id: number | undefined): string => {
    if (!id) return "MXP-000";
    return `MXP-${id.toString().padStart(3, "0")}`;
  };

  // สีก็สุ่ม ๆ ให้ดูมีชีวิตชีวา (ผูกกับ id เพื่อให้คงที่)
  const colors: Array<"purple" | "blue" | "pink" | "orange"> = [
    "purple",
    "blue",
    "pink",
    "orange",
  ];
  const randomColor = colors[(branch.br_id || 0) % colors.length];

  // ฟังก์ชันเล็ก ๆ ไว้รวมชื่อกับนามสกุลเป็นชื่อเต็ม
  const getFullName = (user: any): string | null => {
    if (!user) return null;
    const firstName = user.usr_firstname || "";
    const lastName = user.usr_lastname || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || null;
  };

  console.log(branch.sales_id.usr_avatar);
  return {
    id: branch.br_id,
    code: generateBranchCode(branch.br_id),
    name: branch.br_name || null,
    address: location?.loc_address || null,
    zipCode: location?.loc_postcode || null,
    parcelCount: null,
    ownerName:
      getFullName(branch.sales_supervisor_id) ||
      getFullName(branch.sales_id) ||
      null,
    salesName: getFullName(branch.sales_id) || null,
    supervisorName: getFullName(branch.sales_supervisor_id) || null,
    salesAvatar: branch.sales_id?.usr_avatar || null,
    supervisorAvatar: branch.sales_supervisor_id?.usr_avatar || null,
    createdAt: branch.created_at || null,
    updatedAt: null,
    color: randomColor,
    province: location?.loc_province || null,
    district: location?.loc_district || null,
    subdistrict: location?.loc_subdistrict || null,
  };
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useBranches(): UseBranchesReturn {
  // เก็บลิสต์สาขาทั้งหมด
  const [branches, setBranches] = useState<Branch[]>([]);
  // สถานะโหลดไว้คุม UI เวลารีเควสท์ทำงาน
  const [loading, setLoading] = useState<boolean>(false);
  // ข้อความผิดพลาดถ้ามี จะได้โชว์แจ้งเตือน
  const [error, setError] = useState<string | null>(null);

  // ดึงสาขาทั้งหมดจากแบ็กเอนด์
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/branches`);
      const data = response.data;

      // กรณีแบ็กเอนด์ยังเป็นสตับ (ยังไม่ได้ทำจริง) จะได้ไม่พัง
      if (
        typeof data === "string" &&
        data.includes("This action returns all branches")
      ) {
        console.warn("Backend findAll not implemented"); // แจ้งเตือนเฉย ๆ
        setBranches([]);
        setError("Backend API not implemented yet");
        return;
      }

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
      console.warn("Failed to fetch branches from backend:", err); // ลองเช็คคอนโซลดู
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // เอาไว้หยิบสาขาทีละอันจากแคชในสเตต
  const getBranchById = useCallback(
    (id: number): Branch | undefined => {
      return branches.find((branch) => branch.id === id);
    },
    [branches]
  );

  // สร้างสาขาใหม่ ง่าย ๆ ส่งข้อมูลเข้าไป
  const createBranch = useCallback(
    async (branchData: Partial<Branch>): Promise<Branch | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/branches`,
          branchData
        );
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
  );

  // อัปเดตข้อมูลสาขาเดิม — ส่ง id กับข้อมูลที่อยากแก้มาเลย
  const updateBranch = useCallback(
    async (id: number, branchData: Partial<Branch>): Promise<Branch | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.patch(
          `${API_BASE_URL}/branches/${id}`,
          branchData
        );
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
  );

  // ลบสาขาแบบชัดเจน — ถ้าสำเร็จ จะรีเทิร์น true
  const deleteBranch = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/branches/${id}`);

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
  }, []);

  // กดรีเฟรชข้อมูลอีกทีก็ได้ เผื่อมีการเปลี่ยนแปลง
  const refetch = useCallback(async () => {
    await fetchBranches();
  }, [fetchBranches]);

  // เปิดหน้ามาครั้งแรกก็โหลดข้อมูลเลย
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

// Hook แยกสำหรับเคสที่อยากดึงสาขาเดี่ยว ๆ เท่านั้น
export function useBranch(id: number) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranch = useCallback(async () => {
    if (!id) return; // ถ้าไม่ได้ส่ง id มาก็ยังไม่ต้องทำอะไร

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/branches/${id}`);
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

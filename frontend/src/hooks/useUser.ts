// Hook นี้ไว้ดึงข้อมูลผู้ใช้แบบสบาย ๆ ใช้ในหน้าไหนก็ได้ที่อยากรู้ว่าเราเป็นใคร
import { useState, useEffect } from "react";
import axios from "axios";

/**
 * User Data Transfer Object
 * Represents the structure of user data returned from the API
 */
// โครง User จากฝั่ง API — มีอะไรบ้างก็ดูตรงนี้ได้เลย
export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  roleName: string;
}

/**
 * Return type for the useUser hook
 */
// เวลาคอมโพเนนต์เรียกใช้ useUser จะได้ค่าตามนี้กลับไป
interface UseUserReturn {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  // เก็บข้อมูลผู้ใช้ ถ้ายังไม่ได้ก็เป็น null ไปก่อน
  const [user, setUser] = useState<UserDTO | null>(null);
  // สถานะโหลดไว้โชว์ UI ให้รู้ว่ากำลังดึงข้อมูล
  const [loading, setLoading] = useState<boolean>(true);
  // ถ้ามีปัญหา จะได้เก็บข้อความเอาไว้แสดง
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // ตรงนี้ยิงไปถามว่า "เราคือใคร" จากแบ็กเอนด์
      const response = await axios.get("http://localhost:3001/user/whoami");
      setUser(response.data);
    } catch (error) {
      // ถ้าล้มเหลวก็แปลงข้อความให้อ่านง่าย ๆ แล้วเคลียร์ user ทิ้ง
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";

      console.error("Error fetching user data:", error);
      setError(errorMessage);
      setUser(null);
    } finally {
      // ยังไงก็หยุดโหลดจ้า
      setLoading(false);
    }
  };

  useEffect(() => {
    // เข้ามาครั้งแรกก็ไปดึงข้อมูลก่อนเลย
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser, // เผื่ออยากกดรีเฟรชด้วยตัวเอง
  };
};

export default useUser;

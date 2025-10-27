// Hook นี้เอาไว้เช็คว่าเราล็อกอินอยู่มั้ย แบบง่าย ๆ ชิล ๆ
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/utils";

export function useAuth() {
  // isAuth = true แปลว่าเข้าระบบแล้ว, false คือยังไม่ได้เข้า
  const [isAuth, setIsAuth] = useState(false);
  // loading ใช้บอกว่าเรากำลังเช็คสถานะอยู่ จะได้เอาไปโชว์สปินเนอร์ได้
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    // ยิงไปถามแบ็กเอนด์ว่าเราล็อกอินอยู่มั้ย
    apiClient
      .get("/auth/status")
      .then((response) => {
        // 200 และ data.login === true คือโอเค ล็อกอินอยู่
        console.log(response); // ดีบักไว้ เผื่ออยากดูของจริง
        if (response.status === 200 && response.data.login === true) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch((error) => {
        // ถ้าพัง ก็ถือว่ายังไม่ได้ล็อกอินไว้ก่อน
        console.error("Error checking login status:", error);
        setIsAuth(false);
      })
      .finally(() => {
        // เช็คเสร็จแล้ว ไม่ว่าจะสำเร็จหรือพัง ก็เลิกโหลด
        setLoading(false);
      });
  }, []);

  // ส่งสถานะไปให้คอมโพเนนต์เอาไปใช้
  return { isAuth, loading };
}

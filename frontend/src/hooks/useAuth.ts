import { useState, useEffect } from "react";
import axios from "axios";

export function useAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = axios.create({ withCredentials: true });

    checkLogin
      .get(import.meta.env.VITE_API_URL + "/auth/status")
      .then((response) => {
        console.log(response);
        if (response.status === 200 && response.data.login === true) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
        setIsAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { isAuth, loading };
}

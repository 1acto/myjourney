import { useState, useEffect } from "react";
import axios from "axios";

/**
 * User Data Transfer Object
 * Represents the structure of user data returned from the API
 */
export interface UserDTO {
  usr_id: number;
  usr_firstname: string;
  usr_lastname: string;
  usr_email: string;
  usr_avatar: string;
  usr_role_name: string;
}

/**
 * Return type for the useUser hook
 */
interface UseUserReturn {
  user: UserDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("http://localhost:3001/user/whoami");
      setUser(response.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";

      console.error("Error fetching user data:", error);
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};

export default useUser;

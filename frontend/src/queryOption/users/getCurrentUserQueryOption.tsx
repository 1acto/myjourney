import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getCurrentUser() {
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });
}

const fetchCurrentUser = async () => {
  const currentUser = await apiClient.get("/user/whoami");

  return currentUser.data;
};

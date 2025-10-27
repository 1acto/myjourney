import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getUser() {
  return queryOptions({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
}

const fetchUser = async () => {
  const res = await apiClient.get("/user/whoami");

  return res.data;
};

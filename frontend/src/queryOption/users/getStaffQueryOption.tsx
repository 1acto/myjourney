import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getUser() {
  return queryOptions({
    queryKey: ["stafflist"],
    queryFn: fetchStaff,
  });
}

const fetchStaff = async () => {
  const sales = await apiClient.get("/user/get/sales");
  const supervisor = await apiClient.get("/user/get/supervisor");

  return { sales: sales.data, supervisor: supervisor.data };
};

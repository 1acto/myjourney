import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getPoisQueryOption() {
  return queryOptions({
    queryKey: ["poi"],
    queryFn: fetchpoi,
  });
}

const fetchpoi = async () => {
  const res = await apiClient.get("/poi");

  return res.data;
};

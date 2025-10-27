import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getBranchesQueryOption() {
  return queryOptions({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });
}

const fetchBranches = async () => {
  const res = await apiClient.get("/branches");

  return res.data;
};

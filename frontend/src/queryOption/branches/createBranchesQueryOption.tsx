import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function getBranchesQueryOption(data: any) {
  return queryOptions({
    queryKey: ["createBranches"],
    queryFn: async () => createBranches(data),
  });
}

const createBranches = async (data: any) => {
  const res = await apiClient.post("/branches", data);

  return res.data;
};

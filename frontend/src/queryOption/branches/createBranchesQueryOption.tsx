import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getBranchesQueryOption(data: any) {
  return queryOptions({
    queryKey: ["createBranches"],
    queryFn: async () => createBranches(data),
  });
}

const createBranches = async (data: any) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/branches`,
    data
  );
  return res.data;
};

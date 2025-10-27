import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getBranchesQueryOption() {
  return queryOptions({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });
}

const fetchBranches = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/branches`);

  return res.data;
};

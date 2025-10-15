import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function createPoiQueryOption(data: any) {
  return queryOptions({
    queryKey: ["createPoi"],
    queryFn: async () => createPoi(data),
  });
}

const createPoi = async (data: any) => {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/poi`, data);
  return res.data;
};

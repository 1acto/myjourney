import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getUser() {
  return queryOptions({
    queryKey: ["stafflist"],
    queryFn: fetchStaff,
  });
}

const fetchStaff = async () => {
  const sales = await axios.get(
    `${import.meta.env.VITE_API_URL}/user/get/sales`
  );
  const supervisor = await axios.get(
    `${import.meta.env.VITE_API_URL}/user/get/supervisor`
  );
  return { sales: sales.data, supervisor: supervisor.data };
};

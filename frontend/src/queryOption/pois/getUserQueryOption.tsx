import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getUser() {
  return queryOptions({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
}

const fetchUser = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/whoami`);
  return res.data;
};

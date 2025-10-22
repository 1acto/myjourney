import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

export default function getCurrentUser() {
  return queryOptions({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });
}

const fetchCurrentUser = async () => {
  const currentUser = await axios.get(
    `${import.meta.env.VITE_API_URL}/user/whoami`
  );
  return currentUser.data;
};

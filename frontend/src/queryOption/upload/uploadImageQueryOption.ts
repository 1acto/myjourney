import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("file", file);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/image`,
        formData,
      );

      return res.data;
    },
  });
}

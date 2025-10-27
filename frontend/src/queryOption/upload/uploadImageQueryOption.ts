import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/utils";

export default function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("file", file);
      const res = await apiClient.post("/upload/image", formData);

      return res.data;
    },
  });
}

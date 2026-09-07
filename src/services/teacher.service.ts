import api from "@/utils/axiosinstance";

// sube un archivo (foto o cv) al backend y devuelve la url guardada
export const uploadTeacherDocument = async (
  file: File,
  type: "photo" | "cv"
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(
    `/v1/teacher/upload-document?type=${type}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  // el backend devuelve la url del archivo (ajustamos segun la respuesta real)
  return data?.url ?? data?.data?.url ?? data;
};
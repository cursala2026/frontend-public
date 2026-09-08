import api from "@/utils/axiosinstance";

// sube un archivo (foto, cv o firma) al backend y devuelve la url guardada
export const uploadTeacherDocument = async (
  file: File,
  type: "photo" | "cv" | "signature"
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

// payload consolidado de la postulacion
export interface ITeacherApplication {
  title: string;
  yearsOfExperience: number;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  signatureUrl: string;
  agreementAccepted: boolean;
}

// envio final de la postulacion consolidada
export const applyTeacher = async (payload: ITeacherApplication) => {
const { data } = await api.post("/v1/user/teacher/apply", payload);
  return data;
};
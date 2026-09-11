import api from "@/utils/axiosinstance";

// levanta el archivo al servidor
export const uploadTeacherDocument = async (
  file: File,
  type: "photo" | "cv" | "signature"
): Promise<string> => {
  const formData = new FormData();
  formData.append(type, file);

  const { data } = await api.post(
    `/user/teacher/apply/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data.data.urls[type];
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
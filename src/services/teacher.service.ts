import api from "@/utils/axiosinstance";

// Invertimos el orden en los parámetros por si el componente llama: uploadTeacherDocument(file, 'cv')
export async function uploadTeacherDocument(
  file: File | Blob,
  type: "photo" | "cv" | "signature" 
): Promise<string> {
  const formData = new FormData();
  
  // EL ORDEN ESTRICTO ES: 1° el string (type), 2° el binario (file)
  formData.append(type, file);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data } = await api.post("/user/teacher/apply/upload", formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return data.urls[type];
}

// Alias opcional por compatibilidad
export const uploadTeacherFile = uploadTeacherDocument;

export interface ITeacherApplication {
  title: string;
  yearsOfExperience: number;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  signatureUrl: string;
  agreementAccepted: boolean;
}

export async function applyTeacher(payload: ITeacherApplication) {
  const { data } = await api.post("/user/teacher/apply", payload);
  return data;
}
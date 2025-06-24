import axios from "axios";
import type { FormState, ModalMode } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export const getProcedures = () => {
  return axiosInstance.get("");
};

export const saveProcedure = (form: FormState, modalMode: ModalMode) => {
  const params = form.parameters ? JSON.parse(form.parameters) : [];
  const formData = new URLSearchParams();
  formData.append("name", form.name);
  formData.append("description", form.description);
  formData.append("query", form.query);
  formData.append("parameters", JSON.stringify(params));

  if (modalMode === "edit" && form.guid) {
    return axiosInstance.put(`/${form.guid}`, formData);
  } else {
    return axiosInstance.post("", formData);
  }
};

export const deleteProcedures = (guids: string[]) => {
  const formData = new URLSearchParams();
  formData.append("guids", guids.join(","));
  return axiosInstance.delete("", {
    data: formData,
  });
};

import API from "./axiosInstance";

export const getProfile = () =>
  API.get("/profile/me");

export const updateProfile = (data) =>
  API.put("/profile/update", data);

export const uploadProfileImage = (formData) =>
  API.post("/profile/upload", formData);

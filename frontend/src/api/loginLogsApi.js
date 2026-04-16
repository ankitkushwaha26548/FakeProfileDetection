import API from "./axiosInstance";

export const getMyLoginLogs = () =>
  API.get("/auth/login-logs");

export const getAllLoginLogs = () =>
  API.get("/admin/logs"); // admin only

export default {
  getMyLoginLogs,
  getAllLoginLogs,
};

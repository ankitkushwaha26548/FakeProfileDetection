import axiosInstance from "./axiosInstance";

export const getMyLoginLogs = () =>
  axiosInstance.get("/auth/login-logs");

export const getAllLoginLogs = () =>
  axiosInstance.get("/auth/login-logs/all"); // admin only

export default {
  getMyLoginLogs,
  getAllLoginLogs,
};

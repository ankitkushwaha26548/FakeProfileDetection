import API from "./axiosInstance";

export const getDashboardStats = () =>
  API.get("/admin/stats");

export const getUsers = () =>
  API.get("/admin/users");

export const getFakeUsers = () =>
  API.get("/admin/fake");

export const getSuspiciousUsers = () =>
  API.get("/admin/suspicious");

export const getLoginLogs = () =>
  API.get("/admin/logs");

export const flagUser = (userId) =>
  API.post(`/admin/flag/${userId}`);

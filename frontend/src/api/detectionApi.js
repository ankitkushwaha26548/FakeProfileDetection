import API from "./axiosInstance";

export const getMyRisk = () =>
  API.get("/detection/me");

export const runScan = (userId) =>
  API.post(`/detection/scan/${userId}`);

export const getAllRiskyUsers = () =>
  API.get("/detection/all");

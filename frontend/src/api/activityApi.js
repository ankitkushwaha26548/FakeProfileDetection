import API from "./axiosInstance";

export const getMyActivities = () =>
  API.get("/activity/me");

export const getAllActivities = () =>
  API.get("/activity/all");

export const getActivityStats = () =>
  API.get("/activity/stats");

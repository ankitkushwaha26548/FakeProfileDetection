import API from "./axiosInstance";

// Paths align with backend/routes/adminRoutes.js (mounted at /api/admin)
export const getDashboardStats = () => API.get("/admin/stats");
export const getUsersWithRisk = () => API.get("/admin/users");
export const getUsers = () => API.get("/admin/users");
export const getFakeUsers = () => API.get("/admin/fake");
export const getSuspiciousUsers = () => API.get("/admin/suspicious");
export const getLoginLogs = () => API.get("/admin/logs");
export const getAllActivities = () => API.get("/activity/all");
export const flagUser = (userId) => API.post(`/admin/flag/${userId}`);
// backend/routes/detectionRoutes.js: POST /api/detection/scan/:userId
export const runDetectionForUser = (userId) => API.post(`/detection/scan/${userId}`);

import API from "./axiosInstance";

export const createPost = (data) =>
  API.post("/posts", data);

export const getFeed = () =>
  API.get("/posts");

export const likePost = (postId) =>
  API.post(`/posts/${postId}/like`);

export const commentPost = (postId, data) =>
  API.post(`/posts/${postId}/comment`, data);

import axios from 'axios';

// Use environment variable for API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const getPosts = () => api.get('/posts').then(res => res.data);
export const createPost = (postData) => api.post('/posts', postData).then(res => res.data);
export const votePost = (postId, voteType) => api.post(`/posts/${postId}/vote`, { voteType }).then(res => res.data);
export const addComment = (postId, commentData) => api.post(`/comments/${postId}`, commentData).then(res => res.data);
export const sharePost = (postId, platform) => api.post('/social/share', { postId, platform }).then(res => res.data);

// Auth API calls
export const login = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const register = (userData) => api.post('/auth/register', userData).then(res => res.data);
export const getCurrentUser = () => api.get('/auth/me').then(res => res.data);

// Reports API calls
export const getReports = () => api.get('/reports').then(res => res.data);
export const createReport = (reportData) => {
  const formData = new FormData();
  Object.keys(reportData).forEach(key => {
    formData.append(key, reportData[key]);
  });
  return api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export default api;

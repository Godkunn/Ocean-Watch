import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getPosts = () => {
  return axios.get(`${API_BASE_URL}/posts`).then(res => res.data);
};

export const createPost = (postData, token) => {
  return axios.post(`${API_BASE_URL}/posts`, postData, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const votePost = (postId, voteType, token) => {
  return axios.post(`${API_BASE_URL}/posts/${postId}/vote`, { voteType }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const addComment = (postId, commentData, token) => {
  return axios.post(`${API_BASE_URL}/comments/${postId}`, commentData, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const sharePost = (postId, platform, token) => {
  return axios.post(`${API_BASE_URL}/social/share`, { postId, platform }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

// Other API calls as needed
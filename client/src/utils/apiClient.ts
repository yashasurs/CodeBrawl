import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = error;
    if (error.response?.data?.message) {
      normalizedError.message = error.response.data.message;
    }
    return Promise.reject(normalizedError);
  }
);

export default apiClient;

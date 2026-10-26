import axios from 'axios';

// Vite dev server proxies /api to http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token from localStorage into headers if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chatgpt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error message handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  /**
   * Register a new user
   * Expects: { firstName, lastName, email, password }
   */
  async register({ firstName, lastName, email, password }) {
    const res = await apiClient.post('/register', {
      fullName: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      email: email.trim().toLowerCase(),
      password,
    });
    return res.data;
  },

  /**
   * Log in user
   * Expects: { email, password }
   */
  async login({ email, password }) {
    const res = await apiClient.post('/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return res.data;
  },
};

export const chatAPI = {
  /**
   * Create a new chat session
   * Expects: title
   */
  async createChat(title = 'New Chat') {
    const res = await apiClient.post('/chat', { title });
    return res.data;
  },

  /**
   * Fetch all chats for the current user
   */
  async getChats() {
    try {
      const res = await apiClient.get('/chat');
      return res.data?.chats || [];
    } catch {
      // Fallback in case endpoint is /chats
      try {
        const resAlt = await apiClient.get('/chats');
        return resAlt.data?.chats || [];
      } catch (err) {
        console.warn('Backend chat listing fallback to local state:', err.message);
        return null;
      }
    }
  },

  /**
   * Fetch messages for a specific chat
   */
  async getChatMessages(chatId) {
    try {
      const res = await apiClient.get(`/chat/${chatId}/messages`);
      return res.data?.messages || [];
    } catch (err) {
      console.warn('Chat messages fetch fallback:', err.message);
      return null;
    }
  },

  /**
   * Delete a chat session
   */
  async deleteChat(chatId) {
    try {
      const res = await apiClient.delete(`/chat/${chatId}`);
      return res.data;
    } catch (err) {
      console.warn('Backend chat deletion fallback:', err.message);
      return null;
    }
  },
};

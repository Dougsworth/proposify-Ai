import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // Add /api here

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // User registration
  register: async (userData) => {
    try {
      console.log("Attempting registration with:", userData);
      const response = await apiClient.post("/auth/register", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      });

      console.log("Registration response:", response.data);

      // Store the access_token from the NestJS response
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error.response?.data || new Error("Registration failed");
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      // Store the access_token from the NestJS response
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error.response?.data || new Error("Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      throw error.response?.data || new Error("Failed to fetch user profile");
    }
  },
};

export default apiClient;

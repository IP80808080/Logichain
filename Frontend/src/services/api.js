import axios from "axios";

const API_URL = "http://localhost:8080/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

//Auth service
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  verifyOtp: (email, otp) => api.post("/auth/verify-otp", { email, otp }),

  resetPassword: ({ email, resetToken, newPassword }) =>
    api.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

//Profile service
export const profileService = {
  getCurrentProfile: () => api.get("/profile"),

  updateProfile: (data) => api.put("/profile", data),

  changePassword: (passwordData) =>
    api.put("/profile/change-password", passwordData),
};

//User service
export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

//Product service
export const productService = {
  getAll: () => api.get("/products"),
  getManagerProducts: (managerId) => api.get(`/products/manager/${managerId}`),
  getMyProducts: () => api.get("/products/my"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

//Carrier service
export const carrierService = {
  getAll: () => api.get("/carriers"),
  getById: (id) => api.get(`/carriers/${id}`),
  create: (data) => api.post("/carriers", data),
  update: (id, data) => api.put(`/carriers/${id}`, data),
  delete: (id) => api.delete(`/carriers/${id}`),
};

//Return service
export const returnService = {
  getAll: () => api.get("/returns"),
  getById: (id) => api.get(`/returns/${id}`),
  create: (data) => api.post("/returns", data),
  update: (id, data) => api.put(`/returns/${id}`, data),
  delete: (id) => api.delete(`/returns/${id}`),
};

//Warehouse service
export const warehouseService = {
  getAll: () => api.get("/warehouses"),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post("/warehouses", data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

//Order services
export const orderService = {
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  getByCustomer: (customerId) => api.get(`/orders/customer/${customerId}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Inventory services
export const inventoryService = {
  getAll: () => api.get("/inventory"),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post("/inventory", data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get("/inventory/low-stock"),
  getByProductId: () => api.get("/inventory/product/{productId}"),
};

// Shipment services
export const shipmentService = {
  getAll: () => api.get("/shipments"),
  getById: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post("/shipments", data),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  delete: (id) => api.delete(`/shipments/${id}`),
  track: (trackingNumber) => api.get(`/shipments/track/${trackingNumber}`),
};

export default api;

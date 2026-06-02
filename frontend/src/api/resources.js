import client from "./client";

// Thin, reusable resource wrappers. Each returns response data directly so the
// pages stay declarative and free of axios boilerplate.

export const productsApi = {
  list: () => client.get("/products").then((r) => r.data),
  get: (id) => client.get(`/products/${id}`).then((r) => r.data),
  create: (payload) => client.post("/products", payload).then((r) => r.data),
  update: (id, payload) => client.put(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/products/${id}`),
};

export const customersApi = {
  list: () => client.get("/customers").then((r) => r.data),
  get: (id) => client.get(`/customers/${id}`).then((r) => r.data),
  create: (payload) => client.post("/customers", payload).then((r) => r.data),
  remove: (id) => client.delete(`/customers/${id}`),
};

export const ordersApi = {
  list: () => client.get("/orders").then((r) => r.data),
  get: (id) => client.get(`/orders/${id}`).then((r) => r.data),
  create: (payload) => client.post("/orders", payload).then((r) => r.data),
  remove: (id) => client.delete(`/orders/${id}`),
};

export const dashboardApi = {
  summary: () => client.get("/dashboard/summary").then((r) => r.data),
};

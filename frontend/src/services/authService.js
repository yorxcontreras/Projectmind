import api from "./api.js";

export async function login({ email, senha }) {
  const { data } = await api.post("/api/auth/login", { email, senha });
  return data;
}

export async function register({ nome, email, senha }) {
  const { data } = await api.post("/api/auth/register", { nome, email, senha });
  return data;
}

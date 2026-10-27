import api from "./api.js";

export async function login({ email, senha }) {
  const { data } = await api.post("/api/usuarios/login", { email, senha });
  return data;
}

export async function register({ nome, email, senha }) {
  const { data } = await api.post("/api/usuarios/cadastro", { nome, email, senha });
  return data;
}

export async function atualizarUsuario(id, dados) {
  const { data } = await api.put(`/api/usuarios/${id}`, dados);
  return data;
}

export async function excluirUsuario(id) {
  const { data } = await api.delete(`/api/usuarios/${id}`);
  return data;
}

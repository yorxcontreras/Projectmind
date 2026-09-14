import api from "./api.js";

export async function listarProjetos() {
  const { data } = await api.get("/api/projetos");
  return data;
}

export async function obterProjeto(id) {
  const { data } = await api.get(`/api/projetos/${id}`);
  return data;
}

export async function criarProjeto(projeto) {
  const { data } = await api.post("/api/projetos", projeto);
  return data;
}

export async function adicionarTarefa(projetoId, tarefa) {
  const { data } = await api.post(`/api/projetos/${projetoId}/tarefas`, tarefa);
  return data;
}

export async function adicionarRisco(projetoId, risco) {
  const { data } = await api.post(`/api/projetos/${projetoId}/riscos`, risco);
  return data;
}

export async function deletarProjeto(id) {
  await api.delete(`/api/projetos/${id}`);
}

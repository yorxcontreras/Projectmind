import api from "./api.js";

export async function analisarProjeto(projetoId) {
  const { data } = await api.post(`/api/auditoria/analisar/${projetoId}`);
  return data;
}

export async function chatIA({ projetoId, pergunta, contextoAdicional }) {
  const { data } = await api.post("/api/auditoria/chat", {
    projetoId,
    pergunta,
    contextoAdicional,
  });
  return data;
}

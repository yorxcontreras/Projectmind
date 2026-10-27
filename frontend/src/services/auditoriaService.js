import api from "./api.js";

export async function analisarProjeto(projetoId) {
  const { data } = await api.post(`/api/auditoria/analisar/${projetoId}`);
  return data;
}

export async function chatIA({ projetoId, pergunta, contextoAdicional, primeiraMensagem }) {
  const { data } = await api.post("/api/auditoria/chat", {
    projetoId,
    pergunta,
    contextoAdicional,
    primeiraMensagem,
  });
  return data;
}

export async function obterMetricasProjeto(projetoId) {
  const { data } = await api.get(`/api/auditoria/metricas/${projetoId}`);
  return data;
}

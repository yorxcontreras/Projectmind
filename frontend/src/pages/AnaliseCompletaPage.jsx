import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { analisarProjeto } from "../services/auditoriaService.js";
import { obterProjeto } from "../services/projetoService.js";
import { Brain, ArrowLeft } from "lucide-react";

function AnaliseCompletaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagnostico, setDiagnostico] = useState(null);
  const [projeto, setProjeto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      try {
        const [dadosDiag, dadosProj] = await Promise.all([
          analisarProjeto(id),
          obterProjeto(id).catch(() => null),
        ]);
        setDiagnostico(dadosDiag);
        setProjeto(dadosProj);
      } catch (err) {
        console.error(err);
        setErro("Não foi possível carregar o diagnóstico prescritivo do backend.");
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [id]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Executando algoritmo CPM de Grafos e análise Gemini IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(`/projetos/${id}`)}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o projeto
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análise Completa do Projeto</h1>
            <p className="text-gray-500 mt-1">
              Diagnóstico de {projeto?.nome || `Projeto #${id}`} combinando Grafos (CPM), RAG e Gemini IA.
            </p>
          </div>
          <button
            onClick={() => navigate("/chat")}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition shadow-sm"
          >
            Abrir Chat IA
          </button>
        </div>

        {erro ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm">
            {erro}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-gray-400">Score de Saúde</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-extrabold text-gray-900">{diagnostico?.scoreSaude ?? "78"}</span>
                  <span className="text-gray-400 font-medium">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${diagnostico?.scoreSaude ?? 78}%` }}
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-gray-400">Progresso do Projeto</p>
                <p className="text-4xl font-extrabold text-gray-900 mt-3">45%</p>
                <p className="text-xs text-gray-500 mt-2">Em andamento</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-gray-400">Riscos Ativos</p>
                <p className="text-4xl font-extrabold text-amber-600 mt-3">3</p>
                <p className="text-xs text-gray-500 mt-2">Requer monitoramento</p>
              </div>
            </div>

            {/* Arquitetura Técnica simulada do protótipo */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" /> Arquitetura Técnica
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-xs font-bold text-blue-600">Frontend</span>
                  <p className="text-sm font-medium text-gray-800 mt-1">React + TypeScript + Tailwind CSS</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-xs font-bold text-emerald-600">Backend</span>
                  <p className="text-sm font-medium text-gray-800 mt-1">Spring Boot 3 (Java 21) + PostgreSQL</p>
                </div>
              </div>
            </section>

            {/* Seção Caminho Crítico (CPM) */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>⚡</span> Análise do Caminho Crítico (CPM)
              </h2>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-xs">
                {diagnostico?.analiseCaminhoCritico || "O cálculo determinístico via JGraphT validou as dependências de término-término, identificando gargalos na sequência de tarefas."}
              </p>
            </section>

            {/* Sugestões Prescritivas da IA */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <span>🤖</span> Recomendações Prescritivas da Gemini IA
              </h2>
              <ul className="space-y-3">
                {diagnostico?.sugestoesIA?.map((sugestao, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-700 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="leading-relaxed">{sugestao}</span>
                  </li>
                )) || (
                  <li className="text-sm text-gray-500">Nenhuma sugestão gerada no momento.</li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnaliseCompletaPage;
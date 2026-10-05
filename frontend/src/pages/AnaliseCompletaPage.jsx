import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { analisarProjeto } from "../services/auditoriaService.js";
import { obterProjeto } from "../services/projetoService.js";

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
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Executando algoritmo CPM de Grafos e análise Gemini IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <button
          onClick={() => navigate(`/projetos/${id}`)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-1 transition"
        >
          ← Voltar para o projeto
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Análise Prescritiva por IA</h1>
            <p className="text-slate-500 mt-1">
              Diagnóstico de {projeto?.nome || `Projeto #${id}`} combinando Grafos (CPM), RAG e Gemini IA.
            </p>
          </div>

          <button
            onClick={() => navigate("/chat")}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
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
            
            {/* Metrics Row */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Score de Saúde</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-extrabold text-slate-900">{diagnostico?.scoreSaude ?? "--"}</span>
                  <span className="text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${diagnostico?.scoreSaude ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Tarefas no Caminho Crítico</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-3">
                  {diagnostico?.tarefasCriticasIds?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Gargalos diretos no prazo</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">Lições Aplicadas (RAG)</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-3">
                  {diagnostico?.licoesAprendidasRelevantes?.length ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Base de conhecimento histórica</p>
              </div>
            </div>

            {/* Critical Path Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⚡</span> Análise do Caminho Crítico (CPM)
              </h2>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs">
                {diagnostico?.analiseCaminhoCritico}
              </p>
            </section>

            {/* AI Prescriptive Suggestions */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span>🤖</span> Recomendações Prescritivas da Gemini IA
              </h2>
              <ul className="space-y-3">
                {diagnostico?.sugestoesIA?.map((sugestao, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-700 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span className="leading-relaxed">{sugestao}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Historical Lessons Learned (RAG) */}
            {diagnostico?.licoesAprendidasRelevantes?.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>📚</span> Lições Aprendidas Históricas Relevantes
                </h2>
                <ul className="space-y-2">
                  {diagnostico.licoesAprendidasRelevantes.map((licao, idx) => (
                    <li key={idx} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      💡 {licao}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default AnaliseCompletaPage;
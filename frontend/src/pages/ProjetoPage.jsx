import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obterProjeto, adicionarTarefa } from "../services/projetoService.js";

function ProjetoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projeto, setProjeto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModalTarefa, setMostrarModalTarefa] = useState(false);
  const [descTarefa, setDescTarefa] = useState("");
  const [duracao, setDuracao] = useState(5);

  const carregarProjeto = async () => {
    setCarregando(true);
    try {
      const data = await obterProjeto(id);
      setProjeto(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProjeto();
  }, [id]);

  const handleNovaTarefa = async (e) => {
    e.preventDefault();
    if (!descTarefa.trim()) return;

    try {
      await adicionarTarefa(id, {
        descricao: descTarefa,
        duracaoDias: parseInt(duracao),
        tipoDependencia: "TI",
      });
      setDescTarefa("");
      setMostrarModalTarefa(false);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar tarefa.");
    }
  };

  if (carregando) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Carregando dados do projeto...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate("/projetos")}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-1 transition"
        >
          ← Meus Projetos
        </button>

        {/* Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{projeto?.nome || `Projeto #${id}`}</h1>
            <p className="text-slate-500 mt-1">{projeto?.descricao || "Sem descrição disponível."}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarModalTarefa(true)}
              className="bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-700 transition"
            >
              + Adicionar Tarefa
            </button>

            <button
              onClick={() => navigate(`/projetos/${id}/analise`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>✨</span> Análise Prescritiva IA
            </button>
          </div>
        </div>

        {/* Modal Nova Tarefa */}
        {mostrarModalTarefa && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Adicionar Tarefa</h2>
              <form onSubmit={handleNovaTarefa} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição da Tarefa</label>
                  <input
                    type="text"
                    value={descTarefa}
                    onChange={(e) => setDescTarefa(e.target.value)}
                    placeholder="Ex: Desenvolvimento da API"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duração (Dias)</label>
                  <input
                    type="number"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalTarefa(false)}
                    className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Tarefas do Projeto</h2>

          {projeto?.tarefas && projeto.tarefas.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {projeto.tarefas.map((t, idx) => (
                <div key={t.id || idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.descricao}</p>
                    <p className="text-xs text-slate-500">Duração: {t.duracaoDias} dias | Dependência: {t.tipoDependencia || "Nenhuma"}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                    ID: {t.id}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Nenhuma tarefa cadastrada até o momento neste projeto.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProjetoPage;
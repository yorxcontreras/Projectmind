import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obterProjeto, adicionarTarefa } from "../services/projetoService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Brain, User, LogOut, ArrowLeft, Plus, CheckCircle2, AlertTriangle, BookOpen, LayoutDashboard, ListTodo } from "lucide-react";

function ProjetoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projeto, setProjeto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboards");
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
    return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Carregando detalhes do projeto...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Fixo Padrão */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">ProjectMind</h1>
                <p className="text-xs text-gray-500">Gestão Inteligente de Projetos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/projetos/${id}/analise`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
              >
                <span>✨</span> Análise Prescritiva IA
              </button>
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nome || "Usuário"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "usuario@projectmind.com"}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Botão Voltar e Cabeçalho do Projeto */}
        <button
          onClick={() => navigate("/projetos")}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Meus Projetos
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{projeto?.nome || `Projeto #${id}`}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{projeto?.descricao || "Sem descrição disponível."}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-blue-600">72%</span>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Score de Saúde</p>
          </div>
        </div>

        {/* Cards de Resumo Superior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">Progresso Geral</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">45%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Tarefas Cadastradas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{projeto?.tarefas?.length || 0}</p>
            </div>
            <button
              onClick={() => setMostrarModalTarefa(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition shadow-sm"
              title="Adicionar Tarefa"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">Riscos Ativos</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">3</p>
          </div>
        </div>

        {/* Sistema de Abas do Protótipo (Dashboards, Tarefas, Riscos, IA Feedback, Lições) */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 bg-white px-6 rounded-t-2xl border-x border-t pt-2">
          {[
            { id: "dashboards", label: "Dashboards", icon: LayoutDashboard },
            { id: "tarefas", label: "Tarefas", icon: ListTodo },
            { id: "riscos", label: "Riscos", icon: AlertTriangle },
            { id: "feedback", label: "IA Feedback", icon: Brain },
            { id: "licoes", label: "Lições", icon: BookOpen },
          ].map((aba) => {
            const Icon = aba.icon;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium border-b-2 transition ${
                  abaAtiva === aba.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {aba.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo dinâmico de acordo com a aba selecionada */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {abaAtiva === "dashboards" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Visão Geral e Indicadores</h3>
              <p className="text-sm text-gray-500 mb-6">Distribuição e status analítico das atividades e métricas do projeto.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Status de Tarefas</h4>
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
                    Gráfico de Status (Concluídas / Pendentes)
                  </div>
                </div>
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Riscos por Severidade</h4>
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
                    Gráfico de Severidade (Alto / Médio / Baixo)
                  </div>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "tarefas" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Grafo de Dependências e Tarefas</h3>
                <button
                  onClick={() => setMostrarModalTarefa(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl"
                >
                  + Adicionar Tarefa
                </button>
              </div>
              {projeto?.tarefas && projeto.tarefas.length > 0 ? (
                <div className="space-y-3">
                  {projeto.tarefas.map((t, idx) => (
                    <div key={t.id || idx} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <p className="font-bold text-gray-900 text-sm">{t.descricao}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Duração: {t.duracaoDias} dias | Dependência: {t.tipoDependencia || "Nenhuma"}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">ID: {t.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-8 text-center">Nenhuma tarefa cadastrada até o momento.</p>
              )}
            </div>
          )}

          {abaAtiva === "riscos" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Matriz de Riscos</h3>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Equipe de frontend com recursos limitados</h4>
                    <p className="text-xs text-amber-700 mt-1">Probabilidade: 60% | Impacto: 6/10 | Score: 3.6</p>
                  </div>
                  <span className="text-xs bg-amber-200 text-amber-800 px-3 py-1 rounded-full font-bold">MÉDIO</span>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Requisitos podem mudar durante desenvolvimento</h4>
                    <p className="text-xs text-rose-700 mt-1">Probabilidade: 50% | Impacto: 7/10 | Score: 3.5</p>
                  </div>
                  <span className="text-xs bg-rose-200 text-rose-800 px-3 py-1 rounded-full font-bold">ALTO</span>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "feedback" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Análise de Saúde da IA</h3>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                <h4 className="font-semibold text-blue-900 text-sm">Pontos Críticos Identificados</h4>
                <p className="text-xs text-blue-700 mt-1">Tarefa 'Desenvolvimento Frontend' possui alta dependência crítica no caminho atual.</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <h4 className="font-semibold text-emerald-900 text-sm">Sugestões Prescritivas</h4>
                <p className="text-xs text-emerald-700 mt-1">Considere paralelizar o desenvolvimento com mocks para mitigar o gargalo de API.</p>
              </div>
            </div>
          )}

          {abaAtiva === "licoes" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lições Aprendidas Relevantes (RAG)</h3>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">Arquitetura</span>
                  <p className="text-sm font-medium text-gray-800 mt-2">Migrações cloud devem ser incrementais. Big-bang migrations têm taxa de falha elevada.</p>
                  <p className="text-xs text-gray-400 mt-1">Fonte: Migração Cloud Banco ABC</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Nova Tarefa */}
        {mostrarModalTarefa && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Tarefa</h3>
              <form onSubmit={handleNovaTarefa} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={descTarefa}
                    onChange={(e) => setDescTarefa(e.target.value)}
                    placeholder="Ex: Desenvolvimento da API"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duração (Dias)</label>
                  <input
                    type="number"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalTarefa(false)}
                    className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium">
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProjetoPage;
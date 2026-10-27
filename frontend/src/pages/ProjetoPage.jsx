import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  obterProjeto,
  adicionarTarefa,
  atualizarTarefa,
  excluirTarefa,
  atualizarProjeto,
  deletarProjeto,
  adicionarRisco,
  excluirRisco,
} from "../services/projetoService.js";
import { obterMetricasProjeto } from "../services/auditoriaService.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Brain,
  User,
  LogOut,
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  LayoutDashboard,
  ListTodo,
  Pencil,
  Trash2,
  TrendingUp,
  Clock,
  ShieldAlert,
} from "lucide-react";

function ProjetoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [projeto, setProjeto] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboards");

  // Modal de Nova Tarefa
  const [mostrarModalTarefa, setMostrarModalTarefa] = useState(false);
  const [descTarefa, setDescTarefa] = useState("");
  const [duracao, setDuracao] = useState(5);

  // Modal de Edição de Tarefa
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [descEdit, setDescEdit] = useState("");
  const [duracaoEdit, setDuracaoEdit] = useState(5);
  const [pctEdit, setPctEdit] = useState(0);

  // Modal de Edição do Projeto
  const [mostrarModalEditarProjeto, setMostrarModalEditarProjeto] = useState(false);
  const [nomeProjetoEdit, setNomeProjetoEdit] = useState("");
  const [descProjetoEdit, setDescProjetoEdit] = useState("");

  // Modal de Novo Risco
  const [mostrarModalRisco, setMostrarModalRisco] = useState(false);
  const [descRisco, setDescRisco] = useState("");
  const [probRisco, setProbRisco] = useState(50);
  const [impactoRisco, setImpactoRisco] = useState(3);

  const carregarProjeto = async () => {
    setCarregando(true);
    try {
      const [dadosProj, dadosMetricas] = await Promise.all([
        obterProjeto(id),
        obterMetricasProjeto(id).catch(() => null),
      ]);
      if (dadosProj && dadosProj.tarefas) {
        dadosProj.tarefas.sort((a, b) => (a.id || 0) - (b.id || 0));
      }
      setProjeto(dadosProj);
      setMetricas(dadosMetricas);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProjeto();
  }, [id]);

  // Manipulação de Tarefas
  const handleNovaTarefa = async (e) => {
    e.preventDefault();
    if (!descTarefa.trim()) return;
    try {
      await adicionarTarefa(id, {
        descricao: descTarefa.trim(),
        duracaoDias: parseInt(duracao),
        percentualConcluido: 0,
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

  const handleAbrirEditar = (t) => {
    setTarefaEditando(t);
    setDescEdit(t.descricao);
    setDuracaoEdit(t.duracaoDias || 1);
    setPctEdit(t.percentualConcluido != null ? t.percentualConcluido : 0);
    setMostrarModalEditar(true);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!descEdit.trim() || !tarefaEditando) return;
    try {
      await atualizarTarefa(id, tarefaEditando.id, {
        descricao: descEdit.trim(),
        duracaoDias: parseInt(duracaoEdit),
        percentualConcluido: parseInt(pctEdit),
      });
      setMostrarModalEditar(false);
      setTarefaEditando(null);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar tarefa.");
    }
  };

  const handleExcluirTarefa = async (tarefaId, descricao) => {
    const confirmou = window.confirm(
      `Deseja realmente excluir a tarefa "${descricao}"? Ela será excluída permanentemente do banco de dados.`
    );
    if (!confirmou) return;
    try {
      await excluirTarefa(id, tarefaId);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir a tarefa.");
    }
  };

  // Manipulação de Riscos
  const handleNovoRisco = async (e) => {
    e.preventDefault();
    if (!descRisco.trim()) return;
    try {
      await adicionarRisco(id, {
        descricao: descRisco.trim(),
        probabilidade: parseFloat(probRisco) / 100.0,
        impacto: parseFloat(impactoRisco),
      });
      setDescRisco("");
      setMostrarModalRisco(false);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar risco.");
    }
  };

  const handleExcluirRisco = async (riscoId, descricao) => {
    const confirmou = window.confirm(`Deseja realmente excluir o risco "${descricao}"?`);
    if (!confirmou) return;
    try {
      await excluirRisco(id, riscoId);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o risco.");
    }
  };

  // Edição do Projeto
  const handleAbrirEditarProjeto = () => {
    setNomeProjetoEdit(projeto?.nome || "");
    setDescProjetoEdit(projeto?.descricao || "");
    setMostrarModalEditarProjeto(true);
  };

  const handleSalvarEdicaoProjeto = async (e) => {
    e.preventDefault();
    if (!nomeProjetoEdit.trim()) return;
    try {
      await atualizarProjeto(id, {
        nome: nomeProjetoEdit.trim(),
        descricao: descProjetoEdit.trim(),
      });
      setMostrarModalEditarProjeto(false);
      carregarProjeto();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o projeto.");
    }
  };

  const handleExcluirProjeto = async () => {
    const confirmou = window.confirm(
      `Deseja realmente excluir o projeto "${projeto?.nome}"? Todos os dados vinculados serão excluídos permanentemente.`
    );
    if (!confirmou) return;
    try {
      await deletarProjeto(id);
      navigate("/projetos");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o projeto.");
    }
  };

  if (carregando) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Carregando detalhes do projeto...</div>;
  }

  const cronograma = metricas?.cronograma;
  const previsao = metricas?.previsao;
  const caracteristicas = metricas?.caracteristicas;
  const listaTarefasCpm = cronograma?.tarefas || [];
  const cpmMap = new Map(listaTarefasCpm.map((tc) => [tc.id, tc]));

  // Mapa de severidade de riscos
  const listaRiscos = metricas?.riscos || (projeto?.riscos ? projeto.riscos.map(r => ({
    id: r.id,
    descricao: r.descricao,
    probabilidade: r.probabilidade,
    impactoDias: r.impacto,
    severidade: "Médio"
  })) : []);

  const situacaoBadge = {
    ATRASADO: "bg-rose-100 text-rose-800 border-rose-200",
    NO_PRAZO: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ADIANTADO: "bg-blue-100 text-blue-800 border-blue-200",
    CONCLUIDO: "bg-purple-100 text-purple-800 border-purple-200",
    NAO_INICIADO: "bg-gray-100 text-gray-800 border-gray-200",
    SEM_DADOS: "bg-gray-100 text-gray-800 border-gray-200",
  }[cronograma?.situacaoPrazo] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Fixo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate("/projetos")}
              className="flex items-center gap-3 cursor-pointer group"
              title="Ir para a página inicial"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">ProjectMind</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/projetos/${id}/analise`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                Análise Prescritiva Completa
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Chat com IA
              </button>
              <div
                onClick={() => navigate("/perfil")}
                className="flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-200 group"
                title="Meu Perfil"
              >
                <div className="w-9 h-9 bg-blue-600 group-hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-gray-400 hover:text-gray-600 p-2 transition"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/projetos")}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Meus Projetos
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{projeto?.nome || `Projeto #${id}`}</h2>
              {cronograma?.situacaoPrazo && (
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${situacaoBadge}`}>
                  {cronograma.situacaoPrazo}
                </span>
              )}
              <button
                onClick={handleAbrirEditarProjeto}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Renomear / Editar Projeto"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={handleExcluirProjeto}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Excluir Projeto"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">{projeto?.descricao || "Sem descrição disponível."}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-blue-600">
              {metricas?.scoreSaude != null ? `${metricas.scoreSaude}%` : "—"}
            </span>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Score de Saúde</p>
          </div>
        </div>

        {/* Cards de Resumo Superior com dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">Progresso Físico Real</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {cronograma?.progressoRealPercentual != null ? `${cronograma.progressoRealPercentual}%` : "0%"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Planejado: {cronograma?.progressoPlanejadoPercentual != null ? `${cronograma.progressoPlanejadoPercentual}%` : "0%"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Tarefas Cadastradas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{projeto?.tarefas?.length || 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {caracteristicas?.tarefasCriticas ?? 0} no caminho crítico
              </p>
            </div>
            <button
              onClick={() => setMostrarModalTarefa(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition shadow-sm"
              title="Adicionar Tarefa"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Riscos Mapeados</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{listaRiscos.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                Exposição: {metricas?.exposicaoTotalRiscosDias ?? 0} dias
              </p>
            </div>
            <button
              onClick={() => setMostrarModalRisco(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-xl transition shadow-sm"
              title="Cadastrar Risco"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sistema de Abas */}
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

        {/* Conteúdo Dinâmico por Aba */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {/* ABA DASHBOARDS */}
          {abaAtiva === "dashboards" && (
            <div className="space-y-6">
              {/* Card de Previsões Estocásticas */}
              {previsao && (
                <div className="p-5 border border-blue-100 bg-blue-50/40 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Previsão Analítica de Término (Monte Carlo + Earned Schedule)
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                      {previsao.probabilidadeNoPrazo != null ? `${previsao.probabilidadeNoPrazo}% de chance no prazo` : "Calibrando..."}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block">Término mais provável (P50)</span>
                      <span className="font-bold text-gray-900 text-sm block mt-1">
                        {previsao.dataTerminoP50 ? new Date(previsao.dataTerminoP50 + "T00:00:00").toLocaleDateString("pt-BR") : "N/D"}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block">Cenário com Riscos (P80)</span>
                      <span className="font-bold text-gray-900 text-sm block mt-1">
                        {previsao.dataTerminoP80 ? new Date(previsao.dataTerminoP80 + "T00:00:00").toLocaleDateString("pt-BR") : "N/D"}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block">Variação Acumulada</span>
                      <span className={`font-bold text-sm block mt-1 ${cronograma?.atrasoDias > 0 ? "text-rose-600" : (cronograma?.atrasoDias < 0 ? "text-blue-600" : "text-emerald-600")}`}>
                        {cronograma?.atrasoDias > 0
                          ? `${cronograma.atrasoDias} dias de atraso`
                          : (cronograma?.atrasoDias < 0 ? `${Math.abs(cronograma.atrasoDias)} dias adiantado` : "Em dia")}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block">Índice SPI</span>
                      <span className="font-bold text-gray-900 text-sm block mt-1">
                        {cronograma?.spi != null ? cronograma.spi : "N/D"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status de Tarefas e Riscos */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3">Distribuição das Tarefas</h4>
                  {caracteristicas ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Concluídas ({caracteristicas.concluidas})</span>
                          <span>{caracteristicas.totalTarefas > 0 ? Math.round((caracteristicas.concluidas / caracteristicas.totalTarefas) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${caracteristicas.totalTarefas > 0 ? (caracteristicas.concluidas / caracteristicas.totalTarefas) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Em Andamento ({caracteristicas.emAndamento})</span>
                          <span>{caracteristicas.totalTarefas > 0 ? Math.round((caracteristicas.emAndamento / caracteristicas.totalTarefas) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${caracteristicas.totalTarefas > 0 ? (caracteristicas.emAndamento / caracteristicas.totalTarefas) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Não Iniciadas ({caracteristicas.naoIniciadas})</span>
                          <span>{caracteristicas.totalTarefas > 0 ? Math.round((caracteristicas.naoIniciadas / caracteristicas.totalTarefas) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gray-400 h-2 rounded-full"
                            style={{ width: `${caracteristicas.totalTarefas > 0 ? (caracteristicas.naoIniciadas / caracteristicas.totalTarefas) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Sem dados de tarefas.</p>
                  )}
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3">Riscos por Severidade</h4>
                  {listaRiscos.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {listaRiscos.map((r, idx) => (
                        <div key={r.id || idx} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg">
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">{r.descricao}</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            r.severidade === "Crítico" ? "bg-rose-100 text-rose-800" :
                            r.severidade === "Alto" ? "bg-amber-100 text-amber-800" :
                            r.severidade === "Médio" ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {r.severidade || "Normal"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">Nenhum risco registrado.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ABA TAREFAS */}
          {abaAtiva === "tarefas" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Grafo de Dependências e Tarefas</h3>
                  <p className="text-xs text-gray-500">Acompanhe o caminho crítico, folgas e o progresso real de execução.</p>
                </div>
                <button
                  onClick={() => setMostrarModalTarefa(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl"
                >
                  + Adicionar Tarefa
                </button>
              </div>

              {projeto?.tarefas && projeto.tarefas.length > 0 ? (
                <div className="space-y-3">
                  {[...projeto.tarefas]
                    .sort((a, b) => (a.id || 0) - (b.id || 0))
                    .map((t, idx) => {
                    const cpmInfo = cpmMap.get(t.id);
                    const isCritica = cpmInfo?.critica;
                    const folga = cpmInfo?.folga ?? 0;
                    const pct = t.percentualConcluido ?? 0;
                    const isConcluida = pct === 100;
                    const isGargaloAtivo = isCritica && !isConcluida;

                    return (
                      <div
                        key={t.id || idx}
                        className={`p-4 border rounded-xl flex items-center justify-between transition bg-white shadow-sm ${
                          isGargaloAtivo
                            ? "border-rose-300 ring-1 ring-rose-200"
                            : isConcluida
                            ? "border-gray-200 bg-gray-50/30"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${isConcluida ? "text-emerald-600" : "text-gray-300"}`} />
                            <p className="font-bold text-gray-900 text-sm">{t.descricao}</p>
                            {isGargaloAtivo && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Gargalo Crítico Ativo (Folga 0d)
                              </span>
                            )}
                            {isCritica && isConcluida && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Caminho Crítico (Concluído)
                              </span>
                            )}
                            {!isCritica && folga > 0 && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                                Folga: {folga}d
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="w-36 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{pct}%</span>
                            <span className="text-xs text-gray-400">Duração: {t.duracaoDias} dias</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAbrirEditar(t)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Atualizar tarefa e progresso"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirTarefa(t.id, t.descricao)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium ml-1">
                            ID: {t.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-8 text-center">Nenhuma tarefa cadastrada até o momento.</p>
              )}
            </div>
          )}

          {/* ABA RISCOS */}
          {abaAtiva === "riscos" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Matriz Quantitativa de Riscos</h3>
                  <p className="text-xs text-gray-500">Riscos alimentam a Simulação de Monte Carlo com impacto estocástico de término.</p>
                </div>
                <button
                  onClick={() => setMostrarModalRisco(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-2 rounded-xl"
                >
                  + Cadastrar Risco
                </button>
              </div>

              {listaRiscos.length > 0 ? (
                <div className="space-y-3">
                  {listaRiscos.map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="p-4 border border-gray-200 rounded-xl flex justify-between items-center bg-white hover:border-gray-300 transition"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{r.descricao}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Probabilidade: {Math.round((r.probabilidade || 0.5) * 100)}% | Impacto potencial: {r.impactoDias || r.impacto || 1} dias
                          {r.exposicaoDias ? ` | Exposição: ${r.exposicaoDias}d` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          r.severidade === "Crítico" ? "bg-rose-100 text-rose-800" :
                          r.severidade === "Alto" ? "bg-amber-100 text-amber-800" :
                          r.severidade === "Médio" ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {r.severidade || "MÉDIO"}
                        </span>
                        {r.id && (
                          <button
                            onClick={() => handleExcluirRisco(r.id, r.descricao)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir risco"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-8 text-center">Nenhum risco cadastrado para este projeto.</p>
              )}
            </div>
          )}

          {/* ABA IA FEEDBACK */}
          {abaAtiva === "feedback" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Diagnóstico e Histórico Analítico</h3>
                <button
                  onClick={() => navigate(`/projetos/${id}/analise`)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Ver Análise Completa &rarr;
                </button>
              </div>

              {metricas?.alertas && metricas.alertas.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                  <h4 className="font-semibold text-amber-900 text-sm mb-2">Alertas do Motor Analítico</h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    {metricas.alertas.map((al, i) => (
                      <li key={i}>• {al}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="font-semibold text-blue-900 text-sm">Resumo da Calibração Histórica</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Amostras históricas do usuário: {metricas?.historico?.amostrasHistoricasUsuario ?? 0} tarefa(s) concluída(s).
                  Fator de calibração empírico atual: x{metricas?.previsao?.fatorCalibracaoHistorica ?? 1.0}.
                </p>
              </div>
            </div>
          )}

          {/* ABA LIÇÕES */}
          {abaAtiva === "licoes" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lições Aprendidas Relevantes (RAG)</h3>
              {metricas?.licoesRelevantes && metricas.licoesRelevantes.length > 0 ? (
                <div className="space-y-3">
                  {metricas.licoesRelevantes.map((licao, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-purple-50/20">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">
                        Recomendação Histórica
                      </span>
                      <p className="text-sm font-medium text-gray-800 mt-2">{licao}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-8 text-center">Nenhuma lição aprendida correlacionada no momento.</p>
              )}
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
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalTarefa(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  >
                    Salvar Tarefa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Tarefa com Progresso */}
        {mostrarModalEditar && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Atualizar Tarefa e Progresso</h3>
              <form onSubmit={handleSalvarEdicao} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={descEdit}
                    onChange={(e) => setDescEdit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duração Planejada (Dias)</label>
                  <input
                    type="number"
                    value={duracaoEdit}
                    onChange={(e) => setDuracaoEdit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-600">% Concluído</label>
                    <span className="text-xs font-bold text-blue-600">{pctEdit}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={pctEdit}
                    onChange={(e) => setPctEdit(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEditar(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Novo Risco */}
        {mostrarModalRisco && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cadastrar Risco</h3>
              <form onSubmit={handleNovoRisco} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição do Risco</label>
                  <input
                    type="text"
                    value={descRisco}
                    onChange={(e) => setDescRisco(e.target.value)}
                    placeholder="Ex: Atraso na aprovação de ambiente pelo cliente"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-gray-600">Probabilidade de Ocorrência</label>
                    <span className="text-xs font-bold text-amber-600">{probRisco}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    step="5"
                    value={probRisco}
                    onChange={(e) => setProbRisco(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Impacto Potencial de Atraso (Dias)</label>
                  <input
                    type="number"
                    value={impactoRisco}
                    onChange={(e) => setImpactoRisco(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalRisco(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  >
                    Cadastrar Risco
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Projeto */}
        {mostrarModalEditarProjeto && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Projeto</h3>
              <form onSubmit={handleSalvarEdicaoProjeto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    value={nomeProjetoEdit}
                    onChange={(e) => setNomeProjetoEdit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={descProjetoEdit}
                    onChange={(e) => setDescProjetoEdit(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEditarProjeto(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                  >
                    Salvar Projeto
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
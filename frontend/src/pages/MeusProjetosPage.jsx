import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarProjetos, criarProjeto } from "../services/projetoService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Brain, LayoutDashboard, User, LogOut, Plus, Sparkles, Network, BookOpen } from "lucide-react";

function MeusProjetosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  const carregarProjetos = async () => {
    setCarregando(true);
    try {
      const dados = await listarProjetos();
      setProjetos(dados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  const handleCriarProjeto = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    try {
      await criarProjeto({
        nome: novoNome,
        descricao: novaDescricao,
      });
      setNovoNome("");
      setNovaDescricao("");
      setMostrarModal(false);
      carregarProjetos();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar projeto.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Padronizado */}
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
                onClick={() => navigate("/chat")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> Assistente IA
              </button>
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nome || "Usuário"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "usuario@projectmind.com"}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Meus Projetos</h2>
              <p className="text-gray-500 text-sm">{projetos.length} projeto(s) ativo(s)</p>
            </div>
          </div>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Projeto
          </button>
        </div>

        {/* Modal Criar Projeto */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Criar Novo Projeto</h2>
              <form onSubmit={handleCriarProjeto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Sistema de E-commerce"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
                  <textarea
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Descrição breve dos objetivos..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-24 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listagem de Projetos */}
        {carregando ? (
          <div className="text-center py-16 text-gray-500">Carregando projetos...</div>
        ) : projetos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-700 font-medium text-lg">Nenhum projeto cadastrado.</p>
            <p className="text-gray-400 text-sm mt-1">Clique em "Novo Projeto" para iniciar sua gestão inteligente.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{projeto.nome}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                      75% Saúde
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {projeto.descricao || "Sem descrição informada."}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/projetos/${projeto.id}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl py-2.5 transition text-center shadow-sm"
                  >
                    Abrir Projeto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards Informativos Inferiores do Protótipo */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">IA Preditiva</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Análise em tempo real usando machine learning para prever riscos e sugerir otimizações.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Network className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">Análise de Grafos</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Algoritmos avançados (CPM) para identificar caminho crítico e dependências complexas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">RAG Knowledge Base</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sistema de busca vetorial que encontra lições aprendidas relevantes de projetos passados.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MeusProjetosPage;
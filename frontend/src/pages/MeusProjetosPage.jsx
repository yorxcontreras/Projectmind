import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarProjetos, criarProjeto } from "../services/projetoService.js";

function MeusProjetosPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meus Projetos</h1>
            <p className="text-slate-500 mt-1">
              Gerencie e acompanhe o diagnóstico inteligente dos seus projetos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              + Novo Projeto
            </button>

            <button
              onClick={() => navigate("/chat")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              Assistente Gemini IA
            </button>
          </div>
        </div>

        {/* Modal Criar Projeto */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Criar Novo Projeto</h2>
              <form onSubmit={handleCriarProjeto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Projeto</label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Sistema E-commerce"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                  <textarea
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Descrição breve dos objetivos..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-24"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
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

        {/* List of Projects */}
        {carregando ? (
          <div className="text-center py-12 text-slate-500">Carregando projetos...</div>
        ) : projetos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-600 font-medium text-lg">Nenhum projeto cadastrado.</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "+ Novo Projeto" para criar o primeiro projeto.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-900">{projeto.nome}</h2>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                      #{projeto.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {projeto.descricao || "Sem descrição informada."}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Status</span>
                    <span className="text-emerald-600">Ativo</span>
                  </div>

                  <button
                    onClick={() => navigate(`/projetos/${projeto.id}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl py-2.5 transition text-center"
                  >
                    Abrir Projeto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MeusProjetosPage;
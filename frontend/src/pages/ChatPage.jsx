import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { chatIA } from "../services/auditoriaService.js";
import { listarProjetos } from "../services/projetoService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Brain, Send, FileText, Palette, Network, BookOpen, Calendar, Shield, AlertTriangle, LogOut, User } from "lucide-react";

const sidebarButtons = [
  { label: "Arquivos", icon: FileText },
  { label: "Protótipo", icon: Palette },
  { label: "Diagrama", icon: Network },
  { label: "Documentos", icon: BookOpen },
  { label: "Cronograma", icon: Calendar },
  { label: "RF/NF", icon: Shield },
  { label: "Gestão de Riscos", icon: AlertTriangle },
];

function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projetos, setProjetos] = useState([]);
  const [selectedProjetoId, setSelectedProjetoId] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      remetente: "ia",
      texto: "Olá! Sou a ProjectMind, sua assistente de gestão de projetos. O que você gostaria de criar hoje?",
    },
  ]);
  const endOfChatRef = useRef(null);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        const usuarioId = user?.id || user?.userId;
        const dados = await listarProjetos(usuarioId);
        setProjetos(dados || []);
        if (dados && dados.length > 0) {
          setSelectedProjetoId(dados[0].id.toString());
        }
      } catch (err) {
        console.warn("Sem conexão com o backend ou projetos ainda não criados.", err);
      }
    }
    carregarProjetos();
  }, [user?.id, user?.userId]);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  const handleEnviar = async (e) => {
    e?.preventDefault();
    if (!pergunta.trim() || carregando) return;
    
    // Identifica se é a primeira mensagem enviada pelo usuário no chat
    const jaEnviouAntes = mensagens.some((m) => m.remetente === "usuario");
    const primeiraMensagem = !jaEnviouAntes;

    const userMessage = {
      id: Date.now(),
      remetente: "usuario",
      texto: pergunta,
    };
    
    setMensagens((prev) => [...prev, userMessage]);
    const promptAtual = pergunta;
    setPergunta("");
    setCarregando(true);

    try {
      const res = await chatIA({
        projetoId: selectedProjetoId ? parseInt(selectedProjetoId) : null,
        pergunta: promptAtual,
        primeiraMensagem: primeiraMensagem,
      });

      const textoResposta = res?.resposta || "Não recebi uma resposta válida da IA.";

      const iaMessage = {
        id: Date.now() + 1,
        remetente: "ia",
        texto: textoResposta || "Não recebi uma resposta válida da IA.",
      };
      setMensagens((prev) => [...prev, iaMessage]);
    } catch (err) {
      console.error(err);
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remetente: "ia",
          texto: "Desculpe, ocorreu um erro ao se comunicar com a IA Gemini no backend.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  const handleSidebarClick = (label) => {
    const textoSimulado = `Gostaria de adicionar recursos sobre: ${label}`;
    setMensagens((prev) => [...prev, { id: Date.now(), remetente: "usuario", texto: textoSimulado }]);
    
    setTimeout(() => {
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remetente: "ia",
          texto: `Entendido! Vou auxiliar você na estruturação do módulo de ${label} para o seu projeto selecionado.`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header com botões de navegação idênticos ao protótipo */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate("/projetos")}
            className="flex items-center gap-3 cursor-pointer group"
            title="Ir para a página inicial (Meus Projetos)"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">ProjectMind</h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedProjetoId}
              onChange={(e) => setSelectedProjetoId(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none"
            >
              <option value="">Selecione um Projeto Contexto</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            <button
              onClick={() => navigate("/projetos")}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Meus Projetos
            </button>
            {selectedProjetoId && (
              <button
                onClick={() => navigate(`/projetos/${selectedProjetoId}/analise`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
              >
                Ver Análise Completa
              </button>
            )}
            <div
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-200 group"
              title="Meu Perfil - Editar informações e excluir conta"
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
      </header>

      {/* Corpo principal dividido com a Sidebar Lateral Direita do Protótipo */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col bg-gray-50/50">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.remetente === "usuario" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                      msg.remetente === "usuario"
                        ? "bg-slate-900 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.remetente === "ia" && (
                      <div className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1.5">
                        <Brain className="h-4 w-4" /> ProjectMind
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.texto}</p>
                  </div>
                </div>
              ))}
              {carregando && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-3 text-sm text-gray-500 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-xs font-medium">Assistente processando...</span>
                  </div>
                </div>
              )}
              <div ref={endOfChatRef} />
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <form onSubmit={handleEnviar} className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                disabled={carregando}
              />
              <button
                type="submit"
                disabled={carregando || !pergunta.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 text-sm transition flex items-center justify-center shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>

        {/* Sidebar Lateral Direita "Adicionar ao Projeto" exatamente como no Protótipo */}
        <aside className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden lg:block flex-shrink-0">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
            Adicionar ao Projeto
          </h2>
          <div className="space-y-2">
            {sidebarButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  onClick={() => handleSidebarClick(btn.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition text-left shadow-2xs"
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ChatPage;
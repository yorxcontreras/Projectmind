import { useState, useEffect, useRef } from "react";
import { chatIA } from "../services/auditoriaService.js";
import { listarProjetos } from "../services/projetoService.js";

function ChatPage() {
  const [projetos, setProjetos] = useState([]);
  const [selectedProjetoId, setSelectedProjetoId] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      remetente: "ia",
      texto: "Olá! Sou a assistente IA do ProjectMind integrada ao Gemini. Selecione um projeto ou faça uma pergunta direta sobre cronograma, riscos ou arquitetura!",
    },
  ]);

  const endOfChatRef = useRef(null);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        const dados = await listarProjetos();
        setProjetos(dados || []);
        if (dados && dados.length > 0) {
          setSelectedProjetoId(dados[0].id.toString());
        }
      } catch (err) {
        console.warn("Sem conexão com o backend ou projetos ainda não criados.", err);
      }
    }
    carregarProjetos();
  }, []);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  const handleEnviar = async (e) => {
    e?.preventDefault();
    if (!pergunta.trim() || carregando) return;

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
      });

      const iaMessage = {
        id: Date.now() + 1,
        remetente: "ia",
        texto: res?.resposta || "Não recebi uma resposta válida da IA.",
      };

      setMensagens((prev) => [...prev, iaMessage]);
    } catch (err) {
      console.error(err);
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remetente: "ia",
          texto: "Desculpe, ocorreu um erro ao se comunicar com a IA Gemini no backend. Verifique a conexão.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              Assistente Gemini IA
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">ProjectMind Intelligence Engine</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">Projeto Contexto:</label>
            <select
              value={selectedProjetoId}
              onChange={(e) => setSelectedProjetoId(e.target.value)}
              className="bg-slate-800 text-white text-sm border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="">Nenhum (Geral)</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50 min-h-[380px]">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.remetente === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                  msg.remetente === "usuario"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {msg.remetente === "ia" && (
                  <div className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                    ✨ Gemini IA
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.texto}</p>
              </div>
            </div>
          ))}

          {carregando && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3 text-sm text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2 text-xs">Consultando a IA...</span>
              </div>
            </div>
          )}

          <div ref={endOfChatRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Digite sua dúvida sobre o projeto, riscos ou cronograma..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            disabled={carregando}
          />
          <button
            type="submit"
            disabled={carregando || !pergunta.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl px-6 py-3 text-sm transition focus:outline-none"
          >
            Enviar
          </button>
        </form>

      </div>
    </div>
  );
}

export default ChatPage;
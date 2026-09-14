function ChatPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Assistente IA</h1>

      <div className="border rounded-lg p-6">
        <p className="mb-4">
          Olá! Sou o assistente do ProjectMind.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua pergunta..."
            className="flex-1 border rounded-lg p-3"
          />

          <button className="bg-black text-white rounded-lg px-5">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
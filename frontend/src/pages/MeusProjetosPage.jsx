import { useNavigate } from "react-router-dom";

function MeusProjetosPage() {
  const navigate = useNavigate();

  const projetos = [
    {
      id: 1,
      nome: "Sistema de E-commerce",
      progresso: 72,
      saude: 86,
      sugestoes: 3,
    },
    {
      id: 2,
      nome: "Migração Cloud AWS",
      progresso: 48,
      saude: 74,
      sugestoes: 5,
    },
    {
      id: 3,
      nome: "App Mobile Delivery",
      progresso: 35,
      saude: 68,
      sugestoes: 7,
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Projetos</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e acompanhe seus projetos.
          </p>
        </div>

        <button
          onClick={() => navigate("/chat")}
          className="bg-black text-white px-5 py-3 rounded-lg"
        >
          Assistente IA
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projetos.map((projeto) => (
          <div
            key={projeto.id}
            className="border rounded-xl p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{projeto.nome}</h2>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso</span>
                <span>{projeto.progresso}%</span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-black rounded-full"
                  style={{ width: `${projeto.progresso}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-between text-sm">
              <span>Saúde</span>
              <strong>{projeto.saude}/100</strong>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {projeto.sugestoes} sugestões da IA
            </div>

            <button
              onClick={() => navigate(`/projetos/${projeto.id}`)}
              className="mt-6 w-full border rounded-lg py-2"
            >
              Abrir projeto
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MeusProjetosPage;
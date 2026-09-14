import { useNavigate, useParams } from "react-router-dom";

function ProjetoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/projetos")}
          className="text-sm underline mb-4"
        >
          ← Meus Projetos
        </button>

        <h1 className="text-3xl font-bold">Sistema de E-commerce</h1>
        <p className="text-gray-500 mt-1">Projeto #{id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Saúde do projeto</p>
          <p className="text-4xl font-bold mt-2">86/100</p>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Progresso</p>
          <p className="text-4xl font-bold mt-2">72%</p>
        </div>

        <div className="border rounded-xl p-6">
          <p className="text-gray-500">Riscos ativos</p>
          <p className="text-4xl font-bold mt-2">4</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="border rounded-lg px-5 py-3">
          Dashboard
        </button>

        <button className="border rounded-lg px-5 py-3">
          Tarefas
        </button>

        <button className="border rounded-lg px-5 py-3">
          Riscos
        </button>

        <button className="border rounded-lg px-5 py-3">
          IA Feedback
        </button>

        <button className="border rounded-lg px-5 py-3">
          Lições
        </button>

        <button
          onClick={() => navigate(`/projetos/${id}/analise`)}
          className="bg-black text-white rounded-lg px-5 py-3"
        >
          Análise Completa
        </button>
      </div>
    </div>
  );
}

export default ProjetoPage;
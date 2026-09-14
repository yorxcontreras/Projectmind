import { useNavigate } from "react-router-dom";

function CadastroPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">Criar conta</h1>
        <p className="mb-6">Cadastre-se no ProjectMind</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg p-3 bg-black text-white"
          >
            Cadastrar
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-sm underline"
        >
          Voltar para login
        </button>
      </div>
    </div>
  );
}

export default CadastroPage;
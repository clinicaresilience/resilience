export default function Inicio() {
  return (
    <div className="w-full min-h-screen flex flex-col pt-24">
      {/* Conteúdo principal */}
      <main
        className="
          flex flex-col items-center sm:items-start
          w-full max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          gap-8 flex-1
          overflow-y-auto py-8
        "
      >
        {/* Exemplo de seção */}
        <section className="w-full text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Bem-vindo à Clínica Resilience
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base lg:text-lg">
            Aqui você pode gerenciar agendamentos de forma prática e rápida.
          </p>
        </section>
      </main>

      {/* Rodapé */}
      <footer
        className="
          w-full bg-white shadow-inner
          flex flex-col sm:flex-row
          items-center justify-center sm:justify-between
          gap-4 px-4 sm:px-6 lg:px-8 py-6
          text-sm text-gray-500
        "
      >
        <span>© 2025 Clínica Resilience</span>
        <nav className="flex gap-4">
          <a href="#" className="hover:text-[var(--color-azul-medio)]">
            Termos
          </a>
          <a href="#" className="hover:text-[var(--color-azul-medio)]">
            Privacidade
          </a>
          <a href="#" className="hover:text-[var(--color-azul-medio)]">
            Contato
          </a>
        </nav>
      </footer>
    </div>
  );
}

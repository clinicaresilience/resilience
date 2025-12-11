export const ROUTES = {
  admin: {
    root: "/painel-administrativo",
    profissionais: "/painel-administrativo/profissionais",
    pacientes: "/painel-administrativo/pacientes",
    consultas: "/painel-administrativo/consultas",
    relatorios: "/painel-administrativo/relatorios",
  },
  professional: {
    root: "/tela-profissional",
    consultas: "/tela-profissional/consultas",
    pacientes: "/tela-profissional/pacientes",
    prontuarios: "/tela-profissional/prontuarios",
    agenda: "/tela-profissional/agenda",
    estatisticas: "/tela-profissional/estatisticas",
  },
  user: {
    root: "/tela-usuario",
    agendamentos: "/tela-usuario/agendamentos",
    perfil: "/tela-usuario/perfil",
    historico: "/tela-usuario/historico",
    recursos: "/tela-usuario/recursos",
    contato: "/tela-usuario/contato",
  },
  public: {
    home: "/",
    portalPublico: "/portal-publico",
  },
  auth: {
    login: "/auth/login",
    cadastro: "/auth/cadastro",
    forgot: "/auth/forgot-password",
    updatePassword: "/auth/update-password",
    signUpSuccess: "/auth/sign-up-success",
    error: "/auth/error",
  },
} as const;

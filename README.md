# 🏥 Clínica Resilience - Sistema de Gestão Médica

Sistema completo de gestão para clínicas médicas, desenvolvido com Next.js 14, TypeScript e Supabase. Oferece funcionalidades abrangentes para administradores, profissionais de saúde e pacientes.

## 📋 Funcionalidades Principais

### 🎯 Dashboard Administrativo
- **Métricas em Tempo Real**: Número de profissionais cadastrados, pacientes atendidos, total de agendamentos
- **Análises Detalhadas**: Taxa de comparecimento, cancelamentos, performance por profissional
- **Pacientes Únicos**: Controle do número real de pacientes atendidos por cada profissional
- **Estatísticas Avançadas**: Tendências, avaliações de performance e comparações

### 👥 Gestão de Usuários
- **Criação de Usuários pelo Admin**: Interface dedicada para cadastro de profissionais
- **Geração Automática de Senhas**: Sistema seguro de senhas temporárias
- **Primeiro Acesso Obrigatório**: Troca de senha mandatória no primeiro login
- **Controle de Acesso**: Ativação/desativação de usuários pelo administrador
- **Formulário Completo**: Nome, área, especialização, email e senha automática

### 🏢 Cadastro de Empresas Parceiras
- **Empresas Parceiras**: Sistema para cadastro de empresas conveniadas
- **Códigos Únicos**: Cada empresa possui um código único obrigatório
- **Validação de Agendamentos**: Pacientes devem informar código da empresa para agendar
- **Empresas Padrão**: ACME Saúde (ACME123) e Globex Corp (GLOBEX456)

### 📋 Gestão de Prontuários
- **Hierarquia Completa**: Admin → Profissionais → Pacientes → Prontuários
- **Acesso Total**: Administrador visualiza todos os prontuários
- **Busca Avançada**: Por paciente, profissional, diagnóstico ou tipo de consulta
- **Histórico Detalhado**: Atendimentos realizados e prontuários vinculados
- **Edição e Criação**: Interface completa para gerenciar prontuários médicos

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)
- **Validação**: Zod, React Hook Form
- **Icons**: Lucide React

## 📁 Estrutura do Projeto

```
src/
├── app/                          # App Router (Next.js 14)
│   ├── auth/                     # Páginas de autenticação
│   ├── painel-administrativo/    # Painel do administrador
│   ├── tela-profissional/        # Área do profissional
│   ├── tela-usuario/             # Área do paciente
│   └── api/                      # API Routes
├── components/                   # Componentes React
│   ├── admin/                    # Componentes administrativos
│   ├── professional/             # Componentes do profissional
│   ├── ui/                       # Componentes de UI reutilizáveis
│   └── layout/                   # Layouts da aplicação
├── lib/                          # Utilitários e configurações
│   └── mocks/                    # Dados mock para desenvolvimento
├── features/                     # Features organizadas por domínio
│   ├── auth/                     # Autenticação
│   └── navigation/               # Navegação
└── types/                        # Definições de tipos TypeScript
```

## 🔐 Tipos de Usuário

### 👨‍💼 Administrador
- Dashboard completo com métricas
- Gestão de usuários e profissionais
- Cadastro de empresas parceiras
- Acesso a todos os prontuários
- Análises detalhadas por profissional
- Controle de agendas e calendários

### 👨‍⚕️ Profissional
- Visualização de suas consultas
- Gestão de pacientes atendidos
- Criação e edição de prontuários
- Histórico de atendimentos
- Agenda pessoal

### 👤 Paciente/Usuário
- Agendamento de consultas
- Visualização de agendamentos
- Histórico pessoal
- Perfil e configurações

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/clinica-resilience.git
cd clinica-resilience
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

### 4. Execute o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📊 Funcionalidades Detalhadas

### Dashboard Administrativo
- **Métricas Principais**: Profissionais cadastrados, pacientes únicos, total de agendamentos
- **Status de Agendamentos**: Confirmadas, pendentes, canceladas, concluídas
- **Performance por Profissional**: Taxa de comparecimento, cancelamento, pacientes únicos
- **Ranking de Performance**: Classificação dos profissionais por diversos critérios

### Sistema de Empresas
- **Validação Obrigatória**: Código de empresa necessário para agendamentos
- **Gestão Completa**: Cadastro, ativação/desativação de empresas
- **Integração com API**: Validação automática nos endpoints de agendamento

### Prontuários Médicos
- **Busca Inteligente**: Por paciente, profissional, diagnóstico
- **Filtros Avançados**: Por status (ativo, em andamento, arquivado)
- **Visualização Detalhada**: Modal com informações completas
- **Histórico por Paciente**: Agrupamento de consultas por paciente

## 🔒 Segurança

- **Autenticação Robusta**: Supabase Auth com JWT
- **Autorização por Roles**: Administrador, Profissional, Usuário
- **Validação de Dados**: Zod para validação de schemas
- **Proteção de Rotas**: Middleware de autenticação
- **Senhas Seguras**: Geração automática e troca obrigatória

## 🎨 Interface do Usuário

- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Tema Consistente**: Paleta de cores azul profissional
- **Componentes Reutilizáveis**: shadcn/ui para consistência
- **Navegação Intuitiva**: Sidebar e header adaptativos
- **Feedback Visual**: Loading states, toasts, badges de status

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- **Desktop**: Interface completa com sidebar
- **Tablet**: Layout adaptativo com navegação otimizada
- **Mobile**: Interface mobile-first com menu hambúrguer

## 🧪 Dados de Teste

O sistema inclui dados mock para desenvolvimento:
- **Usuários**: Administradores, profissionais e pacientes de exemplo
- **Agendamentos**: Consultas com diferentes status
- **Prontuários**: Histórico médico simulado
- **Empresas**: ACME Saúde e Globex Corp pré-cadastradas

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting com ESLint
npm run type-check   # Verificação de tipos TypeScript
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@clinica-resilience.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: [www.clinica-resilience.com](https://www.clinica-resilience.com)

---

**Desenvolvido com ❤️ para a Clínica Resilience**

*Sistema completo de gestão médica - Transformando o cuidado em saúde através da tecnologia*

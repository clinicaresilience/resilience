# 🏥 Clínica Resilience - Sistema de Gestão Clínica

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.56-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

Sistema completo de gestão para clínica, desenvolvido com tecnologias modernas para oferecer uma experiência excepcional para administradores, profissionais de saúde e pacientes.

## 📋 Visão Geral

A **Clínica Resilience** é uma plataforma abrangente que digitaliza e otimiza todos os processos de uma clínica moderna. Desde o agendamento online até a gestão completa de prontuários , o sistema oferece ferramentas poderosas para melhorar a eficiência operacional e a experiência do paciente.

### 🎯 Principais Benefícios

- **Para Pacientes**: Agendamento 24/7, histórico completo de consultas, comunicação direta com profissionais
- **Para Profissionais**: Gestão eficiente de agenda, acesso rápido a prontuários, análises de performance
- **Para Administradores**: Visão completa da operação, métricas em tempo real, controle total do sistema

---

## 🚀 Tecnologias Utilizadas

### Core Framework
- **Next.js 15.5.0** - Framework React com App Router
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 5.0** - Tipagem estática para JavaScript

### Backend & Banco de Dados
- **Supabase** - Plataforma backend-as-a-service
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Autenticação e autorização

### UI/UX & Styling
- **Tailwind CSS 4.0** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis
- **Radix UI** - Primitivos UI headless
- **Lucide React** - Ícones modernos
- **Framer Motion** - Animações

### Desenvolvimento & Qualidade
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Zod** - Validação de schemas
- **React Hook Form** - Gerenciamento de formulários

### Outras Bibliotecas
- **Zustand** - Gerenciamento de estado
- **React Big Calendar** - Calendário interativo
- **Moment.js** - Manipulação de datas
- **clsx** - Utilitários CSS condicionais

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                     # Rotas de autenticação
│   ├── painel-administrativo/    # Dashboard administrador
│   ├── tela-profissional/        # Área do profissional
│   ├── tela-usuario/             # Portal do paciente
│   ├── portal-publico/           # Página pública
│   └── api/                      # API Routes
├── components/                   # Componentes React
│   ├── admin/                    # Componentes administrativos
│   ├── professional/             # Componentes profissionais
│   ├── user/                     # Componentes do usuário
│   ├── ui/                       # Componentes base
│   ├── auth/                     # Componentes de auth
│   └── layout/                   # Layouts
├── features/                     # Features por domínio
│   ├── auth/                     # Lógica de autenticação
│   └── navigation/               # Navegação
├── lib/                          # Utilitários e configurações
│   ├── client.ts                 # Cliente Supabase (browser)
│   ├── server.ts                 # Cliente Supabase (server)
│   ├── utils.ts                  # Funções utilitárias
│   └── mocks/                    # Dados mock
├── services/                     # Serviços de negócio
│   └── database/                 # Serviços de banco
├── types/                        # Definições TypeScript
├── config/                       # Configurações
└── utils/                        # Utilitários específicos
```

### Padrões Arquiteturais

- **App Router**: Roteamento baseado em arquivos do Next.js 14+
- **Server Components**: Componentes server-first quando possível
- **API Routes**: Endpoints RESTful para operações CRUD
- **Service Layer**: Lógica de negócio separada em serviços
- **Type Safety**: Tipagem completa com TypeScript
- **Atomic Design**: Componentes organizados por complexidade

---

## 👥 Sistema de Usuários

### Tipos de Usuário

#### 👨‍💼 Administrador
**Permissões**: Controle total do sistema
- Dashboard com métricas completas
- Gestão de usuários e profissionais
- Cadastro de empresas parceiras
- Acesso irrestrito a prontuários
- Análises avançadas por profissional
- Configuração de agendas

#### 👨‍⚕️ Profissional de Saúde
**Permissões**: Gestão de pacientes e consultas
- Visualização de consultas agendadas
- Gestão de pacientes atendidos
- Criação e edição de prontuários
- Agenda pessoal personalizável
- Estatísticas de performance

#### 👤 Paciente (Usuário Comum)
**Permissões**: Acesso pessoal aos serviços
- Agendamento de consultas online
- Visualização de histórico 
- Perfil pessoal editável
- Comunicação com profissionais
- Portal público informativo

### Fluxo de Autenticação

1. **Cadastro**: Usuários podem se cadastrar via formulário público
2. **Primeiro Acesso**: Senha temporária gerada automaticamente
3. **Troca Obrigatória**: Primeiro login requer alteração de senha
4. **Controle de Acesso**: Administrador pode ativar/desativar usuários
5. **Recuperação**: Sistema de reset de senha via email

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255),
  tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('administrador', 'profissional', 'comum')),
  especialidade VARCHAR(255),
  telefone VARCHAR(20),
  data_nascimento DATE,
  ativo BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `agendamentos`
```sql
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES usuarios(id),
  profissional_id UUID NOT NULL REFERENCES usuarios(id),
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  modalidade VARCHAR(20) NOT NULL DEFAULT 'presencial' CHECK (modalidade IN ('presencial', 'online')),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado', 'concluido')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `consultas`
```sql
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id),
  paciente_id UUID NOT NULL REFERENCES usuarios(id),
  profissional_id UUID NOT NULL REFERENCES usuarios(id),
  diagnostico TEXT,
  tratamento TEXT,
  observacoes TEXT,
  status_consulta VARCHAR(20) DEFAULT 'em_andamento' CHECK (status_consulta IN ('em_andamento', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `prontuarios`
```sql
CREATE TABLE prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES usuarios(id),
  profissional_id UUID NOT NULL REFERENCES usuarios(id),
  consulta_id UUID REFERENCES consultas(id),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'consulta' CHECK (tipo IN ('consulta', 'exame', 'procedimento', 'observacao')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado', 'deletado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `empresas`
```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `agenda_profissional`
```sql
CREATE TABLE agenda_profissional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES usuarios(id),
  configuracao JSONB NOT NULL,
  slots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relacionamentos

```
usuarios (1) ──── (N) agendamentos
usuarios (1) ──── (N) consultas
usuarios (1) ──── (N) prontuarios
agendamentos (1) ──── (1) consultas
consultas (1) ──── (N) prontuarios
usuarios (1) ──── (1) agenda_profissional
```

---

## 🔌 API Endpoints

### Autenticação

#### `GET /api/auth/user`
- **Descrição**: Obtém dados do usuário autenticado
- **Autenticação**: Bearer Token
- **Resposta**: Dados do usuário atual

### Agendamentos

#### `GET /api/agendamentos`
- **Descrição**: Lista agendamentos do usuário
- **Parâmetros Query**:
  - `status`: Filtrar por status
  - `data_inicio`: Data inicial
  - `data_fim`: Data final
- **Resposta**: Lista de agendamentos formatados

#### `POST /api/agendamentos`
- **Descrição**: Cria novo agendamento
- **Body**:
  ```json
  {
    "profissional_id": "uuid",
    "data_consulta": "2024-01-15T10:00:00Z",
    "modalidade": "presencial|online",
    "local": "Clínica Resilience",
    "notas": "Observações opcionais"
  }
  ```

#### `PATCH /api/agendamentos/[id]`
- **Descrição**: Cancela agendamento
- **Body**:
  ```json
  {
    "justificativa": "Motivo do cancelamento"
  }
  ```

### Profissionais

#### `GET /api/profissionais`
- **Descrição**: Lista todos os profissionais
- **Resposta**: Lista de profissionais com especialidades

#### `POST /api/profissionais`
- **Descrição**: Cria novo profissional
- **Body**: Dados completos do profissional

#### `GET /api/profissionais/agenda`
- **Descrição**: Obtém agenda do profissional
- **Resposta**: Slots disponíveis e agendamentos

### Consultas

#### `GET /api/consultas`
- **Descrição**: Lista consultas do profissional
- **Resposta**: Consultas com dados do paciente

#### `POST /api/consultas`
- **Descrição**: Registra nova consulta
- **Body**: Dados da consulta 

#### `GET /api/consultas/pacientes-atendidos`
- **Descrição**: Lista pacientes atendidos
- **Resposta**: Estatísticas por paciente

### Prontuários

#### `GET /api/prontuarios`
- **Descrição**: Lista prontuários
- **Parâmetros Query**:
  - `paciente_id`: ID do paciente
  - `profissional_id`: ID do profissional
  - `status`: Status do prontuário

#### `POST /api/prontuarios`
- **Descrição**: Cria novo prontuário
- **Body**: Dados do prontuário 

### Empresas

#### `GET /api/empresas`
- **Descrição**: Lista empresas parceiras
- **Resposta**: Empresas ativas com códigos

#### `POST /api/empresas`
- **Descrição**: Cadastra nova empresa
- **Body**: Dados da empresa

---

## 📊 Funcionalidades Detalhadas

### Dashboard Administrativo

#### 📈 Métricas em Tempo Real
- **Total de Profissionais**: Contagem de profissionais ativos
- **Pacientes Únicos**: Número real de pacientes atendidos
- **Total de Agendamentos**: Soma de todos os agendamentos
- **Taxa de Comparecimento**: Percentual de consultas realizadas
- **Taxa de Cancelamento**: Percentual de agendamentos cancelados

#### 📊 Análises por Profissional
- **Performance Individual**: Métricas específicas por profissional
- **Ranking de Desempenho**: Classificação baseada em múltiplos critérios
- **Tendências**: Evolução temporal das métricas
- **Comparativos**: Análise entre profissionais

### Sistema de Agendamentos

#### 🗓️ Calendário Inteligente
- **Disponibilidade Automática**: Baseada na agenda do profissional
- **Validação de Conflitos**: Prevenção de agendamentos simultâneos
- **Slots Dinâmicos**: Horários gerados automaticamente
- **Exceções**: Dias especiais e feriados

#### 📱 Modalidades de Consulta
- **Presencial**: Consultas na clínica
- **Online**: Telemedicina integrada
- **Validação**: Verificação de disponibilidade por modalidade

### Gestão de Prontuários

#### 📋 Estrutura Hierárquica
- **Admin**: Acesso irrestrito a todos os prontuários
- **Profissional**: Acesso aos prontuários de seus pacientes
- **Paciente**: Acesso apenas aos próprios prontuários

#### 🔍 Busca Avançada
- **Por Paciente**: Histórico completo do paciente
- **Por Profissional**: Consultas realizadas pelo profissional
- **Por Diagnóstico**: Busca por termos 
- **Por Tipo**: Consulta, exame, procedimento, observação

### Portal do Paciente

#### 👤 Perfil Pessoal
- **Dados Cadastrais**: Informações pessoais editáveis
- **Histórico**: Todas as consultas realizadas
- **Agendamentos**: Visualização e gerenciamento
- **Preferências**: Configurações personalizadas

#### 📅 Agendamento Online
- **Seleção de Profissional**: Por especialidade ou nome
- **Calendário Visual**: Interface intuitiva para escolha de data/hora
- **Confirmação Imediata**: Feedback instantâneo
- **Lembretes**: Notificações automáticas

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Node.js**: 18.0 ou superior
- **npm/yarn/pnpm**: Gerenciador de pacotes
- **Conta Supabase**: Para banco de dados e autenticação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/clinica-resilience.git
cd clinica-resilience
```

### 2. Instale as Dependências

```bash
# Com npm
npm install

# Com yarn
yarn install

# Com pnpm
pnpm install
```

### 3. Configure as Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico

# Database URLs (opcional, para desenvolvimento local)
DATABASE_URL=postgresql://user:password@localhost:5432/clinica_resilience

# JWT Secret (para desenvolvimento local)
JWT_SECRET=sua-chave-secreta-jwt

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Application Settings
NEXT_PUBLIC_APP_NAME=Clínica Resilience
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o Banco de Dados

#### Opção A: Supabase (Recomendado)

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Execute o script SQL em `supabase/migrations/` para criar as tabelas
3. Configure as políticas RLS (Row Level Security)
4. Atualize as variáveis de ambiente com suas credenciais

#### Opção B: PostgreSQL Local

```bash
# Instalar PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS com Homebrew
brew install postgresql

# Iniciar serviço
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Criar banco de dados
createdb clinica_resilience

# Executar migrations
psql -d clinica_resilience -f database/schema.sql
```

### 5. Execute o Servidor de Desenvolvimento

```bash
# Com npm
npm run dev

# Com yarn
yarn dev

# Com pnpm
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento com Turbopack
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run preview      # Preview do build

# Qualidade de Código
npm run lint         # Executar ESLint
npm run lint:fix     # Corrigir problemas de linting
npm run type-check   # Verificar tipos TypeScript

# Banco de Dados
npm run db:generate  # Gerar tipos do banco (se usar Prisma)
npm run db:push      # Aplicar mudanças no banco
npm run db:studio    # Interface gráfica do banco

# Testes
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Relatório de cobertura

# Utilitários
npm run clean        # Limpar cache e node_modules
npm run format       # Formatar código com Prettier
```

---

## 🔐 Segurança

### Autenticação e Autorização

- **Supabase Auth**: Sistema robusto de autenticação
- **JWT Tokens**: Tokens seguros para sessões
- **Row Level Security**: Controle de acesso a nível de linha
- **Middleware**: Proteção de rotas no Next.js

### Validação de Dados

- **Zod Schemas**: Validação de entrada de dados
- **TypeScript**: Tipagem estática para prevenir erros
- **Sanitização**: Limpeza de dados de entrada
- **Rate Limiting**: Controle de frequência de requisições

### Boas Práticas de Segurança

- **HTTPS Only**: Comunicação criptografada
- **CSRF Protection**: Proteção contra ataques CSRF
- **XSS Prevention**: Sanitização de conteúdo
- **SQL Injection**: Prevenção com prepared statements
- **Password Hashing**: Hash seguro de senhas

---

## 🎨 Interface do Usuário

### Design System

#### Paleta de Cores
```css
/* Cores Principais */
--azul-escuro: #1e40af;
--azul-medio: #3b82f6;
--azul-claro: #dbeafe;

/* Estados */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* Neutras */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-900: #111827;
```

#### Tipografia
- **Fonte Principal**: Geist Sans
- **Fonte Mono**: Geist Mono
- **Tamanhos**: Sistema de escala consistente
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Componentes UI

#### Componentes Base
- **Button**: Botões com variantes (primary, secondary, outline, ghost)
- **Input**: Campos de entrada com validação
- **Select**: Dropdowns acessíveis
- **Card**: Containers com sombra e bordas
- **Modal**: Diálogos modais responsivos

#### Componentes Complexos
- **DataTable**: Tabelas com paginação e filtros
- **Calendar**: Calendário interativo para agendamentos
- **Charts**: Gráficos para dashboards
- **Forms**: Formulários complexos com validação

### Responsividade

#### Breakpoints
```css
/* Mobile First */
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

#### Grid System
- **Container**: Máximo 1280px de largura
- **Columns**: Sistema de 12 colunas
- **Gaps**: Espaçamentos consistentes

---

## 📱 Responsividade

### Mobile-First Design

O sistema é desenvolvido com abordagem mobile-first, garantindo experiência otimizada em todos os dispositivos:

#### 📱 Mobile (< 640px)
- **Navegação**: Menu hambúrguer inferior
- **Layout**: Interface vertical, cards empilhados
- **Toques**: Botões maiores para melhor usabilidade
- **Tipografia**: Tamanhos otimizados para leitura

#### 📟 Tablet (640px - 1024px)
- **Navegação**: Sidebar colapsível
- **Layout**: Grid responsivo, 2 colunas
- **Interação**: Toques e cliques balanceados

#### 💻 Desktop (> 1024px)
- **Navegação**: Sidebar completa sempre visível
- **Layout**: Grid de 3+ colunas, uso total do espaço
- **Produtividade**: Múltiplas janelas e atalhos

### Progressive Enhancement

- **Core Functionality**: Funciona em qualquer dispositivo
- **Enhanced Features**: Funcionalidades avançadas para dispositivos modernos
- **Performance**: Otimização automática baseada no dispositivo

---

## 🧪 Testes e Qualidade

### Estratégia de Testes

#### Unitários
```bash
npm run test:unit
```
- **Componentes**: Testes de renderização e interações
- **Utilitários**: Funções puras e helpers
- **Serviços**: Lógica de negócio isolada

#### Integração
```bash
npm run test:integration
```
- **API Routes**: Endpoints e middlewares
- **Database**: Queries e transações
- **Auth Flow**: Fluxos completos de autenticação

#### E2E (End-to-End)
```bash
npm run test:e2e
```
- **User Journeys**: Fluxos completos do usuário
- **Critical Paths**: Funcionalidades essenciais
- **Cross-browser**: Compatibilidade de navegadores

### Ferramentas de Teste

- **Jest**: Framework de testes
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes E2E
- **MSW**: Mock de APIs
- **Testing Library**: Utilitários de teste

### Cobertura de Testes

```bash
npm run test:coverage
```

**Meta de Cobertura**:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 85%+
- **Lines**: 80%+

---

## 🚀 Deploy e Produção

### Vercel (Recomendado)

#### Configuração Automática
```bash
npm install -g vercel
vercel --prod
```

#### Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### Environment Variables
Configure as variáveis de produção no painel da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Outras Plataformas

#### Netlify
```bash
npm run build
netlify deploy --prod --dir .next
```

#### Railway
```bash
railway login
railway link
railway up
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔧 Desenvolvimento

### Padrões de Código

#### TypeScript
- **Strict Mode**: Configurado para máxima segurança de tipos
- **Interface Segregation**: Interfaces específicas por contexto
- **Generic Types**: Uso de generics para reutilização
- **Type Guards**: Funções para verificação de tipos

#### Componentes React
```tsx
// Exemplo de componente bem estruturado
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  loading?: boolean;
}

export function UserCard({ user, onEdit, loading }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.nome}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => onEdit?.(user)}
          disabled={loading}
        >
          Editar
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### API Routes
```ts
// Estrutura padrão para API Routes
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Lógica da API
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

### Git Workflow

#### Branches
```
main          # Branch de produção
develop       # Branch de desenvolvimento
feature/*     # Novas funcionalidades
bugfix/*      # Correções de bugs
hotfix/*      # Correções urgentes
```

#### Commits
```bash
# Formato: tipo(escopo): descrição
feat(auth): adicionar login social
fix(agendamento): corrigir validação de data
docs(readme): atualizar documentação da API
```

#### Pull Requests
- **Template**: Descrição detalhada das mudanças
- **Reviews**: Aprovação obrigatória de pelo menos 1 reviewer
- **Tests**: Todos os testes devem passar
- **Linting**: Código deve estar formatado

---

## 📊 Monitoramento e Analytics

### Métricas de Performance

#### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### Métricas de Aplicação
- **Uptime**: 99.9% SLA
- **Response Time**: < 500ms para APIs
- **Error Rate**: < 1%
- **User Satisfaction**: > 4.5/5

### Ferramentas de Monitoramento

#### Vercel Analytics
```ts
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

#### Sentry (Error Tracking)
```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### LogRocket (Session Replay)
```ts
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro: "Module not found"
```bash
# Limpar cache do Next.js
rm -rf .next
npm run dev
```

#### Erro: "TypeScript errors"
```bash
# Verificar tipos
npm run type-check

# Gerar tipos do Supabase
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

#### Erro: "Database connection failed"
```bash
# Verificar variáveis de ambiente
cat .env.local

# Testar conexão com Supabase
npx supabase db ping
```

#### Erro: "Build failed"
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar build
npm run build
```

### Debug Mode

#### Desenvolvimento
```bash
# Debug do Next.js
DEBUG=* npm run dev

# Debug do Supabase
SUPABASE_DEBUG=true npm run dev
```

#### Produção
```bash
# Logs da aplicação
vercel logs

# Logs do Supabase
supabase logs
```

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/clinica-resilience.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adicionar nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### Guidelines

#### Código
- Seguir os padrões estabelecidos no projeto
- Manter cobertura de testes > 80%
- Documentar funções complexas
- Usar TypeScript strict mode

#### Commits
```bash
# Formato padrão
type(scope): description

# Tipos aceitos
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
style:    formatação
refactor: refatoração
test:     testes
chore:    manutenção
```

#### Pull Requests
- **Título**: Descrição clara da mudança
- **Descrição**: Explicação detalhada do que foi implementado
- **Screenshots**: Para mudanças visuais
- **Tests**: Incluir testes relevantes
- **Breaking Changes**: Documentar mudanças que quebram compatibilidade

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```text
MIT License

Copyright (c) 2024 Clínica Resilience

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Suporte e Contato

### Canais de Suporte

#### 🐛 Issues no GitHub
Para bugs e solicitações de funcionalidades:
- [GitHub Issues](https://github.com/seu-usuario/clinica-resilience/issues)

#### 📧 Email
Para questões gerais e suporte técnico:
- **Suporte**: suporte@clinica-resilience.com

#### 📱 WhatsApp
Para contato direto:
- **WhatsApp**: (11) 99999-9999

#### 🌐 Website
Para mais informações:
- **Website**: [www.clinica-resilience.com](https://www.clinica-resilience.com)

---

## 🙏 Agradecimentos

Agradecemos a todas as pessoas que contribuíram para este projeto:

- **Equipe de Desenvolvimento**: Pelos esforços incansáveis
- **Profissionais de Saúde**: Pela expertise e feedback valioso
- **Comunidade Open Source**: Pelas ferramentas e bibliotecas utilizadas
- **Usuários**: Pelo apoio e confiança no sistema

---

**Desenvolvido com ❤️ para a Clínica Resilience**

*Sistema completo de gestão psicológica - Transformando o cuidado em saúde através da tecnologia*

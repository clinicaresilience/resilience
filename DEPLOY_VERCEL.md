# Deploy na Vercel - Clínica Resilience

## Pré-requisitos
- Conta na Vercel
- Projeto no GitHub (recomendado)
- Variáveis de ambiente do Supabase

## Passos para Deploy

### 1. Preparação do Código
O projeto já está configurado com:
- `vercel.json` - Configurações otimizadas para Next.js 15
- Scripts de build atualizados no `package.json`
- Configurações de segurança no header

### 2. Configurar Variáveis de Ambiente na Vercel
No painel da Vercel, adicione as seguintes variáveis de ambiente:

```
NEXT_PUBLIC_PROJECT_ID=xozjufubqqtrawmwlhkm
NEXT_PUBLIC_PROJECT_URL=https://xozjufubqqtrawmwlhkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[sua_service_role_key]
```

### 3. Deploy via GitHub (Recomendado)
1. Faça commit e push das alterações para o GitHub
2. Conecte o repositório na Vercel
3. A Vercel detectará automaticamente as configurações Next.js
4. O deploy será automático a cada push na branch principal

### 4. Deploy via Vercel CLI (Alternativa)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 5. Configurações Importantes
- **Framework**: Next.js (detectado automaticamente)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x (recomendado)

### 6. Domínio Personalizado (Opcional)
1. No painel da Vercel, vá para Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções da Vercel

## Verificações Pós-Deploy

### Checklist de Funcionalidades
- [ ] Login/Autenticação funcionando
- [ ] Conexão com Supabase estabelecida
- [ ] Agendamentos carregando corretamente
- [ ] Upload de imagens funcionando
- [ ] Middleware de autenticação ativo

### Monitoramento
- Verificar logs em tempo real no dashboard da Vercel
- Monitorar performance com Vercel Analytics
- Configurar alertas para erros críticos

## Troubleshooting

### Build Failures
- Verificar se todas as variáveis de ambiente estão configuradas
- Revisar logs de build no dashboard da Vercel
- Executar `npm run build` localmente para debug

### Problemas de Conexão com Supabase
- Confirmar que as keys do Supabase estão corretas
- Verificar se o projeto Supabase está ativo
- Checar configurações de CORS no Supabase

### Performance
- O projeto usa Turbopack em desenvolvimento
- Em produção, Next.js otimiza automaticamente
- Considerar ativar ISR (Incremental Static Regeneration) para páginas dinâmicas

## Comandos Úteis

```bash
# Verificar tipos TypeScript
npm run typecheck

# Executar lint
npm run lint

# Build local para teste
npm run build

# Iniciar servidor de produção local
npm run start
```

## Segurança

- **NUNCA** commitar o arquivo `.env` com as chaves reais
- Use `.env.example` como template
- Configure as variáveis de ambiente diretamente na Vercel
- Mantenha o `SUPABASE_SERVICE_ROLE_KEY` seguro

## Contato e Suporte
Para problemas específicos do deploy, consulte:
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
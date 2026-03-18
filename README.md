# Banco Automático - SaaS de Automação de Crédito Consignado

Este é um sistema completo e pronto para produção para automação do processo de vendas de crédito consignado.

## 🚀 Tecnologias

- **Frontend:** Next.js 14+ (App Router)
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Backend:** Next.js API Routes / Node.js
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **IA:** OpenAI API (GPT-3.5-Turbo)
- **Animações:** Framer Motion

## 🧩 Funcionalidades

1. **Captura de Leads:** Landing page moderna com formulário de simulação.
2. **CRM Pipeline:** Visualização Kanban para gestão de leads por etapas.
3. **Lead Scoring:** Pontuação automática baseada em interações e perfil.
4. **Chatbot IA:** Atendimento automático via OpenAI integrado ao histórico do lead.
5. **Simulador de Crédito:** Lógica de negócio completa (margem de 35%, limites de idade).
6. **Geração de Propostas:** API para geração dinâmica de propostas e envio automático.
7. **Contratação Digital:** Fluxo de assinatura e simulação de pagamento via PIX.
8. **Dashboard:** Métricas em tempo real, funil de conversão e análise de receita.

## ⚙️ Configuração Local

1. **Clone o repositório:**
   ```bash
   git clone <repo-url>
   cd Banco
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env.local` baseado no `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Preencha com suas credenciais do **Supabase** e **OpenAI**.

4. **Prepare o Banco de Dados:**
   Execute o script SQL contido em `supabase/schema.sql` no Editor SQL do seu projeto Supabase.

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🌍 Implantação no Netlify

1.  **Conecte seu Repositório**: No painel do Netlify, selecione "Import from git" e escolha este repositório.
2.  **Configurações de Build**:
    - **Build Command**: `npm run build`
    - **Publish directory**: `.next`
3.  **Variáveis de Ambiente**: No Netlify, vá em `Site settings > Environment variables` e adicione:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `OPENAI_API_KEY`
    - `NEXT_PUBLIC_APP_URL` (URL do seu site no Netlify)

O arquivo `netlify.toml` já está configurado para usar o plugin oficial do Next.js.

## 🧱 Estrutura de Pastas

- `/src/app/landing`: Landing page pública.
- `/src/app/dashboard`: Área restrita do agente.
- `/src/app/api`: Endpoints de backend (IA, Propostas, Contratos).
- `/src/lib`: Lógica de negócio, clientes Supabase e OpenAI.
- `/supabase`: Scripts de schema e migrations.

## 🎯 Próximos Passos

- [ ] Implementar integração real com API de WhatsApp (ex: Twilio, WPPConnect).
- [ ] Configurar Webhooks para automações externas.
- [ ] Adicionar geração real de PDFs com `jspdf` no frontend ou `puppeteer` no backend.

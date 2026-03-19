import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we are using placeholder values
export const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (isMockMode) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. The app will run in MOCK MODE.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeadProfile = 'clt' | 'servidor_publico' | 'aposentado_pensionista';
export type LeadStage =
  | 'Captacao'
  | 'Qualificacao'
  | 'ContatoInicial'
  | 'PropostaEnviada'
  | 'Agendamento'
  | 'Contratado'
  | 'Perdido';
export type FintechPartner = 'V8' | 'PRESENCA';

export type DemoSeller = {
  id: string;
  name: string;
};

export type DemoInteraction = {
  id: string;
  type: 'whatsapp' | 'email' | 'call' | 'proposal' | 'note';
  title: string;
  body?: string;
  createdAt: string;
};

export type DemoLead = {
  id: string;
  name: string;
  phone: string;
  salary: number;
  age: number;
  loanAmount: number;
  score: number;
  stage: LeadStage;
  profile: LeadProfile;
  source: string;
  sellerId: string;
  fintechInterest: FintechPartner;
  createdAt: string;
  lastInteractionAt: string;
  appointmentAt?: string;
  hasSimulated: boolean;
  hasContracted: boolean;
  lostReason?: 'nao_respondeu' | 'nao_tinha_margem' | 'nao_gostou_taxa' | 'desistiu';
  interactions: DemoInteraction[];
};

export type DemoState = {
  version: 2;
  generatedAt: string;
  seed: number;
  sellers: DemoSeller[];
  leads: DemoLead[];
};

const DEMO_STORAGE_KEY = 'demo_state_v2';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeRandom(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

function pickOne<T>(rand: () => number, items: readonly T[]) {
  return items[Math.floor(rand() * items.length)];
}

function makeId(prefix: string, rand: () => number) {
  return `${prefix}_${Math.floor(rand() * 1e9).toString(16)}_${Date.now().toString(16)}`;
}

function toISO(d: Date) {
  return d.toISOString();
}

function daysAgoISO(days: number, rand: () => number) {
  const minutes = Math.floor(rand() * 24 * 60);
  return toISO(new Date(Date.now() - days * 24 * 60 * 60 * 1000 - minutes * 60 * 1000));
}

function buildInteractions(rand: () => number, leadName: string, profile: LeadProfile, stage: LeadStage) {
  const now = new Date();
  const interactions: DemoInteraction[] = [];
  const count = 2 + Math.floor(rand() * 5);
  for (let i = 0; i < count; i++) {
    const type = pickOne(rand, ['whatsapp', 'email', 'call', 'note', 'proposal'] as const);
    const createdAt = toISO(new Date(now.getTime() - (count - i) * (2 + Math.floor(rand() * 8)) * 60 * 60 * 1000));
    const title =
      type === 'proposal'
        ? 'Proposta gerada'
        : type === 'whatsapp'
          ? 'WhatsApp enviado'
          : type === 'email'
            ? 'E-mail disparado'
            : type === 'call'
              ? 'Ligação realizada'
              : 'Anotação interna';
    const body =
      type === 'proposal'
        ? `Simulação pronta para ${leadName}. Perfil: ${profile}. Etapa: ${stage}.`
        : type === 'whatsapp'
          ? `Olá ${leadName}, vi sua simulação. Posso te ajudar a seguir?`
          : type === 'email'
            ? `Assunto: Sua simulação de consignado`
            : type === 'call'
              ? `Tentativa de contato no horário comercial.`
              : `Lead com bom potencial, acompanhar retorno.`;
    interactions.push({ id: makeId('evt', rand), type, title, body, createdAt });
  }
  return interactions.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function generateDemoState(options?: { seed?: number; leadCount?: number }) {
  const seed = options?.seed ?? Date.now();
  const leadCount = options?.leadCount ?? 18;
  const rand = safeRandom(seed);

  const sellers: DemoSeller[] = [
    { id: 'seller_joana', name: 'Joana' },
    { id: 'seller_carlos', name: 'Carlos' },
    { id: 'seller_marina', name: 'Marina' },
    { id: 'seller_pedro', name: 'Pedro' },
  ];

  const profiles: LeadProfile[] = ['clt', 'servidor_publico', 'aposentado_pensionista'];
  const sources = ['Facebook Ads', 'Google Ads', 'Orgânico', 'Indicação', 'TikTok', 'Parceiro'];
  const fintechs: FintechPartner[] = ['V8', 'PRESENCA'];
  const stagePool: LeadStage[] = ['Captacao', 'Qualificacao', 'ContatoInicial', 'PropostaEnviada', 'Agendamento', 'Contratado', 'Perdido'];

  const leads: DemoLead[] = Array.from({ length: leadCount }).map((_, idx) => {
    const profile = pickOne(rand, profiles);
    const stage = pickOne(rand, stagePool);
    const seller = pickOne(rand, sellers);
    const fintechInterest = pickOne(rand, fintechs);
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda', 'Roberto', 'Juliana', 'Paulo', 'Camila', 'Rafael', 'Patrícia'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Mendes', 'Lima', 'Pereira', 'Almeida', 'Gomes'];
    const name = `${pickOne(rand, firstNames)} ${pickOne(rand, lastNames)}`;
    const phone = `(11) 9${Math.floor(1000 + rand() * 9000)}-${Math.floor(1000 + rand() * 9000)}`;
    const salary = Math.floor(1800 + rand() * 12000);
    const age = Math.floor(23 + rand() * 48);
    const loanAmount = Math.floor(2000 + rand() * 60000);
    const score = Math.floor(40 + rand() * 60);
    const createdAt = daysAgoISO(1 + Math.floor(rand() * 14), rand);
    const hasSimulated = stage !== 'Captacao';
    const hasContracted = stage === 'Contratado';
    const lastInteractionAt = daysAgoISO(Math.floor(rand() * 4), rand);
    const appointmentAt =
      stage === 'Agendamento'
        ? toISO(new Date(Date.now() + (1 + Math.floor(rand() * 6)) * 60 * 60 * 1000))
        : undefined;
    const lostReason =
      stage === 'Perdido'
        ? pickOne(rand, ['nao_respondeu', 'nao_tinha_margem', 'nao_gostou_taxa', 'desistiu'] as const)
        : undefined;

    const interactions = buildInteractions(rand, name, profile, stage);

    return {
      id: `lead_${idx + 1}_${Math.floor(rand() * 1e8).toString(16)}`,
      name,
      phone,
      salary,
      age,
      loanAmount,
      score,
      stage,
      profile,
      source: pickOne(rand, sources),
      sellerId: seller.id,
      fintechInterest,
      createdAt,
      lastInteractionAt,
      appointmentAt,
      hasSimulated,
      hasContracted,
      lostReason,
      interactions,
    };
  });

  return {
    version: 2 as const,
    generatedAt: new Date().toISOString(),
    seed,
    sellers,
    leads,
  };
}

export function getDemoState(): DemoState | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed || parsed.version !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setDemoState(next: DemoState) {
  if (!canUseStorage()) return;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
}

export function ensureDemoState() {
  const existing = getDemoState();
  if (existing) return existing;
  const created = generateDemoState();
  setDemoState(created);
  return created;
}

export function resetDemoState(options?: { seed?: number; leadCount?: number }) {
  const next = generateDemoState(options);
  setDemoState(next);
  return next;
}

export function updateDemoLead(leadId: string, patch: Partial<DemoLead>) {
  const state = ensureDemoState();
  const leads = state.leads.map((l) => (l.id === leadId ? { ...l, ...patch } : l));
  const next = { ...state, leads };
  setDemoState(next);
  return next;
}

export function moveDemoLeadStage(leadId: string, stage: LeadStage) {
  const state = ensureDemoState();
  const leads = state.leads.map((l) => {
    if (l.id !== leadId) return l;
    const hasContracted = stage === 'Contratado' ? true : l.hasContracted;
    const lostReason = stage === 'Perdido' ? l.lostReason ?? 'nao_respondeu' : undefined;
    return { ...l, stage, hasContracted, lostReason };
  });
  const next = { ...state, leads };
  setDemoState(next);
  return next;
}

export function upsertDemoLeadFromLanding(input: {
  name: string;
  phone: string;
  salary: number;
  age: number;
  loanAmount: number;
  profile: LeadProfile;
  source?: string;
  fintechInterest?: FintechPartner;
}) {
  const state = ensureDemoState();
  const rand = safeRandom(state.seed + state.leads.length + 17);
  const seller = pickOne(rand, state.sellers);
  const fintechInterest = input.fintechInterest ?? pickOne(rand, ['V8', 'PRESENCA'] as const);
  const stage: LeadStage = input.profile === 'clt' ? 'PropostaEnviada' : 'ContatoInicial';
  const now = new Date();
  const leadId = makeId('lead', rand);
  const interactions = [
    {
      id: makeId('evt', rand),
      type: 'proposal' as const,
      title: 'Simulação gerada',
      body: `Simulação criada na landing. Perfil: ${input.profile}.`,
      createdAt: now.toISOString(),
    },
  ];
  const lead: DemoLead = {
    id: leadId,
    name: input.name,
    phone: input.phone,
    salary: input.salary,
    age: input.age,
    loanAmount: input.loanAmount,
    score: Math.floor(55 + rand() * 40),
    stage,
    profile: input.profile,
    source: input.source ?? 'Landing',
    sellerId: seller.id,
    fintechInterest,
    createdAt: now.toISOString(),
    lastInteractionAt: now.toISOString(),
    appointmentAt: input.profile === 'servidor_publico' ? toISO(new Date(now.getTime() + 24 * 60 * 60 * 1000)) : undefined,
    hasSimulated: true,
    hasContracted: false,
    lostReason: undefined,
    interactions,
  };

  const next: DemoState = { ...state, leads: [lead, ...state.leads] };
  setDemoState(next);
  return lead;
}

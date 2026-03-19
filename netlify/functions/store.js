const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join('/tmp', 'banco-demo-store.json');

function nowISO() {
  return new Date().toISOString();
}

function safeRandom(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

function pickOne(rand, items) {
  return items[Math.floor(rand() * items.length)];
}

function makeId(prefix, rand) {
  return `${prefix}_${Math.floor(rand() * 1e9).toString(16)}_${Date.now().toString(16)}`;
}

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) return null;
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store), 'utf8');
  return store;
}

function ensureStore() {
  const existing = readStore();
  if (existing) return existing;
  const seed = Date.now();
  const base = {
    version: 1,
    createdAt: nowISO(),
    seed,
    sellers: [
      { id: 'seller_joana', name: 'Joana', email: 'joana@demo.com' },
      { id: 'seller_carlos', name: 'Carlos', email: 'carlos@demo.com' },
      { id: 'seller_marina', name: 'Marina', email: 'marina@demo.com' },
      { id: 'seller_pedro', name: 'Pedro', email: 'pedro@demo.com' },
    ],
    leads: [],
    proposals: [],
    automations: {
      welcomeEmail: { id: 'welcomeEmail', name: 'E-mail Boas-vindas (D+0)', active: true, sent: 0 },
      stageStuckContatoInicial: { id: 'stageStuckContatoInicial', name: 'Lead parado em Contato Inicial (D+2)', active: true, sent: 0 },
      cltNoContract: { id: 'cltNoContract', name: 'CLT simulou e não contratou (D+1)', active: true, sent: 0 },
      appointmentReminder: { id: 'appointmentReminder', name: 'Servidor com agendamento (1h antes)', active: false, sent: 0 },
    },
  };
  base.leads = generateLeads(seed, base.sellers, 18);
  return writeStore(base);
}

function stageLabel(stage) {
  switch (stage) {
    case 'Captacao':
      return 'Captação';
    case 'Qualificacao':
      return 'Qualificação';
    case 'ContatoInicial':
      return 'Contato Inicial';
    case 'PropostaEnviada':
      return 'Proposta Enviada';
    case 'Agendamento':
      return 'Agendamento';
    case 'Contratado':
      return 'Contratado';
    case 'Perdido':
      return 'Perdido';
    default:
      return stage;
  }
}

function defaultInteractions(rand, lead) {
  const interactions = [];
  interactions.push({
    id: makeId('evt', rand),
    type: 'note',
    title: 'Lead criado',
    body: `Lead criado via ${lead.source}. Perfil: ${lead.profile}.`,
    createdAt: lead.createdAt,
  });

  return interactions;
}

function scheduleWelcomeEmail(rand) {
  const welcomeAt = new Date(Date.now() + 60 * 1000).toISOString();
  return {
    id: makeId('evt', rand),
    type: 'email',
    title: 'E-mail de boas-vindas (agendado +1min)',
    body: `Envio agendado para ${welcomeAt}.`,
    createdAt: welcomeAt,
    status: 'scheduled',
  };
}

function listAutomations(automations) {
  return Object.keys(automations).map((k) => automations[k]);
}

function ensureSeller(store, email) {
  if (!email) return null;
  const existing = store.sellers.find((s) => s.email === email);
  if (existing) return existing;
  const baseName = String(email).split('@')[0] || 'Vendedor';
  const seller = {
    id: `seller_${baseName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(16)}`,
    name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
    email,
  };
  store.sellers.push(seller);
  return seller;
}

function ensureVendorHasLeads(store, sellerEmail) {
  if (!sellerEmail) return;
  const hasAny = store.leads.some((l) => l.sellerEmail === sellerEmail);
  if (hasAny) return;

  ensureSeller(store, sellerEmail);

  const seed = Array.from(String(sellerEmail)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + (store.seed || 0);
  const rand = safeRandom(seed);
  const candidates = store.leads.filter((l) => l.sellerEmail && l.sellerEmail.endsWith('@demo.com'));
  const takeCount = Math.min(5, candidates.length);
  for (let i = 0; i < takeCount; i++) {
    const idx = Math.floor(rand() * candidates.length);
    const chosen = candidates.splice(idx, 1)[0];
    if (!chosen) continue;
    chosen.sellerEmail = sellerEmail;
    chosen.sellerId = `seller_${sellerEmail}`;
  }
}

function generateLeads(seed, sellers, count) {
  const rand = safeRandom(seed);
  const profiles = ['clt', 'servidor_publico', 'aposentado_pensionista'];
  const sources = ['Facebook Ads', 'Google Ads', 'Orgânico', 'Indicação', 'TikTok', 'Parceiro'];
  const fintechs = ['V8', 'PRESENCA'];
  const stages = ['Captacao', 'Qualificacao', 'ContatoInicial', 'PropostaEnviada', 'Agendamento', 'Contratado', 'Perdido'];
  const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda', 'Roberto', 'Juliana', 'Paulo', 'Camila', 'Rafael', 'Patrícia'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Mendes', 'Lima', 'Pereira', 'Almeida', 'Gomes'];

  const leads = [];
  for (let i = 0; i < count; i++) {
    const seller = pickOne(rand, sellers);
    const profile = pickOne(rand, profiles);
    const stage = pickOne(rand, stages);
    const name = `${pickOne(rand, firstNames)} ${pickOne(rand, lastNames)}`;
    const phone = `(11) 9${Math.floor(1000 + rand() * 9000)}-${Math.floor(1000 + rand() * 9000)}`;
    const salary = Math.floor(1800 + rand() * 12000);
    const age = Math.floor(23 + rand() * 48);
    const loanAmount = Math.floor(2000 + rand() * 60000);
    const score = Math.floor(40 + rand() * 60);
    const createdAt = new Date(Date.now() - (1 + Math.floor(rand() * 14)) * 24 * 60 * 60 * 1000).toISOString();
    const lastInteractionAt = new Date(Date.now() - Math.floor(rand() * 4) * 24 * 60 * 60 * 1000).toISOString();
    const appointmentAt = stage === 'Agendamento' ? new Date(Date.now() + (1 + Math.floor(rand() * 72)) * 60 * 60 * 1000).toISOString() : null;
    const lostReason = stage === 'Perdido' ? pickOne(rand, ['nao_respondeu', 'nao_tinha_margem', 'nao_gostou_taxa', 'desistiu']) : null;
    const fintechInterest = pickOne(rand, fintechs);

    const lead = {
      id: `lead_${i + 1}_${Math.floor(rand() * 1e8).toString(16)}`,
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
      sellerEmail: seller.email,
      fintechInterest,
      createdAt,
      lastInteractionAt,
      appointmentAt,
      hasSimulated: stage !== 'Captacao',
      hasContracted: stage === 'Contratado',
      lostReason,
      interactions: [],
    };

    lead.interactions = defaultInteractions(rand, lead);
    leads.push(lead);
  }

  return leads;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  const store = ensureStore();
  const qs = event.queryStringParameters || {};
  const entity = qs.entity || '';
  const id = qs.id || '';
  const leadId = qs.leadId || '';
  const sellerEmail = qs.sellerEmail || '';

  if (event.httpMethod === 'POST' && entity === 'reset') {
    const seed = Date.now();
    store.seed = seed;
    store.leads = generateLeads(seed, store.sellers, 18);
    store.proposals = [];
    for (const k of Object.keys(store.automations)) {
      store.automations[k].sent = 0;
    }
    writeStore(store);
    return json(200, { ok: true, seed });
  }

  if (event.httpMethod === 'GET' && entity === 'state') {
    return json(200, { ok: true, state: store });
  }

  if (entity === 'automations') {
    if (event.httpMethod === 'GET') {
      return json(200, { ok: true, automations: listAutomations(store.automations) });
    }

    if (event.httpMethod === 'PATCH') {
      if (!id) return json(400, { error: 'Missing automation id' });
      if (!store.automations[id]) return json(404, { error: 'Automation not found' });
      let patch = {};
      try {
        patch = event.body ? JSON.parse(event.body) : {};
      } catch {
        patch = {};
      }
      if (typeof patch.active === 'boolean') {
        store.automations[id].active = patch.active;
      } else {
        store.automations[id].active = !store.automations[id].active;
      }
      writeStore(store);
      return json(200, { ok: true, automations: listAutomations(store.automations) });
    }
  }

  if (entity === 'leads') {
    if (event.httpMethod === 'GET') {
      if (id) {
        const lead = store.leads.find((l) => l.id === id);
        if (!lead) return json(404, { error: 'Lead not found' });
        const proposal = store.proposals.find((p) => p.leadId === id) || null;
        return json(200, { ok: true, lead, proposal });
      }
      if (sellerEmail) {
        ensureVendorHasLeads(store, sellerEmail);
        writeStore(store);
      }
      const leads = sellerEmail ? store.leads.filter((l) => l.sellerEmail === sellerEmail) : store.leads;
      return json(200, { ok: true, leads });
    }

    if (event.httpMethod === 'POST') {
      let payload = {};
      try {
        payload = event.body ? JSON.parse(event.body) : {};
      } catch {
        payload = {};
      }
      const rand = safeRandom(store.seed + store.leads.length + 17);
      const seller = payload.sellerEmail
        ? ensureSeller(store, payload.sellerEmail) || pickOne(rand, store.sellers)
        : pickOne(rand, store.sellers);
      const profile = payload.profile || 'aposentado_pensionista';
      const stage = payload.stage || 'Captacao';
      const fintechInterest = payload.fintechInterest || pickOne(rand, ['V8', 'PRESENCA']);

      const lead = {
        id: makeId('lead', rand),
        name: payload.name || 'Lead Demo',
        phone: payload.phone || '(11) 90000-0000',
        salary: Number(payload.salary || 5000),
        age: Number(payload.age || 45),
        loanAmount: Number(payload.loanAmount || payload.loan_amount || 10000),
        score: Math.floor(55 + rand() * 40),
        stage,
        profile,
        source: payload.source || 'Landing',
        sellerId: seller.id,
        sellerEmail: seller.email,
        fintechInterest,
        createdAt: nowISO(),
        lastInteractionAt: nowISO(),
        appointmentAt: null,
        hasSimulated: true,
        hasContracted: false,
        lostReason: null,
        interactions: [],
      };
      lead.interactions = defaultInteractions(rand, lead);
      if (store.automations.welcomeEmail?.active) {
        lead.interactions.push(scheduleWelcomeEmail(rand));
        store.automations.welcomeEmail.sent += 1;
      }
      store.leads.unshift(lead);
      writeStore(store);
      return json(200, { ok: true, lead });
    }

    if (event.httpMethod === 'PATCH') {
      let patch = {};
      try {
        patch = event.body ? JSON.parse(event.body) : {};
      } catch {
        patch = {};
      }
      const lead = store.leads.find((l) => l.id === id);
      if (!lead) return json(404, { error: 'Lead not found' });

      if (typeof patch.stage === 'string') {
        lead.stage = patch.stage;
        if (patch.stage === 'Contratado') lead.hasContracted = true;
      }

      if (typeof patch.appointmentAt === 'string') {
        lead.appointmentAt = patch.appointmentAt;
        lead.stage = 'Agendamento';
      }

      if (patch.interaction) {
        lead.interactions = lead.interactions || [];
        lead.interactions.push({
          id: `evt_${Date.now().toString(16)}_${Math.floor(Math.random() * 1e6).toString(16)}`,
          ...patch.interaction,
        });
      }

      lead.lastInteractionAt = nowISO();
      writeStore(store);
      return json(200, { ok: true, lead });
    }
  }

  if (entity === 'proposals') {
    if (event.httpMethod === 'GET') {
      if (id) {
        const proposal = store.proposals.find((p) => p.id === id);
        if (!proposal) return json(404, { error: 'Proposal not found' });
        const lead = store.leads.find((l) => l.id === proposal.leadId) || null;
        return json(200, { ok: true, proposal, lead });
      }
      if (leadId) {
        const proposal = store.proposals.find((p) => p.leadId === leadId) || null;
        return json(200, { ok: true, proposal });
      }
      return json(400, { error: 'Missing id or leadId' });
    }

    if (event.httpMethod === 'POST') {
      let payload = {};
      try {
        payload = event.body ? JSON.parse(event.body) : {};
      } catch {
        payload = {};
      }

      const lead = store.leads.find((l) => l.id === payload.leadId);
      if (!lead) return json(404, { error: 'Lead not found' });

      const seed = Array.from(String(lead.id)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + Math.floor(lead.loanAmount);
      const rand = safeRandom(seed);
      const partner = lead.fintechInterest || pickOne(rand, ['V8', 'PRESENCA']);
      const installments = lead.profile === 'clt' ? pickOne(rand, [12, 18, 24, 30, 36]) : pickOne(rand, [48, 60, 72, 84]);
      const nominalRateMonthly = lead.profile === 'clt' ? 2.15 : lead.profile === 'servidor_publico' ? 1.45 : 1.55;

      const proposal = {
        id: makeId('prop', rand),
        leadId: lead.id,
        partner,
        nominalRateMonthly,
        installments,
        createdAt: nowISO(),
        contractUrl: `/contract/${lead.id}`,
        status: 'pre_approved',
      };

      store.proposals = store.proposals.filter((p) => p.leadId !== lead.id);
      store.proposals.unshift(proposal);

      lead.stage = 'PropostaEnviada';
      lead.hasSimulated = true;
      lead.lastInteractionAt = nowISO();
      lead.interactions = lead.interactions || [];
      lead.interactions.push({
        id: makeId('evt', rand),
        type: 'proposal',
        title: 'Proposta gerada',
        body: `Link: ${proposal.contractUrl} | ${partner} | ${nominalRateMonthly}% a.m. | ${installments}x`,
        createdAt: nowISO(),
      });

      writeStore(store);
      return json(200, { ok: true, proposal, lead });
    }
  }

  return json(400, { error: 'Unsupported request' });
};

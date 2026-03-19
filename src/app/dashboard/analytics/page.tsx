'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowDownRight,
  Filter,
  Download,
  Clock,
  Target,
  MousePointer2
} from 'lucide-react';
import { storeGetState, type DemoLead, type DemoSeller } from '@/lib/supabase';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const conversionData = [
  { name: 'Captação', value: 1245 },
  { name: 'Qualificação', value: 850 },
  { name: 'Atendimento', value: 420 },
  { name: 'Simulação', value: 180 },
  { name: 'Contratação', value: 42 },
];

const sourceData = [
  { name: 'Facebook Ads', value: 450, roi: '3.2x' },
  { name: 'Google Ads', value: 320, roi: '2.8x' },
  { name: 'Orgânico', value: 210, roi: '--' },
  { name: 'Indicação', value: 120, roi: '5.1x' },
];

const responseTimeData = [
  { time: '08:00', avg: 12 },
  { time: '10:00', avg: 18 },
  { time: '12:00', avg: 25 },
  { time: '14:00', avg: 15 },
  { time: '16:00', avg: 10 },
  { time: '18:00', avg: 8 },
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [storeState, setStoreState] = useState<{ sellers: DemoSeller[]; leads: DemoLead[] } | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    const timer = setTimeout(() => setLoading(false), 1000);
    const storageTimer = setTimeout(() => {
      storeGetState()
        .then((res) => setStoreState({ sellers: res.state.sellers, leads: res.state.leads as DemoLead[] }))
        .catch(() => setStoreState(null));
    }, 0);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(storageTimer);
    };
  }, []);

  const demoLeads = useMemo(() => storeState?.leads ?? [], [storeState]);
  const demoSellers = useMemo(() => storeState?.sellers ?? [], [storeState]);

  const profileData = useMemo(() => {
    const counts = demoLeads.reduce(
      (acc, l) => {
        acc[l.profile] = (acc[l.profile] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return [
      { name: 'CLT', value: counts.clt ?? 0 },
      { name: 'Servidor', value: counts.servidor_publico ?? 0 },
      { name: 'Aposentado', value: counts.aposentado_pensionista ?? 0 },
    ];
  }, [demoLeads]);

  const conversionByProfile = useMemo(() => {
    const base = {
      clt: { total: 0, contracted: 0 },
      servidor_publico: { total: 0, contracted: 0 },
      aposentado_pensionista: { total: 0, contracted: 0 },
    };
    for (const l of demoLeads) {
      base[l.profile].total += 1;
      if (l.hasContracted) base[l.profile].contracted += 1;
    }
    return [
      { name: 'CLT', conversion: base.clt.total ? Math.round((base.clt.contracted / base.clt.total) * 100) : 0 },
      { name: 'Servidor', conversion: base.servidor_publico.total ? Math.round((base.servidor_publico.contracted / base.servidor_publico.total) * 100) : 0 },
      { name: 'Aposentado', conversion: base.aposentado_pensionista.total ? Math.round((base.aposentado_pensionista.contracted / base.aposentado_pensionista.total) * 100) : 0 },
    ];
  }, [demoLeads]);

  const appointments = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endToday = startToday + 24 * 60 * 60 * 1000;
    const endWeek = startToday + 7 * 24 * 60 * 60 * 1000;
    let today = 0;
    let week = 0;
    for (const l of demoLeads) {
      if (!l.appointmentAt) continue;
      const t = new Date(l.appointmentAt).getTime();
      if (t >= startToday && t < endToday) today += 1;
      if (t >= startToday && t < endWeek) week += 1;
    }
    return { today, week };
  }, [demoLeads]);

  const sellerPerformance = useMemo(() => {
    const bySeller = new Map<string, { name: string; contracted: number; total: number }>();
    for (const s of demoSellers) bySeller.set(s.id, { name: s.name, contracted: 0, total: 0 });
    for (const l of demoLeads) {
      const entry = bySeller.get(l.sellerId) ?? { name: l.sellerId, contracted: 0, total: 0 };
      entry.total += 1;
      if (l.hasContracted) entry.contracted += 1;
      bySeller.set(l.sellerId, entry);
    }
    return Array.from(bySeller.values()).sort((a, b) => b.contracted - a.contracted);
  }, [demoLeads, demoSellers]);

  const lossReasons = useMemo(() => {
    const counts = demoLeads.reduce(
      (acc, l) => {
        if (!l.lostReason) return acc;
        acc[l.lostReason] = (acc[l.lostReason] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const label = (key: string) => {
      switch (key) {
        case 'nao_respondeu':
          return 'Não respondeu';
        case 'nao_tinha_margem':
          return 'Sem margem';
        case 'nao_gostou_taxa':
          return 'Não gostou da taxa';
        case 'desistiu':
          return 'Desistiu';
        default:
          return key;
      }
    };
    return Object.keys(counts)
      .map((k) => ({ key: k, label: label(k), value: counts[k] }))
      .sort((a, b) => b.value - a.value);
  }, [demoLeads]);

  if (!mounted || loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Gerando Relatórios...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Performance</h1>
          <p className="text-gray-500 font-medium mt-1">Métricas detalhadas do funil e eficiência comercial.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Período
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Download className="w-4 h-4" />
            Exportar BI
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta Mensal</p>
              <p className="text-xl font-black text-gray-900">84% Atingida</p>
            </div>
          </div>
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-[84%]"></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-all">
              <MousePointer2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo por Lead</p>
              <p className="text-xl font-black text-gray-900">R$ 14,20</p>
            </div>
          </div>
          <p className="text-xs text-green-600 font-bold flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            -8% em relação ao mês anterior
          </p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo de Fechamento</p>
              <p className="text-xl font-black text-gray-900">4.2 dias</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
            Média de mercado: 7 dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-2">Funil de Conversão</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">Eficiência por etapa</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={conversionData}
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'black', fill: '#94a3b8'}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 12, 12, 0]} barSize={40}>
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Area Chart */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-2">Tempo de Resposta (Min)</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">Desempenho ao longo do dia</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Table/Cards */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-10">Desempenho por Origem</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {sourceData.map((source, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-center space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg`} style={{ backgroundColor: COLORS[i] }}>
                  {source.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{source.name}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{source.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Leads Capturados</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ROI: {source.roi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-2">Leads por Perfil</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">CLT vs Servidor vs Aposentado</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={profileData} innerRadius={70} outerRadius={110} paddingAngle={6} dataKey="value">
                  {profileData.map((_, index) => (
                    <Cell key={`p-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-2">Conversão por Perfil</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">% contratados por grupo</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionByProfile}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} domain={[0, 100]} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="conversion" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Agendamentos</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dia e semana</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hoje</p>
              <p className="text-3xl font-black text-blue-900 mt-2">{appointments.today}</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">7 dias</p>
              <p className="text-3xl font-black text-indigo-900 mt-2">{appointments.week}</p>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Motivos de Perda</h4>
            <div className="space-y-3">
              {lossReasons.slice(0, 5).map((r) => (
                <div key={r.key} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">{r.label}</span>
                  <span className="text-xs font-black text-gray-900">{r.value}</span>
                </div>
              ))}
              {lossReasons.length === 0 && (
                <p className="text-xs text-gray-400 font-bold">Sem perdas registradas no demo.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Performance dos Vendedores</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Contratos por agente (mock)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {sellerPerformance.map((s, i) => (
            <div key={`${s.name}-${i}`} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-gray-900">{s.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.total} leads</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.total ? Math.round((s.contracted / s.total) * 100) : 0}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Convertidos</span>
                <span className="text-sm font-black text-green-600">{s.contracted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

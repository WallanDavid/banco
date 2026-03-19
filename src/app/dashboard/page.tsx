'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreVertical,
  ChevronRight,
  Filter,
  Search,
  ArrowRight,
  Zap,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { storeGetLeads, storeReset, type DemoLead, type LeadProfile } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

const chartData = [
  { name: 'Seg', leads: 45, conv: 12 },
  { name: 'Ter', leads: 52, conv: 15 },
  { name: 'Qua', leads: 38, conv: 10 },
  { name: 'Qui', leads: 65, conv: 22 },
  { name: 'Sex', leads: 48, conv: 18 },
  { name: 'Sáb', leads: 24, conv: 8 },
  { name: 'Dom', leads: 15, conv: 4 },
];

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  salary: number;
  score: number;
  status: string;
  source: string;
  created_at: string;
  profile: LeadProfile;
};

function stageLabel(stage: DemoLead['stage']) {
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

function mapDemoLeadToRow(lead: DemoLead): LeadRow {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    salary: lead.salary,
    score: lead.score,
    status: stageLabel(lead.stage),
    source: lead.source,
    created_at: lead.createdAt,
    profile: lead.profile,
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 1245,
    conversionRate: 18.4,
    revenue: 452800.00,
    avgResponseTime: '14 min',
    activeProposals: 42
  });
  
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const storedRole = localStorage.getItem('userRole');
      const storedEmail = localStorage.getItem('userEmail');
      setRole(storedRole);
      setUserEmail(storedEmail);
    }, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin = role === 'admin';

  useEffect(() => {
    async function load() {
      try {
        const sellerEmail = !isAdmin && userEmail ? userEmail : undefined;
        const all = await storeGetLeads({ sellerEmail });
        setLeads(all.map(mapDemoLeadToRow));
      } catch {
        setLeads([]);
      }
    }
    if (!role) return;
    load();
  }, [isAdmin, role, userEmail]);

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || lead.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Carregando Dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPI Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Visão Geral</h1>
          <p className="text-gray-500 font-medium mt-1">Bem-vindo à central de comando, <span className="text-blue-600 font-bold">Agente Master</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                storeReset()
                  .then(() => storeGetLeads({ sellerEmail: !isAdmin && userEmail ? userEmail : undefined }))
                  .then((all) => setLeads(all.map(mapDemoLeadToRow)))
                  .finally(() => setLoading(false));
              }, 1000);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-100"
          >
            Reiniciar Demo
          </button>
          <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold transition-all">Hoje</button>
            <button className="px-4 py-2 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-bold transition-all">Semana</button>
            <button className="px-4 py-2 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-bold transition-all">Mês</button>
          </div>
          <button className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Leads', value: stats.totalLeads, icon: Users, trend: '+12.5%', color: 'blue' },
          { label: 'Taxa de Conversão', value: `${stats.conversionRate}%`, icon: TrendingUp, trend: '+2.1%', color: 'green' },
          { label: 'Receita Prevista', value: `R$ ${(stats.revenue/1000).toFixed(1)}k`, icon: DollarSign, trend: '+5.4%', color: 'indigo' },
          { label: 'Tempo Médio Resposta', value: stats.avgResponseTime, icon: Clock, trend: '-4 min', color: 'amber' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:bg-${kpi.color}-600 group-hover:text-white transition-all`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${kpi.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</h3>
            <p className="text-3xl font-black text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900">Fluxo de Leads</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Volume de entrada vs Conversão</p>
            </div>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-black text-gray-500 focus:ring-0 cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  cursor={{stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="conv" stroke="#10b981" strokeWidth={4} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Pie */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-2">Origem dos Leads</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">ROI por canal</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Facebook', value: 45 },
                    { name: 'Google', value: 30 },
                    { name: 'Orgânico', value: 15 },
                    { name: 'Indicação', value: 10 },
                  ]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {leads.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {[
              { label: 'Facebook Ads', val: '45%', color: 'bg-blue-500' },
              { label: 'Google Ads', val: '30%', color: 'bg-indigo-500' },
              { label: 'Outros', val: '25%', color: 'bg-green-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Section */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Gestão de Leads</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Filtre e gerencie sua carteira</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou fone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 w-full md:w-64 outline-none"
              />
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('Captação')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'Captação' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
              >
                Novos
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lead / Contato</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financeiro</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Origem</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{lead.name}</p>
                        <p className="text-xs font-bold text-gray-400">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900">R$ {lead.salary.toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Renda Mensal</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      lead.status === 'Captação' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      lead.status === 'Contratado' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${lead.score}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-gray-900">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-500">{lead.source}</span>
                  </td>
                  <td className="px-8 py-6">
                    <Link 
                      href={`/dashboard/leads/${lead.id}`}
                      className="p-3 hover:bg-white rounded-xl transition-all flex items-center justify-center group/btn"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover/btn:text-blue-600 group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-lg font-black text-gray-900">Nenhum lead encontrado</h4>
            <p className="text-sm text-gray-400 font-medium">Tente ajustar seus filtros ou busca.</p>
          </div>
        )}

        <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mostrando {filteredLeads.length} de {leads.length} leads totais</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:text-gray-900 transition-all shadow-sm">Anterior</button>
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:text-gray-900 transition-all shadow-sm">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

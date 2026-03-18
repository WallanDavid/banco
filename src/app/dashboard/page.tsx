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
  ChevronRight
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
  Area
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const chartData = [
  { name: 'Seg', leads: 400, conv: 240 },
  { name: 'Ter', leads: 300, conv: 139 },
  { name: 'Qua', leads: 200, conv: 980 },
  { name: 'Qui', leads: 278, conv: 390 },
  { name: 'Sex', leads: 189, conv: 480 },
  { name: 'Sáb', leads: 239, conv: 380 },
  { name: 'Dom', leads: 349, conv: 430 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    revenue: 0,
    activeProposals: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: leads, count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: proposals } = await supabase
          .from('proposals')
          .select('status');

        const { data: contracts } = await supabase
          .from('contracts')
          .select('status');

        setRecentLeads(leads || []);
        setStats({
          totalLeads: totalLeads || 0,
          conversionRate: 12.5, // Mock for now
          revenue: 154200.00, // Mock for now
          activeProposals: proposals?.filter(p => p.status === 'pending').length || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total de Leads', value: stats.totalLeads, icon: Users, trend: '+12%', color: 'blue' },
    { label: 'Taxa de Conversão', value: `${stats.conversionRate}%`, icon: TrendingUp, trend: '+2.4%', color: 'green' },
    { label: 'Receita Prevista', value: `R$ ${stats.revenue.toLocaleString('pt-BR')}`, icon: DollarSign, trend: '+5.1%', color: 'indigo' },
    { label: 'Propostas Ativas', value: stats.activeProposals, icon: CheckCircle, trend: '-3%', color: 'amber' },
  ];

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Vendas</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta, Agente Master.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4" />
            Últimos 7 dias
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
            Novo Relatório
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Performance de Leads</h3>
            <select className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Leads vs Conversões</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Pipeline Atual</h3>
          <div className="space-y-6">
            {[
              { label: 'Novo Lead', count: 45, color: 'blue' },
              { label: 'Qualificado', count: 28, color: 'indigo' },
              { label: 'Proposta', count: 12, color: 'amber' },
              { label: 'Fechado', count: 8, color: 'green' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${item.color}-500 rounded-full`}
                    style={{ width: `${(item.count / 45) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2">
            Ver Pipeline Completo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Leads Recentes</h3>
          <button className="text-sm font-bold text-blue-600 hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Salário</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-all cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    R$ {lead.salary?.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                      Novo Lead
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold text-gray-900">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new RegExp(lead.created_at), 'dd MMM, HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

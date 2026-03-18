'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  ChevronRight,
  Phone,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const MOCK_LEADS = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1111', salary: 5200, score: 85, status: 'Novo Lead', source: 'Facebook Ads', created_at: new Date(Date.now() - 1000*60*30).toISOString() },
  { id: '2', name: 'Maria Santos', phone: '(21) 98888-2222', salary: 7500, score: 92, status: 'Qualificado', source: 'Google Ads', created_at: new Date(Date.now() - 1000*60*120).toISOString() },
  { id: '3', name: 'Pedro Oliveira', phone: '(31) 97777-3333', salary: 3200, score: 65, status: 'Contatado', source: 'Orgânico', created_at: new Date(Date.now() - 1000*60*240).toISOString() },
  { id: '4', name: 'Ana Costa', phone: '(41) 96666-4444', salary: 4800, score: 78, status: 'Proposta Enviada', source: 'Indicação', created_at: new Date(Date.now() - 1000*60*400).toISOString() },
  { id: '5', name: 'Carlos Souza', phone: '(51) 95555-5555', salary: 9000, score: 95, status: 'Fechado Ganho', source: 'Facebook Ads', created_at: new Date(Date.now() - 1000*60*600).toISOString() },
  { id: '6', name: 'Fernanda Lima', phone: '(11) 94444-6666', salary: 6100, score: 82, status: 'Novo Lead', source: 'Facebook Ads', created_at: new Date(Date.now() - 1000*60*800).toISOString() },
  { id: '7', name: 'Roberto Mendes', phone: '(21) 93333-7777', salary: 4200, score: 71, status: 'Qualificado', source: 'Google Ads', created_at: new Date(Date.now() - 1000*60*1000).toISOString() },
  { id: '8', name: 'Juliana Paiva', phone: '(31) 92222-8888', salary: 5500, score: 88, status: 'Contatado', source: 'Orgânico', created_at: new Date(Date.now() - 1000*60*1200).toISOString() },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || lead.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo Lead': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Qualificado': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Contatado': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Proposta Enviada': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Fechado Ganho': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Buscando Leads...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Leads</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie e qualifique seus contatos em tempo real.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'Novo Lead', 'Qualificado', 'Contatado', 'Proposta Enviada', 'Fechado Ganho'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filter === f 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Salário & Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Origem</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
                  <td className="px-8 py-6">
                    <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{lead.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">R$ {lead.salary.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-gray-400">{lead.score} pts</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-medium text-gray-500">{lead.source}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/dashboard/leads/${lead.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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

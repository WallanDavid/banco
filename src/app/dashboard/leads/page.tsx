'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Phone,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { ensureDemoState, type DemoLead } from '@/lib/supabase';

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

function profileLabel(profile: DemoLead['profile']) {
  switch (profile) {
    case 'clt':
      return 'CLT';
    case 'servidor_publico':
      return 'Servidor';
    case 'aposentado_pensionista':
      return 'Aposentado';
    default:
      return profile;
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      const demo = ensureDemoState();
      setLeads(demo.leads);
    }, 0);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || stageLabel(lead.stage) === filter;
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || lead.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Captação': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Qualificação': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Contato Inicial': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Proposta Enviada': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Agendamento': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Contratado': return 'bg-green-50 text-green-600 border-green-100';
      case 'Perdido': return 'bg-rose-50 text-rose-600 border-rose-100';
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
          {['all', 'Captação', 'Qualificação', 'Contato Inicial', 'Proposta Enviada', 'Agendamento', 'Contratado', 'Perdido'].map((f) => (
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </p>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100">
                            {profileLabel(lead.profile)}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                            {lead.fintechInterest === 'V8' ? 'V8' : 'Presença'}
                          </span>
                        </div>
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
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(stageLabel(lead.stage))}`}>
                      {stageLabel(lead.stage)}
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

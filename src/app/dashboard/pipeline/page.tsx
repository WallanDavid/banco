'use client';

import React, { useEffect, useState } from 'react';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  MessageCircle,
  Clock,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  phone: string;
  salary: number;
  loan_amount: number;
  score: number;
  status_id: string;
  created_at: string;
}

interface Pipeline {
  id: string;
  name: string;
  position: number;
  color: string;
}

const MOCK_PIPELINES = [
  { id: '1', name: 'Captação', position: 1, color: '#3b82f6' },
  { id: '2', name: 'Qualificação', position: 2, color: '#8b5cf6' },
  { id: '3', name: 'Atendimento', position: 3, color: '#10b981' },
  { id: '4', name: 'Simulação', position: 4, color: '#f59e0b' },
  { id: '5', name: 'Contratação', position: 5, color: '#ef4444' },
];

const MOCK_LEADS = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1111', salary: 5200, loan_amount: 12000, score: 85, status_id: '1', created_at: new Date().toISOString() },
  { id: '2', name: 'Maria Santos', phone: '(21) 98888-2222', salary: 7500, loan_amount: 25000, score: 92, status_id: '2', created_at: new Date().toISOString() },
  { id: '3', name: 'Pedro Oliveira', phone: '(31) 97777-3333', salary: 3200, loan_amount: 5000, score: 65, status_id: '1', created_at: new Date().toISOString() },
  { id: '4', name: 'Ana Costa', phone: '(41) 96666-4444', salary: 4800, loan_amount: 15000, score: 78, status_id: '3', created_at: new Date().toISOString() },
  { id: '5', name: 'Carlos Souza', phone: '(51) 95555-5555', salary: 9000, loan_amount: 40000, score: 95, status_id: '4', created_at: new Date().toISOString() },
  { id: '6', name: 'Julia Lima', phone: '(61) 94444-6666', salary: 6000, loan_amount: 10000, score: 82, status_id: '5', created_at: new Date().toISOString() },
];

export default function PipelinePage() {
  const [pipelines] = useState<Pipeline[]>(MOCK_PIPELINES);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Carregando Pipeline...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pipeline Comercial</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie a jornada do cliente de ponta a ponta.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar lead no funil..." 
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-10 -mx-6 px-6 scrollbar-hide">
        <div className="flex gap-8 h-full min-w-max">
          {pipelines.map((pipeline) => {
            const columnLeads = leads.filter(l => l.status_id === pipeline.id);
            const totalValue = columnLeads.reduce((acc, curr) => acc + curr.loan_amount, 0);

            return (
              <div key={pipeline.id} className="w-80 flex flex-col bg-gray-50/50 rounded-[32px] border border-gray-100/50">
                {/* Column Header */}
                <div className="p-6 flex flex-col gap-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pipeline.color }} />
                      <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-[0.2em]">{pipeline.name}</h3>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">{columnLeads.length}</span>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</p>
                      <p className="text-xs font-bold text-blue-600">R$ {(totalValue/1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                  {columnLeads.map((lead) => (
                    <Link 
                      href={`/dashboard/leads/${lead.id}`}
                      key={lead.id} 
                      className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:translate-y-[-2px] transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-gray-900 block truncate max-w-[120px]">
                              {lead.name}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {format(new Date(lead.created_at), 'dd MMM')}
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                          lead.score >= 80 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-black">{lead.score}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Solicitado</span>
                          <span className="text-sm font-black text-blue-600">R$ {lead.loan_amount?.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(pipeline.position / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex -space-x-2">
                          {[1, 2].map(i => (
                            <div key={i} className="w-7 h-7 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-400 font-black">
                              AM
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-[10px] font-black">3</span>
                          </div>
                          <div className="flex items-center gap-1.5 group-hover:text-amber-500 transition-colors">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black">2h</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-gray-100" />
                      <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest px-4">Coluna Vazia</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

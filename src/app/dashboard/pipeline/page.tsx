'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageCircle,
  Clock,
  MoreHorizontal,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { storeGetLeads, storeUpdateLead, type DemoLead, type LeadStage } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

type PipelineColumn = {
  id: LeadStage;
  name: string;
  position: number;
  color: string;
};

const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'Captacao', name: 'Captação', position: 1, color: '#3b82f6' },
  { id: 'Qualificacao', name: 'Qualificação', position: 2, color: '#8b5cf6' },
  { id: 'ContatoInicial', name: 'Contato Inicial', position: 3, color: '#f59e0b' },
  { id: 'PropostaEnviada', name: 'Proposta Enviada', position: 4, color: '#7c3aed' },
  { id: 'Agendamento', name: 'Agendamento', position: 5, color: '#06b6d4' },
  { id: 'Contratado', name: 'Contratado', position: 6, color: '#22c55e' },
  { id: 'Perdido', name: 'Perdido', position: 7, color: '#e11d48' },
];

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

export default function PipelinePage() {
  const [pipelines] = useState<PipelineColumn[]>(PIPELINE_COLUMNS);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setRole(localStorage.getItem('userRole'));
      setUserEmail(localStorage.getItem('userEmail'));
    }, 0);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const sellerEmail = role === 'admin' ? undefined : userEmail ?? undefined;
        const all = await storeGetLeads({ sellerEmail });
        setLeads(all);
      } catch {
        setLeads([]);
      }
    }
    if (!role) return;
    load();
  }, [role, userEmail]);

  const handleDrop = async (stage: LeadStage, leadId: string) => {
    try {
      await storeUpdateLead(leadId, { stage });
      const sellerEmail = role === 'admin' ? undefined : userEmail ?? undefined;
      const all = await storeGetLeads({ sellerEmail });
      setLeads(all);
    } catch {
      setLeads((prev) => prev);
    }
  };

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
            const columnLeads = leads.filter(l => l.stage === pipeline.id);
            const totalValue = columnLeads.reduce((acc, curr) => acc + curr.loanAmount, 0);

            return (
              <div
                key={pipeline.id}
                className="w-80 flex flex-col bg-gray-50/50 rounded-[32px] border border-gray-100/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggingLeadId) return;
                  handleDrop(pipeline.id, draggingLeadId);
                  setDraggingLeadId(null);
                }}
              >
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
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', lead.id);
                        setDraggingLeadId(lead.id);
                      }}
                      onDragEnd={() => setDraggingLeadId(null)}
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
                              {format(new Date(lead.createdAt), 'dd MMM', { locale: ptBR })}
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
                          <span className="text-sm font-black text-blue-600">R$ {lead.loanAmount?.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(pipeline.position / pipelines.length) * 100}%` }}
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

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {profileLabel(lead.profile)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                          {lead.fintechInterest === 'V8' ? 'V8' : 'Presença'}
                        </span>
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

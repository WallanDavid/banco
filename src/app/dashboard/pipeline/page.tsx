'use client';

import React, { useEffect, useState } from 'react';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MessageCircle,
  Clock,
  User,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pipelinesRes, leadsRes] = await Promise.all([
          supabase.from('pipelines').select('*').order('position'),
          supabase.from('leads').select('*')
        ]);

        if (pipelinesRes.data) setPipelines(pipelinesRes.data);
        if (leadsRes.data) setLeads(leadsRes.data);
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie seus leads e acompanhe o progresso das vendas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar lead..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex gap-6 h-full min-w-max">
          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="w-80 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100/50">
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: pipeline.color }}
                  />
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{pipeline.name}</h3>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-500">
                    {leads.filter(l => l.status_id === pipeline.id).length}
                  </span>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                {leads
                  .filter(l => l.status_id === pipeline.id)
                  .map((lead) => (
                    <div 
                      key={lead.id} 
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                            {lead.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                            {lead.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                          <span className="text-[10px] font-bold text-green-600">{lead.score}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>Salário</span>
                          <span className="font-bold text-gray-900">R$ {lead.salary?.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>Empréstimo</span>
                          <span className="font-bold text-blue-600">R$ {lead.loan_amount?.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            AM
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">3</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">2d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {leads.filter(l => l.status_id === pipeline.id).length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-xs text-gray-400 font-medium">Sem leads nesta etapa</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Plus, 
  MoreVertical, 
  Play, 
  Pause, 
  Settings,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const INITIAL_AUTOMATIONS = [
  {
    id: '1',
    name: 'Boas-vindas WhatsApp',
    trigger: 'lead_created',
    action: 'send_whatsapp',
    status: 'active',
    stats: { sent: 1245, conversion: '18%' }
  },
  {
    id: '2',
    name: 'Nutrição E-mail D+1',
    trigger: 'lead_created',
    delay: '24h',
    action: 'send_email',
    status: 'active',
    stats: { sent: 850, conversion: '5.4%' }
  },
  {
    id: '3',
    name: 'Follow-up Proposta',
    trigger: 'proposal_sent',
    delay: '2h',
    action: 'send_whatsapp',
    status: 'paused',
    stats: { sent: 320, conversion: '12%' }
  },
  {
    id: '4',
    name: 'Recuperação Lead Frio',
    trigger: 'no_interaction',
    delay: '7d',
    action: 'send_sms',
    status: 'active',
    stats: { sent: 2100, conversion: '2.1%' }
  }
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Motor de Automação</h1>
          <p className="text-gray-500 text-sm mt-1">Configure réguas de comunicação e ações automáticas.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-5 h-5" />
          Nova Automação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">Total Disparos</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">4,515</p>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12% este mês
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">Taxa de Resposta</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">24.8%</p>
          <p className="text-xs text-indigo-600 font-bold mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Acima da média
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">Economia de Tempo</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">142h</p>
          <p className="text-xs text-amber-600 font-bold mt-2">Equivalente a 2 agentes</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Réguas de Automação Ativas</h3>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {automations.map((auto) => (
            <div key={auto.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl ${
                  auto.action === 'send_whatsapp' ? 'bg-green-50 text-green-600' :
                  auto.action === 'send_email' ? 'bg-blue-50 text-blue-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  {auto.action === 'send_whatsapp' ? <MessageSquare className="w-6 h-6" /> :
                   auto.action === 'send_email' ? <Mail className="w-6 h-6" /> :
                   <Smartphone className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{auto.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      auto.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {auto.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Gatilho: <span className="font-bold text-gray-700">{auto.trigger}</span>
                    </p>
                    {auto.delay && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atraso: <span className="font-bold text-gray-700">{auto.delay}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{auto.stats.sent}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Disparos</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-green-600">{auto.stats.conversion}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Conversão</p>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                  <button 
                    onClick={() => toggleStatus(auto.id)}
                    className={`p-2 rounded-xl transition-all ${
                      auto.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {auto.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-500 font-medium italic">
            "A automação inteligente aumenta a produtividade em até 40%." - Relatório Gilda Tech
          </p>
        </div>
      </div>
    </div>
  );
}

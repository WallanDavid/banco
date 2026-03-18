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
  TrendingUp,
  Target,
  ChevronRight,
  Bot
} from 'lucide-react';

const INITIAL_AUTOMATIONS = [
  {
    id: '1',
    name: 'Boas-vindas WhatsApp',
    trigger: 'lead_created',
    action: 'send_whatsapp',
    status: 'active',
    description: 'Envia mensagem automática assim que o lead preenche o formulário.',
    stats: { sent: 1245, conversion: '18%' }
  },
  {
    id: '2',
    name: 'Nutrição E-mail D+1',
    trigger: 'lead_created',
    delay: '24h',
    action: 'send_email',
    status: 'active',
    description: 'Conteúdo educativo sobre as vantagens do consignado.',
    stats: { sent: 850, conversion: '5.4%' }
  },
  {
    id: '3',
    name: 'Follow-up Proposta',
    trigger: 'proposal_sent',
    delay: '2h',
    action: 'send_whatsapp',
    status: 'paused',
    description: 'Pergunta ao lead se ele conseguiu visualizar a proposta gerada.',
    stats: { sent: 320, conversion: '12%' }
  }
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [isAdding, setIsAdding] = useState(false);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Motor de Automação</h1>
          <p className="text-gray-500 font-medium mt-1">Configure réguas de comunicação e inteligência artificial.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Nova Régua
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Ações Executadas', value: '4,515', icon: Zap, color: 'blue' },
          { label: 'Taxa de Engajamento', value: '24.8%', icon: MessageSquare, color: 'indigo' },
          { label: 'Tempo Economizado', value: '142h', icon: Clock, color: 'amber' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-${item.color}-50 text-${item.color}-600`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Fluxos de Comunicação</h3>
          <div className="flex gap-2">
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {automations.map((auto) => (
            <div key={auto.id} className="p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-gray-50/50 transition-all group">
              <div className="flex items-start gap-6 max-w-lg">
                <div className={`p-5 rounded-[24px] shadow-lg transition-transform group-hover:scale-110 ${
                  auto.action === 'send_whatsapp' ? 'bg-green-500 text-white' :
                  auto.action === 'send_email' ? 'bg-blue-500 text-white' :
                  'bg-indigo-500 text-white'
                }`}>
                  {auto.action === 'send_whatsapp' ? <MessageSquare className="w-7 h-7" /> :
                   auto.action === 'send_email' ? <Mail className="w-7 h-7" /> :
                   <Smartphone className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-black text-gray-900 tracking-tight">{auto.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                      auto.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {auto.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{auto.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                      <Target className="w-3 h-3" />
                      Gatilho: {auto.trigger}
                    </div>
                    {auto.delay && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        Delay: {auto.delay}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">{auto.stats.sent}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Disparos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-green-600">{auto.stats.conversion}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Conversão</p>
                </div>
                <div className="flex items-center gap-3 pl-8 border-l border-gray-100">
                  <button 
                    onClick={() => toggleStatus(auto.id)}
                    className={`p-4 rounded-2xl transition-all shadow-sm ${
                      auto.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {auto.status === 'active' ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-10 bg-indigo-600 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic">Inteligência Artificial Ativa</h4>
              <p className="text-indigo-100 text-sm font-medium">O chatbot está processando dúvidas e qualificando leads automaticamente.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2">
            Configurar IA
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

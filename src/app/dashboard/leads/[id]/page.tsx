'use client';

import React, { useEffect, useState, use as useReact } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  ChevronLeft,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  FileText,
  DollarSign,
  User,
  Zap,
  Bot,
  Copy,
  StickyNote,
  History,
  AlertCircle
} from 'lucide-react';
import { supabase, isMockMode, storeCreateProposal, storeGetLead, storeUpdateLead, type DemoLead, type StoreProposal } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  salary: number;
  age: number;
  loan_amount: number;
  score: number;
  status_id: string;
  source: string;
  benefit_type: string;
  created_at: string;
  profile?: DemoLead['profile'];
  fintech_interest?: DemoLead['fintechInterest'];
  appointment_at?: string;
  interactions?: DemoLead['interactions'];
}

interface Message {
  id: string;
  sender: 'bot' | 'human' | 'lead';
  content: string;
  type: string;
  created_at: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'bot', content: 'Olá! Recebemos seu interesse em crédito consignado. Como posso ajudar?', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*60).toISOString() },
  { id: '2', sender: 'lead', content: 'Gostaria de saber as taxas para aposentados.', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*55).toISOString() },
  { id: '3', sender: 'bot', content: 'Nossas taxas para aposentados começam em 1.45% ao mês. Deseja fazer uma simulação?', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*50).toISOString() },
];

function profileLabel(profile?: DemoLead['profile']) {
  switch (profile) {
    case 'clt':
      return 'CLT';
    case 'servidor_publico':
      return 'Servidor Público';
    case 'aposentado_pensionista':
      return 'Aposentado / Pensionista';
    default:
      return '—';
  }
}

function fintechLabel(fintech?: DemoLead['fintechInterest']) {
  if (!fintech) return '—';
  return fintech === 'V8' ? 'V8 Fintech' : 'Presença Bank';
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = useReact(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [proposal, setProposal] = useState<StoreProposal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [proposalLink, setProposalLink] = useState('');
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'historico'>('chat');
  const [appointmentAt, setAppointmentAt] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      if (isMockMode) {
        try {
          const data = await storeGetLead(resolvedParams.id);
          const demoLead = data.lead as DemoLead;
          const mapped: Lead = {
            id: demoLead.id,
            name: demoLead.name,
            email: `${demoLead.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
            phone: demoLead.phone,
            salary: demoLead.salary,
            age: demoLead.age,
            loan_amount: demoLead.loanAmount,
            score: demoLead.score,
            status_id: demoLead.stage,
            source: demoLead.source,
            benefit_type: profileLabel(demoLead.profile),
            created_at: demoLead.createdAt,
            profile: demoLead.profile,
            fintech_interest: demoLead.fintechInterest,
            appointment_at: demoLead.appointmentAt,
            interactions: demoLead.interactions,
          };
          setLead(mapped);
          setProposal(data.proposal);
          setProposalLink(data.proposal ? `${window.location.origin}${data.proposal.contractUrl}` : '');
          setMessages(MOCK_MESSAGES);
          setAppointmentAt(demoLead.appointmentAt ? demoLead.appointmentAt.slice(0, 16) : '');
          setLoading(false);
          return;
        } catch {
          setLead(null);
          setMessages([]);
          setLoading(false);
          return;
        }
      }

      try {
        const [leadRes, messagesRes] = await Promise.all([
          supabase.from('leads').select('*').eq('id', resolvedParams.id).single(),
          supabase.from('messages').select('*').eq('lead_id', resolvedParams.id).order('created_at', { ascending: true })
        ]);

        if (leadRes.data) setLead(leadRes.data);
        if (messagesRes.data) setMessages(messagesRes.data);
      } catch (err) {
        console.error('Error fetching lead data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !lead) return;

    const sentMsg: Message = {
      id: Date.now().toString(),
      sender: 'human',
      content: newMessage,
      type: 'whatsapp',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, sentMsg]);
    setNewMessage('');
    
    // AI Mock Response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: `Entendido, Sr(a) ${lead.name.split(' ')[0]}. Vou verificar essa informação agora mesmo.`,
        type: 'whatsapp',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleGenerateProposal = () => {
    if (!lead) return;
    setGenerating(true);
    storeCreateProposal(lead.id)
      .then(({ proposal: created }) => {
        setProposal(created);
        const link = `${window.location.origin}${created.contractUrl}`;
        setProposalLink(link);
        const botMsg: Message = {
          id: Date.now().toString(),
          sender: 'bot',
          content: `📄 Proposta gerada! Valor: R$ ${lead.loan_amount.toLocaleString('pt-BR')}. Link para assinatura: ${link}`,
          type: 'whatsapp',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
      })
      .finally(() => setGenerating(false));
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Carregando Detalhes...</p>
    </div>
  );

  if (!lead) return <div className="p-12 text-center font-black text-red-500">Lead não encontrado.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads" className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{lead.name}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
                {lead.source}
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-700 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-widest">
                {profileLabel(lead.profile)}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                {fintechLabel(lead.fintech_interest)}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Criado em {format(new Date(lead.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Notes */}
        <div className="space-y-6">
          {/* Main Stats Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Lead Score</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-black text-blue-900">{lead.score}</span>
                </div>
              </div>
              <div className="p-5 bg-green-50 rounded-3xl border border-green-100/50">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Qualificação</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-black text-green-900">Alta</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Dados de Contato</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 truncate">{lead.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Dados Financeiros</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Benefício</span>
                  <span className="font-black text-gray-900 uppercase text-xs tracking-widest">{lead.benefit_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Salário</span>
                  <span className="font-black text-gray-900">R$ {lead.salary.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400">Desejado</span>
                  <span className="font-black text-blue-600 text-lg">R$ {lead.loan_amount.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-sm uppercase tracking-widest">Agendar Retorno</h3>
            </div>
            <div className="space-y-3">
              <input
                type="datetime-local"
                value={appointmentAt}
                onChange={(e) => setAppointmentAt(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={() => {
                  if (!appointmentAt || !lead) return;
                  const iso = new Date(appointmentAt).toISOString();
                  setLead((prev) => (prev ? { ...prev, appointment_at: iso } : prev));
                  if (isMockMode) {
                    storeUpdateLead(lead.id, { appointmentAt: iso });
                  }
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Salvar Agendamento
              </button>
              {lead.appointment_at && (
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Agendado: {format(new Date(lead.appointment_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 mb-4">
              <StickyNote className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm uppercase tracking-widest">Anotações do Agente</h3>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este lead..."
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none transition-all"
            />
            <button className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
              Salvar Nota
            </button>
          </div>
        </div>

        {/* Middle Column: Chat & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Window */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-[700px] overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 tracking-tight">Atendimento Inteligente</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agente & Chatbot Ativo</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900'}`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('historico')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900'}`}
                  >
                    Histórico
                  </button>
                </div>
                <button 
                  onClick={handleGenerateProposal}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  {generating ? 'Gerando...' : 'Gerar Proposta'}
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {proposalLink && (
              <div className="px-6 py-4 border-b border-gray-50 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Link de Contratação</p>
                    <input
                      readOnly
                      value={proposalLink}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(proposalLink);
                      setCopiedProposal(true);
                      setTimeout(() => setCopiedProposal(false), 1200);
                    }}
                    className="px-5 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedProposal ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
              {activeTab === 'chat' && messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'human' || msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] flex items-start gap-4 ${msg.sender === 'human' || msg.sender === 'bot' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-black shadow-sm border-2 border-white ${
                      msg.sender === 'bot' ? 'bg-indigo-100 text-indigo-600' : 
                      msg.sender === 'human' ? 'bg-blue-600 text-white' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {msg.sender === 'bot' ? <Bot className="w-5 h-5" /> : msg.sender === 'human' ? 'AM' : lead.name.charAt(0)}
                    </div>
                    <div className={`p-5 rounded-[28px] shadow-sm ${
                      msg.sender === 'human' ? 'bg-blue-600 text-white rounded-tr-none' : 
                      msg.sender === 'bot' ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tr-none' :
                      'bg-gray-100 text-gray-900 rounded-tl-none'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center gap-2 mt-3 ${msg.sender === 'human' || msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'human' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {(msg.sender === 'human' || msg.sender === 'bot') && <CheckCircle className={`w-3 h-3 ${msg.sender === 'human' ? 'text-blue-200' : 'text-indigo-300'}`} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'historico' && (
                <div className="space-y-4">
                  {(lead.interactions ?? []).map((evt) => {
                    const Icon =
                      evt.type === 'email'
                        ? Mail
                        : evt.type === 'whatsapp'
                          ? MessageSquare
                          : evt.type === 'call'
                            ? Phone
                            : evt.type === 'proposal'
                              ? FileText
                              : StickyNote;
                    return (
                      <div key={evt.id} className="p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-gray-900">{evt.title}</p>
                            {evt.body && <p className="text-xs text-gray-500 font-medium">{evt.body}</p>}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {format(new Date(evt.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    );
                  })}

                  {(lead.interactions ?? []).length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-gray-200" />
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-4">Sem histórico disponível</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            {activeTab === 'chat' && (
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-50 bg-gray-50/30">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite aqui para falar com o cliente..." 
                    className="w-full pl-6 pr-16 py-5 bg-white border border-gray-100 rounded-[24px] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Action History / Next Step */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">Histórico de Ações</h3>
              </div>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Sugestão: Enviar Simulação
              </div>
            </div>

            <div className="space-y-6">
              {(lead.interactions ?? []).slice(-6).reverse().map((evt) => {
                const Icon =
                  evt.type === 'email'
                    ? Mail
                    : evt.type === 'whatsapp'
                      ? MessageSquare
                      : evt.type === 'call'
                        ? Phone
                        : evt.type === 'proposal'
                          ? FileText
                          : StickyNote;
                return (
                  <div key={evt.id} className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{evt.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {format(new Date(evt.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {(lead.interactions ?? []).length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-gray-200" />
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-4">Sem ações registradas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

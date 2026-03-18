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
import { supabase, isMockMode } from '@/lib/supabase';
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
}

interface Message {
  id: string;
  lead_id: string;
  sender: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
}

const MOCK_MESSAGES = [
  { id: '1', sender: 'bot', content: 'Olá! Recebemos seu interesse em crédito consignado. Como posso ajudar?', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*60).toISOString() },
  { id: '2', sender: 'lead', content: 'Gostaria de saber as taxas para aposentados.', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*55).toISOString() },
  { id: '3', sender: 'bot', content: 'Nossas taxas para aposentados começam em 1.45% ao mês. Deseja fazer uma simulação?', type: 'whatsapp', created_at: new Date(Date.now() - 1000*60*50).toISOString() },
];

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = useReact(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [proposalLink, setProposalLink] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (isMockMode) {
        setLead({
          id: resolvedParams.id,
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-1111',
          salary: 5200,
          age: 45,
          loan_amount: 12000,
          score: 85,
          status_id: '1',
          source: 'Facebook Ads',
          benefit_type: 'Aposentado',
          created_at: new Date(Date.now() - 1000*60*60*24).toISOString()
        });
        setMessages(MOCK_MESSAGES as any);
        setLoading(false);
        return;
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

    const sentMsg = {
      id: Date.now().toString(),
      lead_id: lead.id,
      sender: 'human',
      content: newMessage,
      type: 'whatsapp',
      status: 'sent',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, sentMsg]);
    setNewMessage('');
    
    // AI Mock Response
    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        lead_id: lead.id,
        sender: 'bot',
        content: `Entendido, Sr(a) ${lead.name.split(' ')[0]}. Vou verificar essa informação agora mesmo.`,
        type: 'whatsapp',
        status: 'sent',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleGenerateProposal = () => {
    if (!lead) return;
    setGenerating(true);
    setTimeout(() => {
      const link = `${window.location.origin}/contract/${lead.id}`;
      setProposalLink(link);
      setGenerating(false);
      
      const botMsg = {
        id: Date.now().toString(),
        lead_id: lead.id,
        sender: 'bot',
        content: `📄 Proposta gerada! Valor: R$ ${lead.loan_amount.toLocaleString('pt-BR')}. Link para assinatura: ${link}`,
        type: 'whatsapp',
        status: 'sent',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
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
          <Link href="/dashboard" className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{lead.name}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
                {lead.source}
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

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
              {messages.map((msg) => (
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
            </div>

            {/* Input Area */}
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
              {[
                { action: 'Lead Capturado', date: 'Ontem às 14:20', icon: User, color: 'blue' },
                { action: 'E-mail de Boas-vindas enviado', date: 'Ontem às 14:21', icon: Mail, color: 'indigo' },
                { action: 'Interação com Chatbot', date: 'Hoje às 09:15', icon: Bot, color: 'green' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.action}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

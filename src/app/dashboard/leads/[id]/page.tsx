'use client';

import React, { useEffect, useState, use } from 'react';
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
  Bot
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchData() {
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

    setSending(true);
    try {
      const { data: sentMessage, error } = await supabase.from('messages').insert([
        {
          lead_id: lead.id,
          sender: 'human',
          content: newMessage,
          type: 'whatsapp',
          status: 'sent'
        }
      ]).select().single();

      if (error) throw error;
      setMessages([...messages, sentMessage]);
      setNewMessage('');

      // Simulate bot response after 1.5 seconds
      setTimeout(async () => {
        const { data: botMessage } = await supabase.from('messages').insert([
          {
            lead_id: lead.id,
            sender: 'bot',
            content: `Olá ${lead.name.split(' ')[0]}, recebemos sua mensagem. Um consultor entrará em contato em breve para finalizar sua simulação de R$ ${lead.loan_amount?.toLocaleString('pt-BR')}.`,
            type: 'whatsapp',
            status: 'sent'
          }
        ]).select().single();
        if (botMessage) setMessages(prev => [...prev, botMessage]);
      }, 1500);

    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const [generating, setGenerating] = useState(false);
  const [proposalLink, setProposalLink] = useState('');

  const handleGenerateProposal = async () => {
    setGenerating(true);
    try {
      // Simulate API call to /api/proposals/generate
      setTimeout(() => {
        const mockProposalId = 'prop_' + Math.random().toString(36).substr(2, 9);
        const link = `${window.location.origin}/contract/${mockProposalId}`;
        setProposalLink(link);
        
        // Add a message about the proposal
        const newMsg = {
          id: Date.now().toString(),
          lead_id: lead.id,
          sender: 'bot',
          content: `📄 Sua proposta de R$ ${lead.loan_amount?.toLocaleString('pt-BR')} foi gerada! Acesse para assinar: ${link}`,
          type: 'whatsapp',
          status: 'sent',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        setGenerating(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating proposal:', err);
      setGenerating(false);
    }
  };

  const copyProposalLink = () => {
    navigator.clipboard.writeText(proposalLink);
    alert('Link da proposta copiado!');
  };

  if (loading) return <div className="p-12 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">CARREGANDO DETALHES DO LEAD...</div>;
  if (!lead) return <div className="p-12 text-center font-bold text-red-500">Lead não encontrado.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pipeline" className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
              Novo Lead
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Criado em {format(new Date(lead.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Informações do Lead</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-gray-100 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp</p>
                  <p className="text-sm font-bold text-gray-900">{lead.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-gray-100 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-mail</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Score</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xl font-extrabold text-blue-900">{lead.score}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Aprovação</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-extrabold text-green-900">Alta</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Salário Mensal</span>
                <span className="font-bold text-gray-900">R$ {lead.salary?.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor Desejado</span>
                <span className="font-bold text-blue-600">R$ {lead.loan_amount?.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Idade</span>
                <span className="font-bold text-gray-900">{lead.age} anos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Origem</span>
                <span className="font-bold text-gray-900 uppercase text-[10px]">{lead.source}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleGenerateProposal}
              disabled={generating}
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-blue-50 hover:border-blue-100 transition-all group disabled:opacity-50"
            >
              {generating ? (
                <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" />
              ) : (
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-2" />
              )}
              <span className="text-xs font-bold text-gray-700">{generating ? 'Gerando...' : 'Gerar Proposta'}</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
              <Zap className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mb-2" />
              <span className="text-xs font-bold text-gray-700">Automações</span>
            </button>
          </div>

          {proposalLink && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Link de Autocontratação</span>
                <button onClick={copyProposalLink} className="p-1.5 hover:bg-green-100 rounded-lg transition-all">
                  <Copy className="w-3.5 h-3.5 text-green-600" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-green-800 break-all">{proposalLink}</p>
            </div>
          )}
        </div>

        {/* Chat / Timeline Area */}
        <div className="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Histórico de Mensagens</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Atendimento via WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'human' || msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex items-start gap-3 ${msg.sender === 'human' || msg.sender === 'bot' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${
                    msg.sender === 'bot' ? 'bg-indigo-100 text-indigo-600' : 
                    msg.sender === 'human' ? 'bg-blue-600 text-white' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> : msg.sender === 'human' ? 'AM' : lead.name.charAt(0)}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.sender === 'human' ? 'bg-blue-600 text-white rounded-tr-none' : 
                    msg.sender === 'bot' ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tr-none' :
                    'bg-gray-100 text-gray-900 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'human' || msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] font-bold uppercase ${msg.sender === 'human' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                      {(msg.sender === 'human' || msg.sender === 'bot') && <CheckCircle className={`w-3 h-3 ${msg.sender === 'human' ? 'text-blue-100' : 'text-indigo-300'}`} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="relative">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem para o cliente..." 
                className="w-full pl-4 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              />
              <button 
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 font-bold mt-3 uppercase tracking-widest">
              Mensagem enviada via WhatsApp Business API
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

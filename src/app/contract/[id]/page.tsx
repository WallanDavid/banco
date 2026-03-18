'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  CreditCard, 
  Copy, 
  AlertCircle,
  TrendingUp,
  Download,
  QrCode
} from 'lucide-react';
import { supabase, isMockMode } from '@/lib/supabase';
import { simulateCredit } from '@/lib/credit-logic';

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [proposal, setProposal] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (isMockMode) {
        // Mock data for demo
        setLead({ name: 'João Silva', loan_amount: 15000, salary: 5000, age: 45 });
        const sim = simulateCredit({ salary: 5000, age: 45, loan_amount: 15000 });
        setProposal({ simulation_data: sim, status: 'pending' });
        setLoading(false);
        return;
      }

      try {
        const { data: prop, error: propErr } = await supabase
          .from('proposals')
          .select('*, leads(*)')
          .eq('id', resolvedParams.id)
          .single();

        if (prop) {
          setProposal(prop);
          setLead(prop.leads);
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleSign = async () => {
    setSigning(true);
    // Simulate API call to /api/contracts/sign
    setTimeout(() => {
      setSigned(true);
      setSigning(false);
      setPixCode('00020101021126580014BR.GOV.BCB.PIX0136b5c3e5a7-9d6f-4c8e-b5c3-e5a79d6f4c8e52040000530398654040.015802BR5913BANCO_AUTOMAT6008SAO_PAULO62070503***6304E2D5');
    }, 2000);
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse">CARREGANDO CONTRATO...</div>;
  if (!lead) return <div className="min-h-screen flex items-center justify-center">Proposta não encontrada.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <TrendingUp className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Finalize sua Contratação</h1>
          <p className="mt-2 text-gray-600 font-medium">Banco Automático - 100% Digital e Seguro</p>
        </div>

        {!signed ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resumo da Proposta
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Aprovado
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor do Empréstimo</p>
                  <p className="text-2xl font-black text-blue-600">R$ {lead.loan_amount?.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Parcela Mensal</p>
                  <p className="text-2xl font-black text-gray-900">R$ {proposal.simulation_data?.estimated_installment?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Detalhes Técnicos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                    <span className="text-xs text-gray-500">Taxa de Juros</span>
                    <span className="text-xs font-bold text-gray-900">1.80% a.m.</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                    <span className="text-xs text-gray-500">Prazo</span>
                    <span className="text-xs font-bold text-gray-900">{proposal.simulation_data?.max_installments} meses</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                    <span className="text-xs text-gray-500">Primeiro Vencimento</span>
                    <span className="text-xs font-bold text-gray-900">Próximo mês</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                    <span className="text-xs text-gray-500">Modalidade</span>
                    <span className="text-xs font-bold text-gray-900">Consignado Público</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Próximo Passo</h4>
                  <p className="text-xs text-blue-700 leading-relaxed mt-1">
                    Ao clicar em "Assinar Digitalmente", você concorda com as cláusulas do contrato e inicia o processo de liberação do crédito. Um PIX de validação será solicitado logo após.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 group"
              >
                {signing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando Assinatura...
                  </>
                ) : (
                  <>
                    Assinar Digitalmente
                    <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Assinatura eletrônica com validade jurídica via Banco Automático
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Contrato Assinado!</h2>
              <p className="text-gray-500 mb-8">Agora realize o PIX para liberar o seu crédito na conta.</p>

              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 max-w-sm mx-auto mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 inline-block">
                  <QrCode className="w-40 h-40 text-gray-900" />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pix Copia e Cola</p>
                  <div className="relative group">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixCode}
                      className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      onClick={copyPix}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && <p className="text-[10px] font-bold text-green-600 animate-in fade-in slide-in-from-top-1">Copiado com sucesso!</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">
                  <Download className="w-4 h-4" />
                  Baixar Contrato
                </button>
                <button className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                  <AlertCircle className="w-4 h-4" />
                  Suporte 24h
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Security */}
        <div className="mt-12 flex items-center justify-center gap-6 text-gray-400 grayscale opacity-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Criptografia de 256 bits</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Auditado pelo BACEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

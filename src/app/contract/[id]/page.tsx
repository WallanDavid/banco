'use client';

import React, { useState, useEffect, use as useReact } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  CreditCard, 
  Copy, 
  AlertCircle,
  TrendingUp,
  Download,
  QrCode,
  ArrowRight,
  Clock,
  User,
  Check
} from 'lucide-react';
import { isMockMode } from '@/lib/supabase';
import { simulateCredit } from '@/lib/credit-logic';

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = useReact(params);
  const [step, setStep] = useState(1); // 1: Confirmação, 2: Assinatura, 3: Pagamento, 4: Finalizado
  const [proposal, setProposal] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pixCode] = useState('00020101021126580014BR.GOV.BCB.PIX0136b5c3e5a7-9d6f-4c8e-b5c3-e5a79d6f4c8e52040000530398654040.015802BR5913BANCO_AUTOMAT6008SAO_PAULO62070503***6304E2D5');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Mock data for demo
    setLead({ name: 'João Silva', loan_amount: 12000, salary: 5200, age: 45, benefit_type: 'Aposentado' });
    const sim = simulateCredit({ salary: 5200, age: 45, loan_amount: 12000 });
    setProposal({ simulation_data: sim, status: 'pending' });
    setLoading(false);
  }, []);

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => setStep(prev => prev + 1);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Preparando Contrato...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-700 -z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-4 transition-all duration-500 ${
                  step >= i ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-100 text-gray-300'
                }`}
              >
                {step > i ? <Check className="w-5 h-5 font-black" /> : <span className="text-xs font-black">{i}</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {['Dados', 'Assinatura', 'Pagamento', 'Concluído'].map((label, i) => (
              <span key={i} className={`text-[10px] font-black uppercase tracking-widest ${step >= i + 1 ? 'text-blue-600' : 'text-gray-300'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1: Data Confirmation */}
        {step === 1 && (
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Confirme seus Dados</h2>
              <p className="text-sm text-gray-500 font-medium">Verifique se as informações da sua proposta estão corretas.</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Empréstimo</p>
                  <p className="text-3xl font-black text-blue-600 italic">R$ {lead.loan_amount.toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Parcela Mensal</p>
                  <p className="text-3xl font-black text-gray-900 italic">R$ {proposal.simulation_data.estimated_installment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prazo Total</p>
                  <p className="text-lg font-bold text-gray-700">{proposal.simulation_data.max_installments} Meses</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Benefício</p>
                  <p className="text-lg font-bold text-gray-700 uppercase tracking-tighter">{lead.benefit_type}</p>
                </div>
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100/50 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Sua taxa de juros foi fixada em <span className="font-black">1.45% ao mês</span>. Esta é uma das menores taxas do mercado para a sua categoria.
                </p>
              </div>
              <button 
                onClick={nextStep}
                className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group"
              >
                Tudo Correto, Próximo Passo
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Digital Signature */}
        {step === 2 && (
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Assinatura Eletrônica</h2>
              <p className="text-sm text-gray-500 font-medium">Assine o contrato com validade jurídica via token.</p>
            </div>
            <div className="p-10 space-y-10">
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 tracking-tight">Contrato_Consignado_Digital.pdf</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documento gerado agora</p>
                  </div>
                </div>
                <div className="h-40 bg-white rounded-2xl flex items-center justify-center text-gray-300 italic text-xs px-10 text-center">
                  Visualização do contrato bloqueada. <br /> Clique abaixo para gerar o token de assinatura.
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Ao assinar, você autoriza a averbação da margem consignável.
                  </p>
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-6 bg-gray-900 text-white rounded-[24px] font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
                >
                  Confirmar Assinatura Digital
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: PIX Payment */}
        {step === 3 && (
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30 text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2 italic tracking-tighter">Formalização via PIX</h2>
              <p className="text-sm text-gray-500 font-medium">Realize o pagamento de formalização para liberar o crédito.</p>
            </div>
            <div className="p-10 text-center space-y-8">
              <div className="inline-block p-6 bg-white border-4 border-blue-600 rounded-[40px] shadow-2xl">
                <QrCode className="w-48 h-48 text-gray-900" />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Pix Copia e Cola</p>
                <div className="relative group max-w-sm mx-auto">
                  <input 
                    type="text" 
                    readOnly 
                    value={pixCode}
                    className="w-full pl-6 pr-16 py-5 bg-gray-50 border-none rounded-2xl text-[10px] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={copyPix}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-50 transition-all"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copied && <p className="text-[10px] font-black text-green-600 uppercase animate-pulse">Código Copiado!</p>}
              </div>
              <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={nextStep}
                  className="w-full py-6 bg-green-600 text-white rounded-[24px] font-black text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3"
                >
                  Já realizei o pagamento
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-700 text-center p-16">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic">Sucesso Total!</h2>
            <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed">
              Seu contrato foi averbado e o pagamento está sendo processado. Em até <span className="text-blue-600 font-black">24 horas úteis</span> o valor estará disponível em sua conta.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-5 bg-gray-100 text-gray-700 rounded-3xl font-black text-sm hover:bg-gray-200 transition-all uppercase tracking-widest">
                <Download className="w-5 h-5" />
                Baixar Contrato
              </button>
              <button className="flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-3xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest">
                <Clock className="w-5 h-5" />
                Acompanhar Status
              </button>
            </div>
          </div>
        )}

        {/* Footer Security */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-10 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Criptografia 256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Auditado pelo BACEN</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Parceiro Oficial FEBRABAN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

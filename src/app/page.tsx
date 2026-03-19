'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  User, 
  Briefcase 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isMockMode, storeCreateLead, type LeadProfile } from '@/lib/supabase';
import { simulateCredit, type SimulationResult } from '@/lib/credit-logic';

export default function LandingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: 5000,
    age: 45,
    loan_amount: 10000,
    vinculo: 'aposentado_pensionista' as LeadProfile,
  });
  
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Update simulation when relevant fields change
  useEffect(() => {
    const res = simulateCredit({
      salary: formData.salary,
      age: formData.age,
      loan_amount: formData.loan_amount
    });
    setSimulation(res);
  }, [formData.salary, formData.age, formData.loan_amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isMockMode) {
      setTimeout(async () => {
        try {
          const created = await storeCreateLead({
            name: formData.name,
            phone: formData.phone,
            salary: formData.salary,
            age: formData.age,
            loanAmount: formData.loan_amount,
            profile: formData.vinculo,
            source: 'Landing',
            stage: 'Captacao',
          });
          router.push(`/thanks?leadId=${encodeURIComponent(created.id)}`);
        } finally {
          setLoading(false);
        }
      }, 500);
      return;
    }

    try {
      const { data: pipelineData } = await supabase
        .from('pipelines')
        .select('id')
        .eq('name', 'Novo Lead')
        .single();

      const { error } = await supabase.from('leads').insert([
        {
          ...formData,
          benefit_type: formData.vinculo,
          status_id: pipelineData?.id,
          source: 'landing_page',
          score: 50, // Initial score
        },
      ]);

      if (error) throw error;
      router.push('/thanks');
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Ocorreu um erro ao enviar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' || e.target.type === 'range' 
      ? parseFloat(e.target.value) 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-6 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 rotate-3">
            <TrendingUp className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight italic">Banco Automático</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Como funciona</a>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Taxas</a>
            <a href="#" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Segurança</a>
          </div>
          <button className="bg-gray-50 text-blue-600 px-6 py-3 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all border border-blue-100">
            Login Agente
          </button>
        </div>
      </nav>

      <main>
        {/* Hero & Simulation Section */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-3 pt-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              Taxas reduzidas este mês: 1.45% a.m.
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.9] mb-10 tracking-tighter">
              Seu crédito <br />
              <span className="text-blue-600 italic">em segundos.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium">
              Especialistas em crédito consignado para <span className="text-gray-900 font-bold underline decoration-blue-500 decoration-4">servidores e aposentados</span>. 100% digital, rápido e sem taxas escondidas.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
              <div className="group space-y-3">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="font-black text-gray-900 text-lg">Segurança Máxima</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Proteção de dados auditada pelo Banco Central do Brasil.</p>
              </div>
              <div className="group space-y-3">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm border border-gray-100">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-black text-gray-900 text-lg">Aprovação em 24h</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Crédito na conta no mesmo dia após a assinatura digital.</p>
              </div>
            </div>

            <div className="flex items-center gap-10 opacity-30">
              <img src="/next.svg" alt="Bacen" className="h-5 invert" />
              <img src="/vercel.svg" alt="Febraban" className="h-5 invert" />
            </div>
          </div>

          {/* Interactive Calculator Form */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl">
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Simulador Digital</h3>
                  <p className="text-sm text-gray-400 font-medium">Ajuste os valores para ver sua parcela real</p>
                </div>

                <div className="space-y-8 mb-10">
                  {/* Loan Amount Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Quanto você precisa?</label>
                      <span className="text-2xl font-black text-blue-600">R$ {formData.loan_amount.toLocaleString('pt-BR')}</span>
                    </div>
                    <input 
                      type="range" 
                      name="loan_amount"
                      min="1000" 
                      max="150000" 
                      step="500"
                      value={formData.loan_amount}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      <span>R$ 1.000</span>
                      <span>R$ 150.000</span>
                    </div>
                  </div>

                  {/* Salary Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sua Renda Líquida</label>
                      <span className="text-lg font-bold text-gray-900">R$ {formData.salary.toLocaleString('pt-BR')}</span>
                    </div>
                    <input 
                      type="range" 
                      name="salary"
                      min="1320" 
                      max="30000" 
                      step="100"
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                  </div>

                  {/* Results Preview */}
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-700">Parcela Estimada</span>
                      <span className="text-xl font-black text-blue-900">
                        {(simulation?.estimated_installment ?? 0) > 0 
                          ? `R$ ${(simulation?.estimated_installment ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : 'R$ --'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-blue-400 uppercase tracking-widest">CET (Anual)</span>
                      <span className="font-black text-blue-700">21.4% a.a.</span>
                    </div>
                    {!simulation?.is_approved && (
                      <div className="pt-2 border-t border-blue-100">
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-tight">
                          ⚠️ Valor excede sua margem de 35%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        required
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
                        placeholder="Seu Nome Completo"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          name="vinculo"
                          onChange={handleChange}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                          <option value="clt">CLT / Empregado Privado</option>
                          <option value="servidor_publico">Servidor Público</option>
                          <option value="aposentado_pensionista">Aposentado / Pensionista</option>
                        </select>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          name="age"
                          required
                          min="18"
                          max="80"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
                          placeholder="Idade"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        required
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold"
                        placeholder="Seu WhatsApp (com DDD)"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !simulation?.is_approved}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 group disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Garantir Minha Proposta
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {isMockMode && (
                    <p className="text-[10px] text-center text-amber-500 font-black uppercase tracking-[0.2em] animate-pulse">
                      Simulador em modo demonstração
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Por que o Consignado Digital?</h2>
              <p className="text-gray-500 font-medium">Compare e veja por que somos a melhor escolha para o seu bolso.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: 'Taxa de Juros', consignado: 'A partir de 1.45%', pessoal: 'Até 12.0%' },
                { label: 'Prazo Pagto', consignado: 'Até 84 meses', pessoal: 'Até 24 meses' },
                { label: 'Burocracia', consignado: 'Mínima / Digital', pessoal: 'Alta / Presencial' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{item.label}</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">Banco Automático</span>
                      <span className="text-lg font-black text-blue-900">{item.consignado}</span>
                    </div>
                    <div className="h-px bg-gray-50"></div>
                    <div className="flex items-center justify-between opacity-40">
                      <span className="text-sm font-medium text-gray-500">Crédito Pessoal</span>
                      <span className="text-sm font-bold text-gray-700">{item.pessoal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight italic">Banco Automático</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            &copy; 2024 Gilda Tech - Todos os direitos reservados.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a href="mailto:contato@gildatech.com.br" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">contato@gildatech.com.br</a>
            <a href="tel:+5511999999999" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">(11) 99999-9999</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

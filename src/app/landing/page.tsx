'use client';

import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase, isMockMode } from '@/lib/supabase';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: '',
    age: '',
    loan_amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isMockMode) {
      console.log('Mock Mode: Simulating form submission', formData);
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
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
          salary: parseFloat(formData.salary),
          age: parseInt(formData.age),
          loan_amount: parseFloat(formData.loan_amount),
          status_id: pipelineData?.id,
          source: 'landing_page',
        },
      ]);

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Ocorreu um erro ao enviar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Recebida!</h2>
          <p className="text-gray-600 mb-6">
            Nossa equipe entrará em contato em breve para prosseguir com sua simulação de crédito consignado.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-900">Banco Automático</span>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Login Agente</button>
      </nav>

      <main>
          {/* Hero Section */}
          <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Taxas a partir de 1.45% ao mês
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
                Dinheiro na mão <br />
                <span className="text-blue-600">sem burocracia</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                Crédito consignado para aposentados, pensionistas e servidores públicos. Receba em até 24 horas com as melhores condições do Brasil.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all group">
                  <div className="p-3 bg-white rounded-xl text-green-500 shadow-sm group-hover:bg-green-500 group-hover:text-white transition-all">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">100% Seguro</h4>
                    <p className="text-xs text-gray-500 mt-1">Processo auditado e aprovado pelo Banco Central.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all group">
                  <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Aprovação Rápida</h4>
                    <p className="text-xs text-gray-500 mt-1">Análise automática de margem em poucos minutos.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center font-black text-gray-400 text-xs italic">
                    BACEN
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Regulado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center font-black text-gray-400 text-xs italic">
                    FEBRABAN
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Certificado</span>
                </div>
              </div>
            </div>

            {/* Lead Form */}
            <div className="lg:col-span-2 relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              
              <div className="relative bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-blue-100/50">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900">Simule Agora</h2>
                  <p className="text-gray-500 text-sm mt-2 font-medium">Preencha e receba sua proposta via WhatsApp</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dados Pessoais</label>
                    <input
                      type="text"
                      name="name"
                      required
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                      placeholder="Seu nome completo"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="tel"
                        name="phone"
                        required
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                        placeholder="WhatsApp"
                      />
                      <input
                        type="number"
                        name="age"
                        required
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                        placeholder="Sua idade"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Informações Financeiras</label>
                    <input
                      type="number"
                      name="salary"
                      required
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                      placeholder="Salário líquido (R$)"
                    />
                    <input
                      type="number"
                      name="loan_amount"
                      required
                      onChange={handleChange}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-sm border-l-4 border-l-blue-600"
                      placeholder="Quanto você precisa? (R$)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 group"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Ver Minha Margem
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {isMockMode && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600 font-black uppercase tracking-widest animate-pulse">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Ambiente de Testes Ativo
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>
      </main>

      <footer className="py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Banco Automático. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

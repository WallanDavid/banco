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
        <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Crédito Consignado <br />
              <span className="text-blue-600">Simples e Rápido</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Receba sua simulação em minutos e receba o dinheiro na conta com as menores taxas do mercado. 100% digital e seguro.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-500" />
                <span className="text-gray-700 font-medium">Processo 100% seguro e auditado</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-700 font-medium">Aprovação rápida e sem burocracia</span>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Simule agora seu crédito</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="joao@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mensal (R$)</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                  <input
                    type="number"
                    name="age"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Empréstimo (R$)</label>
                <input
                  type="number"
                  name="loan_amount"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="10000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {loading ? 'Processando...' : 'Solicitar Simulação Grátis'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
              
              {isMockMode && (
                <p className="text-xs text-center text-amber-600 mt-2 font-bold uppercase tracking-widest">
                  Demonstração: Rodando em modo de simulação
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Banco Automático. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

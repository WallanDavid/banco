'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate auth
    setTimeout(() => {
      // In demo mode, any valid looking email works
      if (email.includes('admin')) {
        localStorage.setItem('userRole', 'admin');
      } else {
        localStorage.setItem('userRole', 'vendedor');
      }
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side: Brand & Visual */}
      <div className="lg:w-1/2 bg-blue-600 p-12 lg:p-24 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] -right-[10%] w-[600px] h-[600px] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] -left-[10%] w-[400px] h-[400px] bg-indigo-400 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center rotate-3 shadow-xl">
            <TrendingUp className="text-blue-600 w-7 h-7" />
          </div>
          <span className="text-3xl font-black italic tracking-tighter">Banco Automático</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter">
            A revolução do <br />
            <span className="text-blue-200">comercial digital.</span>
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-md leading-relaxed">
            Gerencie leads, automatize propostas e escale suas vendas com a potência da inteligência artificial.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-blue-500 border-2 border-blue-600 flex items-center justify-center text-[10px] font-black">
                  AM
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">+500 agentes ativos hoje</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-10 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Segurança Bancária</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Alta Performance</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="lg:w-1/2 p-12 lg:p-24 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Login</h2>
            <p className="text-gray-400 font-medium mt-2">Área restrita para agentes autorizados.</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl space-y-2">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Acesso de Demonstração
            </p>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Use qualquer e-mail para entrar. Se o e-mail contiver <span className="font-bold underline">&quot;admin&quot;</span>, você terá visão total do sistema.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@banco.com"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sua Senha</label>
                <a href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Esqueceu?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-white border border-gray-100 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar na Central
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-widest">
            Acesso protegido por autenticação de dois fatores.
          </p>
        </div>
      </div>
    </div>
  );
}

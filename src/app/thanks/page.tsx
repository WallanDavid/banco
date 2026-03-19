'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { storeCreateProposal, storeGetLead, type DemoLead } from '@/lib/supabase';

function profileLabel(profile: DemoLead['profile']) {
  switch (profile) {
    case 'clt':
      return 'CLT / Empregado Privado';
    case 'servidor_publico':
      return 'Servidor Público';
    case 'aposentado_pensionista':
      return 'Aposentado / Pensionista';
    default:
      return profile;
  }
}

export default function ThanksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ThanksInner />
    </Suspense>
  );
}

function ThanksInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get('leadId') ?? '';
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<DemoLead | null>(null);

  useEffect(() => {
    async function load() {
      if (!leadId) {
        setLoading(false);
        return;
      }
      try {
        const data = await storeGetLead(leadId);
        setLead(data.lead as DemoLead);
      } catch {
        setLead(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [leadId]);

  const whatsappHref = useMemo(() => {
    if (!lead) return '#';
    const phoneDigits = lead.phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá! Fiz uma simulação no Banco Automático. Meu vínculo é ${profileLabel(lead.profile)}. Quero seguir com a proposta.`
    );
    return `https://wa.me/55${phoneDigits}?text=${text}`;
  }, [lead]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] p-12 max-w-xl w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h2 className="text-4xl font-black text-gray-900 mb-4">
          Obrigado{lead?.name ? `, ${lead.name.split(' ')[0]}` : ''}!
        </h2>

        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Seu cadastro foi recebido com sucesso. {lead ? `Vínculo: ${profileLabel(lead.profile)}.` : ''}
        </p>

        <div className="bg-blue-50 p-6 rounded-3xl mb-10 flex items-center gap-4 text-left border border-blue-100">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900 uppercase tracking-widest">Próximo Passo</p>
            <p className="text-xs text-blue-700">
              {lead?.profile === 'clt'
                ? 'Siga para a autocontratação com a fintech parceira.'
                : 'Um consultor pode te chamar no WhatsApp em até 24h.'}
            </p>
          </div>
        </div>

        {lead?.profile === 'clt' && lead ? (
          <button
            onClick={async () => {
              const created = await storeCreateProposal(lead.id);
              router.push(created.proposal.contractUrl);
            }}
            className="w-full inline-flex items-center justify-center gap-3 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 group"
          >
            Contratar Agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 group"
          >
            Falar no WhatsApp
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
        )}

        <div className="mt-10 flex items-center justify-center gap-3 text-gray-400">
          <TrendingUp className="w-5 h-5" />
          <Link href="/" className="text-xs font-black uppercase tracking-widest hover:text-gray-600">
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

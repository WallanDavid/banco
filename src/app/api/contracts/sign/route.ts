import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { proposal_id } = await req.json();

    if (!proposal_id) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    // 1. Get proposal data
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // 2. Create contract in database
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert([
        {
          proposal_id,
          lead_id: proposal.lead_id,
          status: 'signed',
          signed_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (contractError) throw contractError;

    // 3. Update proposal status
    await supabase.from('proposals').update({ status: 'accepted' }).eq('id', proposal_id);

    // 4. Update lead status to 'Fechado Ganho'
    const { data: pipelineData } = await supabase
      .from('pipelines')
      .select('id')
      .eq('name', 'Fechado Ganho')
      .single();

    if (pipelineData) {
      await supabase
        .from('leads')
        .update({ status_id: pipelineData.id })
        .eq('id', proposal.lead_id);
    }

    // 5. Generate PIX payment automatically
    const pixAmount = 0.01; // Simulation: 1 cent for test
    const pixCode = `00020101021126580014BR.GOV.BCB.PIX0136b5c3e5a7-9d6f-4c8e-b5c3-e5a79d6f4c8e5204000053039865404${pixAmount.toFixed(2)}5802BR5913BANCO_AUTOMAT6008SAO_PAULO62070503***6304E2D5`;

    const { data: payment } = await supabase.from('payments').insert([
      {
        contract_id: contract.id,
        amount: pixAmount,
        status: 'pending',
        pix_code: pixCode
      }
    ]).select().single();

    // 6. Notify lead via bot
    await supabase.from('messages').insert([
      {
        lead_id: proposal.lead_id,
        sender: 'bot',
        content: `🎉 Parabéns! Seu contrato foi assinado com sucesso. Agora, realize o pagamento do PIX de simulação para liberar o crédito em sua conta. PIX: ${pixCode}`,
        type: 'whatsapp',
        status: 'sent'
      }
    ]);

    return NextResponse.json({ success: true, contract, payment });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('Error signing contract:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

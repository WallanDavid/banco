import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { simulateCredit } from '@/lib/credit-logic';

export async function POST(req: Request) {
  try {
    const { lead_id } = await req.json();

    if (!lead_id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // 1. Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Perform simulation
    const simulationResult = simulateCredit({
      salary: lead.salary,
      age: lead.age,
      loan_amount: lead.loan_amount,
    });

    // 3. Store proposal in database
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert([
        {
          lead_id,
          simulation_data: simulationResult,
          status: 'pending',
          file_url: `https://storage.banco-automatico.com/proposals/${lead_id}.pdf` // Mock URL
        }
      ])
      .select()
      .single();

    if (proposalError) throw proposalError;

    // 4. Update lead status to 'Proposta Enviada'
    const { data: pipelineData } = await supabase
      .from('pipelines')
      .select('id')
      .eq('name', 'Proposta Enviada')
      .single();

    if (pipelineData) {
      await supabase
        .from('leads')
        .update({ status_id: pipelineData.id })
        .eq('id', lead_id);
    }

    // 5. Create automation message
    await supabase.from('messages').insert([
      {
        lead_id,
        sender: 'bot',
        content: `Olá ${lead.name.split(' ')[0]}, sua proposta de crédito consignado foi gerada! Acesse aqui: ${proposal.file_url}`,
        type: 'whatsapp',
        status: 'sent'
      }
    ]);

    return NextResponse.json({ success: true, proposal });

  } catch (err: any) {
    console.error('Error generating proposal:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { lead_id, message } = await req.json();

    if (!lead_id || !message) {
      return NextResponse.json({ error: 'Lead ID and message are required' }, { status: 400 });
    }

    // 1. Get lead data for context
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Call OpenAI for response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use 3.5 for faster, cheaper responses
      messages: [
        {
          role: "system",
          content: `Você é um assistente virtual do "Banco Automático", especialista em crédito consignado no Brasil. 
          Sua função é atender o cliente, tirar dúvidas e incentivá-lo a fechar a proposta.
          Seja cordial, profissional e use um tom consultivo.
          Contexto do cliente: Nome: ${lead.name}, Salário: R$ ${lead.salary}, Idade: ${lead.age}, Valor desejado: R$ ${lead.loan_amount}.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const botResponse = completion.choices[0].message.content || 'Entendi, um consultor entrará em contato em breve.';

    // 3. Store bot response in database
    const { data: savedMessage, error: saveError } = await supabase.from('messages').insert([
      {
        lead_id,
        sender: 'bot',
        content: botResponse,
        type: 'whatsapp',
        status: 'sent'
      }
    ]).select().single();

    if (saveError) throw saveError;

    // 4. Update Lead Score based on interaction
    const currentScore = lead.score || 0;
    const newScore = Math.min(100, currentScore + 5); // Simple scoring: +5 per interaction
    await supabase.from('leads').update({ score: newScore }).eq('id', lead_id);

    return NextResponse.json({ success: true, message: savedMessage, score: newScore });

  } catch (err: any) {
    console.error('Error in AI chat:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

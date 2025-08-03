import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Payment webhook function started');

// Inicializar Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Aceitar requisições POST e GET (para testes)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Para requisições GET, retornar status OK (útil para testes)
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'Webhook is running',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Processar notificação do Mercado Pago
    const notification = await req.json();
    console.log('Notificação recebida:', JSON.stringify(notification, null, 2));

    // Verificar se é uma notificação de pagamento
    if (notification.type === 'payment' && notification.action === 'payment.updated') {
      const paymentId = notification.data?.id;
      
      if (paymentId) {
        console.log('Processando pagamento ID:', paymentId);
        
        // Para testes, vamos simular que o pagamento foi aprovado
        // Em produção, você faria uma consulta à API do Mercado Pago aqui
        
        // Buscar consulta pelo payment_id
        const { data: consultation, error: findError } = await supabase
          .from('consultations')
          .select('*')
          .eq('payment_id', paymentId.toString())
          .single();
          
        if (findError) {
          console.log('Consulta não encontrada para payment_id:', paymentId);
          // Não é erro crítico, pode ser um pagamento de outro sistema
        } else if (consultation) {
          console.log('Consulta encontrada:', consultation.id);
          
          // Atualizar status da consulta para PAID
          const { error: updateError } = await supabase
            .from('consultations')
            .update({ 
              status: 'PAID',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', consultation.id);
            
          if (updateError) {
            console.error('Erro ao atualizar consulta:', updateError);
          } else {
            console.log('Consulta atualizada para PAID');
            
            // Obter próxima posição na fila
            const { data: queueData } = await supabase
              .from('consultation_queue')
              .select('position')
              .order('position', { ascending: false })
              .limit(1);

            const nextPosition = queueData && queueData.length > 0 ? queueData[0].position + 1 : 1;
            
            // Adicionar à fila de consulta
            const { error: queueError } = await supabase
              .from('consultation_queue')
              .insert({
                consultation_id: consultation.id,
                user_id: consultation.user_id,
                specialty_id: consultation.specialty_id,
                position: nextPosition,
                status: 'WAITING',
                estimated_wait_minutes: nextPosition * 5,
                created_at: new Date().toISOString()
              });
              
            if (queueError) {
              console.error('Erro ao adicionar à fila:', queueError);
            } else {
              console.log('Paciente adicionado à fila com sucesso');
            }
          }
        }
      }
    }

    // Responder ao Mercado Pago
    return new Response(JSON.stringify({ 
      status: 'OK',
      message: 'Notification processed successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

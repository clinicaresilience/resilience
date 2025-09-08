import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = params;

    // Verificar se o usuário é o próprio profissional ou admin
    if (profissionalId !== user.id) {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('tipo_usuario')
        .eq('id', user.id)
        .single();

      if (userError || userData?.tipo_usuario !== 'administrador') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Gerar slots para os próximos 30 dias
    const hoje = new Date();
    const slots: { data: string; horario: string; disponivel: boolean }[] = [];
    
    for (let i = 1; i <= 30; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + i);
      
      // Pular fins de semana (0 = domingo, 6 = sábado)
      if (data.getDay() === 0 || data.getDay() === 6) {
        continue;
      }
      
      const dataStr = data.toISOString().split('T')[0];
      
      // Buscar agendamentos existentes para esta data
      const { data: agendamentosExistentes } = await supabase
        .from('agendamentos')
        .select('data_hora')
        .eq('profissional_id', profissionalId)
        .gte('data_hora', `${dataStr}T00:00:00Z`)
        .lt('data_hora', `${dataStr}T23:59:59Z`)
        .neq('status', 'cancelado');

      const horariosOcupados = new Set(
        agendamentosExistentes?.map(a => {
          const hora = new Date(a.data_hora).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo'
          });
          return hora;
        }) || []
      );

      // Horários padrão de funcionamento (8h às 18h, de hora em hora)
      const horariosTrabalho = [
        '08:00', '09:00', '10:00', '11:00', 
        '14:00', '15:00', '16:00', '17:00'
      ];

      horariosTrabalho.forEach(horario => {
        slots.push({
          data: dataStr,
          horario: horario,
          disponivel: !horariosOcupados.has(horario)
        });
      });
    }

    return NextResponse.json(slots);

  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

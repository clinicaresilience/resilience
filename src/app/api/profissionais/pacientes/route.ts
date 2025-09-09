import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profissional_id from query parameters
    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissional_id');

    if (!profissionalId) {
      return NextResponse.json(
        { error: 'profissional_id is required' },
        { status: 400 }
      );
    }

    // Verify if the user is authorized to access this professional's data
    if (profissionalId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify if user is a professional
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || userData?.tipo_usuario !== 'profissional') {
      console.error('User verification error:', userError);
      return NextResponse.json({ error: 'Access denied - not a professional' }, { status: 403 });
    }

    // Fetch consultas for this professional (replacing agendamentos)
    const { data: consultas, error: consultasError } = await supabase
      .from('consultas')
      .select(`
        id,
        paciente_id,
        profissional_id,
        data_consulta,
        status,
        modalidade,
        local,
        observacoes,
        status_consulta,
        prontuario,
        agendamento_id
      `)
      .eq('profissional_id', profissionalId)
      .order('data_consulta', { ascending: false });

    if (consultasError) {
      console.error('Error fetching consultas:', consultasError);
      return NextResponse.json(
        { error: 'Error fetching consultations', detail: consultasError.message },
        { status: 500 }
      );
    }

    // Get unique patient IDs from consultas
    const pacienteIds = Array.from(
      new Set(consultas?.map((c) => c.paciente_id).filter(Boolean))
    );

    let prontuarios: Array<Record<string, unknown>> = [];
    let pacientes: Array<Record<string, unknown>> = [];

    if (pacienteIds.length > 0) {
      // Fetch prontuarios (consultas with prontuario field not null)
      const consultasComProntuario = consultas?.filter(c => c.prontuario) || [];
      
      // Transform consultas with prontuarios to match expected format
      prontuarios = consultasComProntuario.map(consulta => ({
        id: consulta.id,
        usuario_id: consulta.paciente_id,
        dataConsulta: consulta.data_consulta,
        tipoConsulta: consulta.modalidade || 'Consulta',
        observacoes: consulta.observacoes || '',
        diagnostico: '', // Not available in current schema
        prescricoes: [], // Not available in current schema
        prontuario_url: consulta.prontuario
      }));

      // Fetch patient data
      const { data: pacData, error: pacError } = await supabase
        .from('usuarios')
        .select('id, nome, email, ativo')
        .in('id', pacienteIds);

      if (pacError) {
        console.error('Error fetching patients:', pacError);
        return NextResponse.json(
          { error: 'Error fetching patients', detail: pacError.message },
          { status: 500 }
        );
      }

      // Map the patient data and convert 'ativo' field to expected 'status' format
      pacientes = pacData?.map(paciente => ({
        ...paciente,
        status: paciente.ativo ? 'ativo' : 'inativo'
      })) || [];
    }

    // Transform consultas to match expected agendamentos format for backward compatibility
    const agendamentos = consultas?.map(consulta => ({
      id: consulta.id,
      paciente_id: consulta.paciente_id,
      profissional_id: consulta.profissional_id,
      data_consulta: consulta.data_consulta,
      status: consulta.status_consulta || consulta.status,
      especialidade: consulta.modalidade || 'Consulta',
      notas: consulta.observacoes
    })) || [];

    console.log(`Successfully fetched data for professional ${profissionalId}:`, {
      consultasCount: consultas?.length || 0,
      pacientesCount: pacientes.length,
      prontuariosCount: prontuarios.length
    });

    return NextResponse.json({
      agendamentos,
      prontuarios,
      pacientes,
    });

  } catch (error) {
    console.error('Error in pacientes API:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

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

    // Fetch agendamentos for this professional
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select(`
        id,
        paciente_id,
        profissional_id,
        data_consulta,
        status,
        modalidade,
        notas,
        paciente:usuarios!agendamentos_paciente_id_fkey(nome, email, telefone)
      `)
      .eq('profissional_id', profissionalId)
      .order('data_consulta', { ascending: false });

    if (agendamentosError) {
      console.error('Error fetching agendamentos:', agendamentosError);
      return NextResponse.json(
        { error: 'Error fetching appointments', detail: agendamentosError.message },
        { status: 500 }
      );
    }

    // Get unique patient IDs from agendamentos
    const pacienteIds = Array.from(
      new Set(agendamentos?.map((a) => a.paciente_id).filter(Boolean))
    );

    let pacientes: Array<Record<string, unknown>> = [];

    if (pacienteIds.length > 0) {
      // Fetch patient data with appointment information
      const { data: pacData, error: pacError } = await supabase
        .from('usuarios')
        .select('id, nome, email, telefone, ativo')
        .in('id', pacienteIds);

      if (pacError) {
        console.error('Error fetching patients:', pacError);
        return NextResponse.json(
          { error: 'Error fetching patients', detail: pacError.message },
          { status: 500 }
        );
      }

      // Map the patient data and convert 'ativo' field to expected 'status' format
      // Also include appointment count for each patient
      pacientes = pacData?.map(paciente => {
        const patientAppointments = agendamentos?.filter(a => a.paciente_id === paciente.id) || [];
        return {
          ...paciente,
          status: paciente.ativo ? 'ativo' : 'inativo',
          totalAgendamentos: patientAppointments.length,
          ultimoAgendamento: patientAppointments.length > 0 ?
            patientAppointments.sort((a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime())[0].data_consulta :
            null
        };
      }) || [];
    }

    // For now, return empty prontuarios array since we're focusing on patients
    const prontuarios: Array<Record<string, unknown>> = [];

    console.log(`Successfully fetched data for professional ${profissionalId}:`, {
      agendamentosCount: agendamentos?.length || 0,
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

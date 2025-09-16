import { NextRequest, NextResponse } from 'next/server';
import { ExceptionLimitsService } from '@/services/database/exception-limits.service';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (!userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const profissional_id = searchParams.get('profissional_id') || undefined;
    const tipo_excecao = searchParams.get('tipo_excecao') || undefined;
    const ativo = searchParams.get('ativo');

    const filters: {
      profissional_id?: string;
      tipo_excecao?: string;
      ativo?: boolean;
    } = {};
    
    if (profissional_id) filters.profissional_id = profissional_id;
    if (tipo_excecao) filters.tipo_excecao = tipo_excecao;
    if (ativo !== null) filters.ativo = ativo === 'true';

    const limits = await ExceptionLimitsService.listExceptionLimits(filters);
    
    return NextResponse.json({ success: true, data: limits });
  } catch (error) {
    console.error('Erro ao buscar limites de exceção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (!userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { profissional_id, tipo_excecao, limite_diario, ativo } = body;

    if (!tipo_excecao || !limite_diario) {
      return NextResponse.json(
        { error: 'Tipo de exceção e limite diário são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um limite para este profissional e tipo
    const existingLimits = await ExceptionLimitsService.listExceptionLimits({
      profissional_id: profissional_id || undefined,
      tipo_excecao,
      ativo: true
    });

    if (existingLimits.length > 0) {
      return NextResponse.json(
        { 
          error: profissional_id 
            ? 'Já existe um limite ativo para este profissional e tipo de exceção'
            : 'Já existe um limite global ativo para este tipo de exceção'
        },
        { status: 400 }
      );
    }

    const limit = await ExceptionLimitsService.createExceptionLimit({
      profissional_id: profissional_id || null,
      tipo_excecao,
      limite_diario,
      ativo
    });

    return NextResponse.json({ success: true, data: limit }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar limite de exceção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

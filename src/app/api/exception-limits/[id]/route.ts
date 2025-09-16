import { NextRequest, NextResponse } from 'next/server';
import { ExceptionLimitsService } from '@/services/database/exception-limits.service';
import { createClient } from '@/lib/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const limitId = params.id;
    const body = await request.json();

    const updatedLimit = await ExceptionLimitsService.updateExceptionLimit(limitId, body);

    return NextResponse.json({ success: true, data: updatedLimit });
  } catch (error) {
    console.error('Erro ao atualizar limite de exceção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const limitId = params.id;
    await ExceptionLimitsService.deleteExceptionLimit(limitId);

    return NextResponse.json({ success: true, message: 'Limite de exceção removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar limite de exceção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const limitId = params.id;
    const limit = await ExceptionLimitsService.getExceptionLimitById(limitId);

    if (!limit) {
      return NextResponse.json({ error: 'Limite não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: limit });
  } catch (error) {
    console.error('Erro ao buscar limite de exceção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

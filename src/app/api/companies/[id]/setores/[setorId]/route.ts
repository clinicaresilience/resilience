import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { CompanySectorsService } from '@/services/database/company-sectors.service';

// PUT /api/companies/[id]/setores/[setorId]
// Atualizar setor (apenas administradores)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; setorId: string } }
) {
  try {
    const supabase = await createClient();
    const { id: empresaId, setorId } = params;

    if (!empresaId || !setorId) {
      return NextResponse.json(
        { error: 'ID da empresa e do setor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o setor existe e pertence à empresa
    const setor = await CompanySectorsService.getSectorById(setorId);

    if (!setor) {
      return NextResponse.json(
        { error: 'Setor não encontrado' },
        { status: 404 }
      );
    }

    if (setor.empresa_id !== empresaId) {
      return NextResponse.json(
        { error: 'Setor não pertence a esta empresa' },
        { status: 400 }
      );
    }

    // Validar body
    const body = await request.json();
    const { nome, ativo } = body;

    // Se está alterando o nome, verificar duplicidade
    if (nome && nome.trim() !== setor.nome) {
      const exists = await CompanySectorsService.sectorNameExists(
        empresaId,
        nome,
        setorId
      );

      if (exists) {
        return NextResponse.json(
          { error: 'Já existe um setor com este nome nesta empresa' },
          { status: 400 }
        );
      }
    }

    // Atualizar setor
    const updatedSetor = await CompanySectorsService.updateSector(setorId, {
      nome,
      ativo,
    });

    return NextResponse.json(updatedSetor, { status: 200 });
  } catch (error: unknown) {
    console.error('Erro ao atualizar setor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id]/setores/[setorId]
// Deletar setor (apenas administradores)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; setorId: string } }
) {
  try {
    const supabase = await createClient();
    const { id: empresaId, setorId } = params;

    if (!empresaId || !setorId) {
      return NextResponse.json(
        { error: 'ID da empresa e do setor são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o setor existe e pertence à empresa
    const setor = await CompanySectorsService.getSectorById(setorId);

    if (!setor) {
      return NextResponse.json(
        { error: 'Setor não encontrado' },
        { status: 404 }
      );
    }

    if (setor.empresa_id !== empresaId) {
      return NextResponse.json(
        { error: 'Setor não pertence a esta empresa' },
        { status: 400 }
      );
    }

    // Deletar setor
    await CompanySectorsService.deleteSector(setorId);

    return NextResponse.json(
      { success: true, message: 'Setor deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Erro ao deletar setor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

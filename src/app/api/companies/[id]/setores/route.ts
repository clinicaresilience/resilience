import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { CompanySectorsService } from '@/services/database/company-sectors.service';

// GET /api/companies/[id]/setores
// Listar setores de uma empresa (público - para uso no questionário)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const empresaId = params.id;

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a empresa existe
    const supabase = await createClient();
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', empresaId)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar query params
    const { searchParams } = new URL(request.url);
    const ativoParam = searchParams.get('ativo');

    const filters: { ativo?: boolean } = {};
    if (ativoParam !== null) {
      filters.ativo = ativoParam === 'true';
    }

    const setores = await CompanySectorsService.listSectorsByCompany(
      empresaId,
      filters
    );

    return NextResponse.json(setores, { status: 200 });
  } catch (error: unknown) {
    console.error('Erro ao buscar setores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/setores
// Criar novo setor (apenas administradores)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const empresaId = params.id;

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
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

    // Verificar se a empresa existe
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', empresaId)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Validar body
    const body = await request.json();
    const { nome, ativo } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: 'Nome do setor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe um setor com esse nome
    const exists = await CompanySectorsService.sectorNameExists(
      empresaId,
      nome
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Já existe um setor com este nome nesta empresa' },
        { status: 400 }
      );
    }

    // Criar setor
    const setor = await CompanySectorsService.createSector(empresaId, {
      nome,
      ativo,
    });

    return NextResponse.json(setor, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar setor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

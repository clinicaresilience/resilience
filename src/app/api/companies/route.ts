import { NextRequest, NextResponse } from 'next/server';
import { CompaniesService } from '@/services/database/companies.service';
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
    const search = searchParams.get('search') || undefined;
    const ativa = searchParams.get('ativa');

    const filters: {
      search?: string;
      ativa?: boolean;
    } = {};
    if (search) filters.search = search;
    if (ativa !== null) filters.ativa = ativa === 'true';

    const companies = await CompaniesService.listCompanies(filters);
    
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
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
    const { nome, codigo } = body;

    if (!nome || !codigo) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o código já existe
    const codeExists = await CompaniesService.companyCodeExists(codigo);
    if (codeExists) {
      return NextResponse.json(
        { error: 'Código de empresa já existente' },
        { status: 400 }
      );
    }

    const company = await CompaniesService.createCompany({
      nome: nome.trim(),
      codigo: codigo.toUpperCase().trim(),
      ativa: true
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

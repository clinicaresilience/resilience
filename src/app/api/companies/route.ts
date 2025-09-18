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
  } catch (error: unknown) {
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
    const { 
      nome, 
      codigo, 
      nome_fantasia,
      cnpj,
      inscricao_estadual,
      inscricao_municipal,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep
    } = body;

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
      nome_fantasia: nome_fantasia?.trim() || null,
      cnpj: cnpj || null,
      inscricao_estadual: inscricao_estadual?.trim() || null,
      inscricao_municipal: inscricao_municipal?.trim() || null,
      endereco_logradouro: endereco_logradouro?.trim() || null,
      endereco_numero: endereco_numero?.trim() || null,
      endereco_complemento: endereco_complemento?.trim() || null,
      endereco_bairro: endereco_bairro?.trim() || null,
      endereco_cidade: endereco_cidade?.trim() || null,
      endereco_estado: endereco_estado?.trim()?.toUpperCase() || null,
      endereco_cep: endereco_cep || null,
      ativa: true
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const companyId = searchParams.get('id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const company = await CompaniesService.updateCompany(companyId, body);

    return NextResponse.json(company);
  } catch (error: unknown) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CompaniesService } from '@/services/database/companies.service';
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

    const companyId = params.id;
    const body = await request.json();

    // Clean and prepare the data
    const cleanedData = {
      nome: body.nome?.trim(),
      codigo: body.codigo?.toUpperCase().trim(),
      nome_fantasia: body.nome_fantasia?.trim() || null,
      cnpj: body.cnpj || null,
      inscricao_estadual: body.inscricao_estadual?.trim() || null,
      inscricao_municipal: body.inscricao_municipal?.trim() || null,
      endereco_logradouro: body.endereco_logradouro?.trim() || null,
      endereco_numero: body.endereco_numero?.trim() || null,
      endereco_complemento: body.endereco_complemento?.trim() || null,
      endereco_bairro: body.endereco_bairro?.trim() || null,
      endereco_cidade: body.endereco_cidade?.trim() || null,
      endereco_estado: body.endereco_estado?.trim()?.toUpperCase() || null,
      endereco_cep: body.endereco_cep || null,
      ativa: body.ativa
    };

    const company = await CompaniesService.updateCompany(companyId, cleanedData);

    return NextResponse.json(company);
  } catch (error: unknown) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

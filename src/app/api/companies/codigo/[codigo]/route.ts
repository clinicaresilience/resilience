import { NextRequest, NextResponse } from 'next/server';
import { CompaniesService } from '@/services/database/companies.service';

export async function GET(request: NextRequest, { params }: { params: { codigo: string } }) {
  try {
    const codigo = params.codigo;

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 }
      );
    }

    const company = await CompaniesService.getCompanyByCode(codigo);

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a empresa está ativa
    if (!company.ativa) {
      return NextResponse.json(
        { error: 'Empresa não está ativa' },
        { status: 403 }
      );
    }

    return NextResponse.json(company);
  } catch (error: unknown) {
    console.error('Erro ao buscar empresa por código:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

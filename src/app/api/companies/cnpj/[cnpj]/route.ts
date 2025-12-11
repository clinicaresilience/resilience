import { NextRequest, NextResponse } from 'next/server';
import { CompaniesService } from '@/services/database/companies.service';

export async function GET(request: NextRequest, { params }: { params: { cnpj: string } }) {
  try {
    const cnpj = params.cnpj;

    if (!cnpj) {
      return NextResponse.json(
        { error: 'CNPJ é obrigatório' },
        { status: 400 }
      );
    }

    const company = await CompaniesService.getCompanyByCnpj(cnpj);

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error: unknown) {
    console.error('Erro ao buscar empresa por CNPJ:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

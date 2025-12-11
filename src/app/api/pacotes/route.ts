import { NextResponse } from 'next/server';
import { PacotesService } from '@/services/database/pacotes.service';

export async function GET() {
  try {
    const pacotes = await PacotesService.listarPacotesAtivos();

    return NextResponse.json({
      success: true,
      data: pacotes,
    });
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar pacotes',
      },
      { status: 500 }
    );
  }
}

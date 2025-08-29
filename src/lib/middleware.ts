import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware no-op para ambiente de mock.
 * Não realiza verificações de sessão Supabase; apenas deixa a requisição seguir.
 * Se desejar bloquear por ausência de sessão mock, podemos implementar uma verificação aqui.
 */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}

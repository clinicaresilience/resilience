import { createClient } from '@/lib/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  if (!token_hash && !code) {
    console.error('Nenhum token ou código fornecido')
    redirect('/auth/error?message=codigo-invalido')
  }

  try {
    const supabase = await createClient()
    let authError = null
    let userData = null

    // Verifica se é o novo formato de confirmação (code) ou antigo (token_hash)
    if (code) {
      // Novo formato - usar exchangeCodeForSession
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      authError = error
      userData = data?.user
    } else if (token_hash && type) {
      // Formato antigo - usar verifyOtp
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      authError = error
      userData = data?.user
    }

    if (authError) {
      console.error('Erro ao confirmar email:', authError)
      redirect('/auth/error?message=erro-confirmacao')
    }

    if (!userData) {
      console.error('Usuário não encontrado após confirmação')
      redirect('/auth/error?message=usuario-nao-encontrado')
    }

    // Atualizar status de autenticação na tabela usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        autenticado: true,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Erro ao atualizar status de autenticação:', updateError)
      // Não redirecionar para erro aqui pois o usuário já está autenticado
      // Apenas logar o erro
    }

    console.log('Email confirmado com sucesso para usuário:', userData.id)

    // Buscar dados do usuário para determinar redirecionamento
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario, primeiro_acesso, boas_vindas')
      .eq('id', userData.id)
      .single()

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError)
      // Redirecionar para página padrão
      redirect('/protected')
    }

    // Redirecionar baseado no tipo de usuário e primeiro acesso
    let redirectUrl = '/'
    
    if (usuario.tipo_usuario === 'comum') {
      if (usuario.primeiro_acesso || usuario.boas_vindas) {
        redirectUrl = '/tela-usuario?welcome=true'
      } else {
        redirectUrl = '/tela-usuario'
      }
    } else if (usuario.tipo_usuario === 'profissional') {
      redirectUrl = '/tela-profissional'
    } else if (usuario.tipo_usuario === 'administrador') {
      redirectUrl = '/painel-administrativo'
    } else {
      redirectUrl = '/protected'
    }

    redirect(redirectUrl)

  } catch (error) {
    console.error('Erro inesperado na confirmação:', error)
    redirect('/auth/error?message=erro-inesperado')
  }
}

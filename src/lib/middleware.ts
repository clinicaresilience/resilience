import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_PROJECT_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/portal-publico',
    '/auth/login',
    '/auth/cadastro',
    '/auth/forgot-password',
    '/auth/error',
    '/auth/sign-up-success'
  ]

  // Rotas protegidas por tipo de usuário
  const protectedRoutes = {
    admin: ['/painel-administrativo'],
    professional: ['/tela-profissional'],
    user: ['/tela-usuario']
  }

  // Se usuário está tentando acessar login e já está logado, redirecionar para painel
  if (pathname === '/auth/login' && user) {
    // Buscar tipo de usuário
    const { data: userData } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (userData) {
      const dest = userData.tipo_usuario === 'administrador' 
        ? '/painel-administrativo'
        : userData.tipo_usuario === 'profissional'
        ? '/tela-profissional'
        : '/tela-usuario'
      
      url.pathname = dest
      return NextResponse.redirect(url)
    }
  }

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Se é rota pública, permitir acesso
  if (isPublicRoute) {
    return response
  }

  // Se não há usuário logado e está tentando acessar rota protegida
  if (!user) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Verificar permissões para rotas protegidas
  const { data: userData } = await supabase
    .from('usuarios')
    .select('tipo_usuario')
    .eq('id', user.id)
    .single()

  if (userData) {
    const userType = userData.tipo_usuario

    // Verificar se usuário tem permissão para acessar a rota
    const isAdminRoute = pathname.startsWith('/painel-administrativo')
    const isProfessionalRoute = pathname.startsWith('/tela-profissional')
    const isUserRoute = pathname.startsWith('/tela-usuario')

    // Redirecionar para painel correto se estiver na rota errada
    if (isAdminRoute && userType !== 'administrador') {
      url.pathname = userType === 'profissional' ? '/tela-profissional' : '/tela-usuario'
      return NextResponse.redirect(url)
    }

    if (isProfessionalRoute && userType !== 'profissional') {
      url.pathname = userType === 'administrador' ? '/painel-administrativo' : '/tela-usuario'
      return NextResponse.redirect(url)
    }

    if (isUserRoute && userType !== 'comum') {
      url.pathname = userType === 'administrador' ? '/painel-administrativo' : '/tela-profissional'
      return NextResponse.redirect(url)
    }
  }

  return response
}

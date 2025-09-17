/**
 * Middleware centralizado para autenticação e autorização
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { hasAdminAccess, isProfessional, isPatient, SECURITY_ERRORS, UserRole } from '@/lib/security';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tipo_usuario: UserRole;
}

/**
 * Verifica se o usuário está autenticado e retorna seus dados
 */
export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, email, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || userData.email,
      tipo_usuario: userData.tipo_usuario as UserRole,
    };
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return null;
  }
}

/**
 * Middleware que requer autenticação
 */
export async function requireAuth(req: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    return NextResponse.json(
      { error: SECURITY_ERRORS.UNAUTHORIZED },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware que requer acesso administrativo
 */
export async function requireAdmin(req: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Retorna erro de autenticação
  }

  const { user } = authResult;

  if (!hasAdminAccess(user.tipo_usuario)) {
    return NextResponse.json(
      { error: SECURITY_ERRORS.ADMIN_REQUIRED },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware que requer acesso de profissional
 */
export async function requireProfessional(req: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Retorna erro de autenticação
  }

  const { user } = authResult;

  if (!isProfessional(user.tipo_usuario) && !hasAdminAccess(user.tipo_usuario)) {
    return NextResponse.json(
      { error: SECURITY_ERRORS.PROFESSIONAL_REQUIRED },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware que requer acesso a prontuários (admin ou profissional)
 */
export async function requireMedicalRecordAccess(req: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Retorna erro de autenticação
  }

  const { user } = authResult;

  if (!hasAdminAccess(user.tipo_usuario) && !isProfessional(user.tipo_usuario)) {
    return NextResponse.json(
      { error: 'Acesso restrito a administradores e profissionais' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware que verifica se o usuário pode acessar recursos de um paciente específico
 */
export async function requirePatientResourceAccess(
  req: NextRequest, 
  pacienteId: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Retorna erro de autenticação
  }

  const { user } = authResult;

  // Admin tem acesso a tudo
  if (hasAdminAccess(user.tipo_usuario)) {
    return { user };
  }

  // Paciente só pode acessar seus próprios recursos
  if (isPatient(user.tipo_usuario) && user.id !== pacienteId) {
    return NextResponse.json(
      { error: SECURITY_ERRORS.FORBIDDEN },
      { status: 403 }
    );
  }

  // Profissionais precisam verificar se têm acesso ao paciente
  if (isProfessional(user.tipo_usuario)) {
    try {
      const supabase = await createClient();
      
      // Verificar se o profissional tem prontuário ativo para este paciente
      const { data: prontuario } = await supabase
        .from('prontuarios')
        .select('id')
        .eq('paciente_id', pacienteId)
        .eq('profissional_atual_id', user.id)
        .maybeSingle();

      if (!prontuario) {
        return NextResponse.json(
          { error: 'Você não tem acesso aos recursos deste paciente' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Erro ao verificar acesso do profissional:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }
  }

  return { user };
}

/**
 * Utilitário para validar tipos de usuário em middleware customizado
 */
export function createRoleMiddleware(allowedRoles: UserRole[]) {
  return async (req: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> => {
    const authResult = await requireAuth(req);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Retorna erro de autenticação
    }

    const { user } = authResult;

    if (!allowedRoles.includes(user.tipo_usuario)) {
      return NextResponse.json(
        { error: SECURITY_ERRORS.FORBIDDEN },
        { status: 403 }
      );
    }

    return { user };
  };
}

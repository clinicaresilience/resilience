/**
 * Utilitário centralizado para validação de segurança e controle de acesso
 */

export const ROLES = {
  ADMIN: 'administrador',
  PROFESSIONAL: 'profissional', 
  USER: 'comum'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Verifica se o usuário é administrador
 */
export function isAdmin(userType: string): boolean {
  return userType === ROLES.ADMIN;
}

/**
 * Verifica se o usuário é profissional
 */
export function isProfessional(userType: string): boolean {
  return userType === ROLES.PROFESSIONAL;
}

/**
 * Verifica se o usuário é paciente/usuário comum
 */
export function isPatient(userType: string): boolean {
  return userType === ROLES.USER;
}

/**
 * Verifica se o usuário tem acesso administrativo
 * IMPORTANTE: Use apenas esta função para verificar acesso admin
 */
export function hasAdminAccess(userType: string): boolean {
  return isAdmin(userType);
}

/**
 * Verifica se o usuário pode acessar prontuários
 */
export function canAccessMedicalRecords(userType: string): boolean {
  return isAdmin(userType) || isProfessional(userType);
}

/**
 * Verifica se o usuário pode modificar dados de outros usuários
 */
export function canModifyUserData(userType: string): boolean {
  return isAdmin(userType);
}

/**
 * Valida se o tipo de usuário é válido
 */
export function isValidUserType(userType: string): userType is UserRole {
  return Object.values(ROLES).includes(userType as UserRole);
}

/**
 * Mensagens de erro padronizadas
 */
export const SECURITY_ERRORS = {
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  ADMIN_REQUIRED: 'Acesso restrito a administradores',
  PROFESSIONAL_REQUIRED: 'Acesso restrito a profissionais',
  INVALID_USER_TYPE: 'Tipo de usuário inválido'
} as const;

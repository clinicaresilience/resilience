export type TipoUsuario = 'administrador' | 'profissional' | 'usuario'

export interface UsuarioMock {
  id: string
  email: string
  senha: string
  tipo_usuario: TipoUsuario
  nome: string
}

export const MOCK_USERS: UsuarioMock[] = [
  {
    id: 'admin-1',
    email: 'admin@admin.com',
    senha: 'admin123',
    tipo_usuario: 'administrador',
    nome: 'Administrador',
  },
  {
    id: 'prof-1',
    email: 'profissional@teste.com',
    senha: 'prof123',
    tipo_usuario: 'profissional',
    nome: 'Profissional Demo',
  },
  {
    id: 'user-1',
    email: 'usuario@teste.com',
    senha: 'user123',
    tipo_usuario: 'usuario',
    nome: 'Usuário Demo',
  },
]

export function findByEmail(email: string): UsuarioMock | undefined {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findById(id: string): UsuarioMock | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

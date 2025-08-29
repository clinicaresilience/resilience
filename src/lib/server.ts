import { createMockServerClient } from './mock-server-auth'

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient() {
  // Mantém assinatura async por compatibilidade
  return createMockServerClient()
}

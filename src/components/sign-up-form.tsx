'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react'
import Link from 'next/link'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/sign-up-success')
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="bg-white w-[380px] border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6" />
            Criar Conta
          </CardTitle>
          <CardDescription className="text-green-100">
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
                className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="repeat-password"
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Conta criada com sucesso! Redirecionando...
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-12 text-white font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando conta...
                </div>
              ) : success ? (
                "Conta criada!"
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
          
          {/* Link para login */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Já possui cadastro?{" "}
              <Link 
                href="/auth/login" 
                className="text-green-600 hover:text-green-800 font-medium underline transition-colors"
              >
                Faça login para realizar agendamento
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

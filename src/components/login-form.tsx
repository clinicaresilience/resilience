"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setCarregando(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;

      // Login ok, mostra mensagem
      setSucesso(true);

      // Opcional: espera 2 segundos e redireciona
      setTimeout(() => {
        router.push("/protected");
      }, 2000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro");
      setSucesso(false);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="bg-white w-[350px] h-[400px] border-[1px] relative border-gray-500 flex flex-col justify-evenly text-azul-escuro-secundario shadow-gray-200 drop-shadow-sm  ">
        <CardHeader>
          <span
            onClick={() => router.back()}
            className="cursor-pointer text-gray-400 font-medium text-md under "
          >
            Voltar
          </span>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  className="focus:ring-1"
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={carregando || sucesso}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  className="focus:ring-1"
                  id="password"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando || sucesso}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {sucesso && (
                <p className="text-sm text-green-600">
                  Login realizado com sucesso! Redirecionando...
                </p>
              )}

              <Button
                className="
  w-full cursor-pointer text-white rounded px-4 py-2
  bg-[length:200%_100%]
  bg-[position:0%_0%]
  bg-gradient-to-r from-azul-vivido via-roxo to-laranja 
  transition-[background-position] duration-500 ease-in-out
  
  hover:bg-[position:100%_0%]
"
              >
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

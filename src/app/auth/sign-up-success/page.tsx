import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Obrigado por se cadastrar
              </CardTitle>
              <CardDescription>
                Verifique o seu email para confirmar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enviamos um email para o endereço fornecido durante o cadastro.
                Por favor, clique no link de confirmação dentro do email para
                ativar sua conta e começar a usar nossos serviços.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

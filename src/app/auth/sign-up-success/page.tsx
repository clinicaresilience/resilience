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
                Cadastro realizado com sucesso!
              </CardTitle>
              <CardDescription>
                Sua conta foi criada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sua conta foi criada com sucesso. Você já pode fazer login e começar a usar nossos serviços.
              </p>
              <a
                href="/auth/login"
                className="inline-block w-full text-center px-4 py-2 bg-azul-vivido text-white rounded-lg hover:bg-azul-escuro transition-colors"
              >
                Fazer Login
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

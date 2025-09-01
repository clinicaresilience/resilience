import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Headphones, Video, Download, ExternalLink } from "lucide-react";

export default async function RecursosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single();

  if (error || !usuario) {
    redirect("/auth/login");
  }

  // se for admin, encaminha pro painel administrativo
  if (usuario.tipo_usuario === "administrador") {
    redirect("/painel-administrativo");
  }

  // se for profissional, encaminha pra tela profissional
  if (usuario.tipo_usuario === "profissional") {
    redirect("/tela-profissional");
  }

  const recursos = [
    {
      id: 1,
      titulo: "Técnicas de Respiração",
      descricao: "Aprenda técnicas simples de respiração para reduzir ansiedade e estresse.",
      tipo: "video",
      duracao: "5 min",
      categoria: "Ansiedade"
    },
    {
      id: 2,
      titulo: "Meditação Guiada",
      descricao: "Sessão de meditação para iniciantes focada em mindfulness.",
      tipo: "audio",
      duracao: "10 min",
      categoria: "Mindfulness"
    },
    {
      id: 3,
      titulo: "Diário de Gratidão",
      descricao: "Template para praticar gratidão diariamente e melhorar o bem-estar.",
      tipo: "documento",
      duracao: "PDF",
      categoria: "Bem-estar"
    },
    {
      id: 4,
      titulo: "Exercícios de Relaxamento",
      descricao: "Guia completo com exercícios para relaxamento muscular progressivo.",
      tipo: "video",
      duracao: "15 min",
      categoria: "Relaxamento"
    }
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "video": return <Video className="h-5 w-5" />;
      case "audio": return <Headphones className="h-5 w-5" />;
      case "documento": return <BookOpen className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "video": return "bg-red-100 text-red-800";
      case "audio": return "bg-green-100 text-green-800";
      case "documento": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">Recursos de Bem-estar</h1>
        <p className="mt-2 text-lg text-gray-600">
          Acesse materiais e exercícios para apoiar seu bem-estar mental, {usuario.nome}
        </p>
      </div>

      {/* Categorias Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Ansiedade</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Headphones className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Mindfulness</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Relaxamento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Bem-estar</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Recursos Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recursos.map((recurso) => (
              <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIcon(recurso.tipo)}
                      <h3 className="font-semibold text-azul-escuro">{recurso.titulo}</h3>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recurso.tipo)}`}>
                        {recurso.tipo}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{recurso.descricao}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{recurso.duracao}</span>
                      <span>•</span>
                      <span>{recurso.categoria}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {recurso.tipo === "documento" ? (
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Baixar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Acessar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas Rápidas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dicas Rápidas de Bem-estar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Respiração 4-7-8</h4>
              <p className="text-sm text-blue-800">
                Inspire por 4 segundos, segure por 7, expire por 8. Repita 4 vezes para reduzir ansiedade.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Técnica 5-4-3-2-1</h4>
              <p className="text-sm text-green-800">
                Identifique 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Gratidão Diária</h4>
              <p className="text-sm text-purple-800">
                Anote 3 coisas pelas quais é grato todos os dias para melhorar o humor.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Movimento Consciente</h4>
              <p className="text-sm text-orange-800">
                Faça uma caminhada de 10 minutos prestando atenção aos seus passos e respiração.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Users,
  Calendar,
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Sparkles,
  Brain,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

interface WelcomeScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onDisableForever?: () => void;
  userName: string;
  userType: "administrador" | "profissional" | "comum";
}

export function WelcomeScreen({ isOpen, onClose, onDisableForever, userName, userType }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const getWelcomeContent = () => {
    switch (userType) {
      case "administrador":
        return {
          title: "Bem-vindo à Clínica Resilience",
          subtitle: "Sistema Administrativo - Gerencie toda a clínica psicológica com eficiência",
          features: [
            {
              icon: Users,
              title: "Gestão de Usuários",
              description: "Gerencie psicólogos, pacientes e suas permissões"
            },
            {
              icon: Calendar,
              title: "Controle de Agendas",
              description: "Monitore agendamentos e disponibilidade dos profissionais"
            },
            {
              icon: Star,
              title: "Avaliações",
              description: "Acompanhe a satisfação dos pacientes com os psicólogos"
            },
            {
              icon: Shield,
              title: "Relatórios",
              description: "Acesse análises detalhadas da clínica psicológica"
            }
          ],
          quickActions: [
            "Visualizar dashboard com métricas da clínica",
            "Gerenciar psicólogos e pacientes",
            "Acompanhar avaliações dos profissionais",
            "Configurar limites e exceções de atendimento"
          ]
        };
      
      case "profissional":
        return {
          title: "Bem-vindo à Clínica Resilience",
          subtitle: `Psicólogo(a) ${userName} - Seu espaço para atendimento psicológico de qualidade`,
          features: [
            {
              icon: Calendar,
              title: "Agenda Pessoal",
              description: "Gerencie seus horários e sessões de terapia"
            },
            {
              icon: Users,
              title: "Pacientes",
              description: "Acesse informações dos seus pacientes em terapia"
            },
            {
              icon: Brain,
              title: "Prontuários",
              description: "Registre sessões e evoluções terapêuticas"
            },
            {
              icon: Star,
              title: "Avaliações",
              description: "Veja o feedback dos seus pacientes sobre as sessões"
            }
          ],
          quickActions: [
            "Visualizar agenda de sessões do dia",
            "Atender pacientes agendados",
            "Registrar evoluções terapêuticas",
            "Acompanhar feedback dos pacientes"
          ]
        };
      
      case "comum":
        return {
          title: "Bem-vindo à Clínica Resilience",
          subtitle: `${userName} - Cuidando da sua saúde mental com carinho`,
          features: [
            {
              icon: Calendar,
              title: "Agendamentos",
              description: "Agende suas sessões de terapia facilmente"
            },
            {
              icon: MessageCircle,
              title: "Histórico",
              description: "Acesse seu histórico de sessões e tratamentos"
            },
            {
              icon: Star,
              title: "Avaliações",
              description: "Avalie suas sessões e psicólogos"
            },
            {
              icon: Heart,
              title: "Bem-estar",
              description: "Acompanhe seu progresso terapêutico"
            }
          ],
          quickActions: [
            "Agendar nova sessão de terapia",
            "Ver próximas sessões agendadas",
            "Avaliar suas sessões de terapia",
            "Acessar histórico de tratamentos"
          ]
        };
      
      default:
        return {
          title: "Bem-vindo à Clínica Resilience",
          subtitle: "Sua plataforma de saúde mental e bem-estar",
          features: [],
          quickActions: []
        };
    }
  };

  const content = getWelcomeContent();
  const totalSteps = 3;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // When completing the journey, disable welcome screen forever
      if (onDisableForever) {
        await onDisableForever();
      }
      onClose();
    }
  };

  const handleSkip = async () => {
    if (onDisableForever) {
      await onDisableForever();
    }
    onClose();
  };

  const handleDontShowAgain = async () => {
    if (onDisableForever) {
      await onDisableForever();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden p-0"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full max-h-[95vh]">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-center mb-2">
              <Image
                src="/logoResilience.png"
                alt="Clínica Resilience"
                width={100}
                height={50}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
            <DialogTitle className="text-center text-lg sm:text-xl lg:text-2xl font-bold text-azul-escuro">
              {currentStep === 0 && content.title}
              {currentStep === 1 && "Principais Funcionalidades"}
              {currentStep === 2 && "Primeiros Passos"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? "bg-azul-escuro shadow-lg" 
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-azul-escuro rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center">
                    <Image
                      src="/logoResilience.png"
                      alt="Clínica Resilience"
                      width={60}
                      height={30}
                      className="h-4 sm:h-5 lg:h-6 w-auto object-contain"
                    />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-azul-escuro mb-2 sm:mb-4">
                    {content.title}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
                    {content.subtitle}
                  </p>
                </div>

                <div className="bg-azul-claro p-4 sm:p-6 rounded-lg border border-azul-escuro/20 mx-2">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-azul-escuro">
                      🧠 Bem-vindo à Clínica Resilience
                    </h3>
                  </div>
                  <p className="text-azul-escuro text-sm sm:text-base text-center leading-relaxed">
                    Sua plataforma completa para cuidados em saúde mental e bem-estar psicológico. 
                    Aqui você encontra tudo que precisa para uma experiência terapêutica excepcional.
                  </p>
                  <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span className="font-medium text-gray-700">Cuidado</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span className="font-medium text-gray-700">Sigilo</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="font-medium text-gray-700">Qualidade</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Features */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-8">
                  <div className="flex items-center justify-center mb-2 sm:mb-4">
                    <Image
                      src="/logoResilience.png"
                      alt="Clínica Resilience"
                      width={50}
                      height={25}
                      className="h-5 sm:h-6 w-auto object-contain opacity-70"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Principais Funcionalidades
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Descubra tudo que você pode fazer no sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {content.features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Card key={index} className="border-l-4 border-azul-escuro hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-2 sm:p-3 bg-azul-claro rounded-lg shadow-sm">
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-azul-escuro" />
                            </div>
                            <CardTitle className="text-sm sm:text-base lg:text-lg text-azul-escuro">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Quick Actions */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-8">
                  <div className="flex items-center justify-center mb-2 sm:mb-4">
                    <Image
                      src="/logoResilience.png"
                      alt="Clínica Resilience"
                      width={50}
                      height={25}
                      className="h-5 sm:h-6 w-auto object-contain opacity-70"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Primeiros Passos
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Comece explorando essas funcionalidades
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {content.quickActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 sm:p-4 bg-azul-claro rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 font-medium">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-azul-escuro p-4 sm:p-6 lg:p-8 rounded-xl text-white text-center shadow-lg mx-2">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <Image
                      src="/logoResilience.png"
                      alt="Clínica Resilience"
                      width={80}
                      height={40}
                      className="h-6 sm:h-8 lg:h-10 w-auto object-contain filter brightness-0 invert"
                    />
                  </div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">
                    🚀 Pronto para começar sua jornada!
                  </h4>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                    Explore o sistema e descubra como a Clínica Resilience pode ajudar você 
                    a ter uma experiência excepcional em saúde mental e bem-estar.
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                    <span className="text-yellow-200 font-medium text-sm sm:text-base">Bem-vindo à família Resilience!</span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 p-4 sm:p-6 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 text-sm sm:text-base w-full sm:w-auto"
              >
                Pular introdução
              </Button>
              
              {onDisableForever && currentStep === totalSteps - 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleDontShowAgain}
                  className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 text-sm sm:text-base w-full sm:w-auto"
                >
                  Não exibir novamente
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="border-azul-escuro text-azul-escuro hover:bg-azul-claro text-sm sm:text-base w-full sm:w-auto"
                >
                  Anterior
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                className="bg-azul-escuro hover:bg-azul-escuro/90 text-white shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Começar Jornada!
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Users,
  Shield,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Inicio() {
  return (
    <div className="w-full min-h-screen flex flex-col font-['Red_Hat_Display']">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-[#edfffe]/30 to-[#f5b26b]/5 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-20 w-48 h-48 bg-gradient-to-r from-[#7762b6]/8 to-[#f5b26b]/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-r from-[#01c2e3]/10 to-[#02b1aa]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-xl">
                  <Image
                    src="/logoResilience.png"
                    alt="Clínica Resilience"
                    width={120}
                    height={120}
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent tracking-tight">
                  Clínica Resilience
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-[#02b1aa] font-semibold tracking-wide">
                Saúde Mental Corporativa
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Transformamos realidades e materializamos soluções em saúde mental
              organizacional. Promovemos o bem-estar coletivo através de
              atendimento humanizado e científico.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                asChild
                className="px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] hover:from-[#02b1aa]/90 hover:via-[#029fdf]/90 hover:to-[#01c2e3]/90 shadow-lg shadow-[#02b1aa]/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Link href="/portal-publico">
                  Agendar Consulta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-[#02b1aa] text-[#02b1aa] hover:bg-[#02b1aa] hover:text-white hover:border-[#02b1aa] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href="/portal-publico/sobre">Conheça-nos</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#02b1aa]/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#02b1aa] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Oferecemos atendimento personalizado para promover produtividade e
              retenção de talentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Card className="p-8 bg-gradient-to-br from-[#edfffe]/50 to-blue-50/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Gestão de Risco Psicossocial
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A NR-1 exige conformidade com gestão dos riscos psicossociais.
                  Oferecemos suporte completo para sua empresa cumprir as
                  exigências legais.
                </p>
              </div>
            </Card>

            {/* Service 2 */}
            <Card className="p-8 bg-gradient-to-br from-[#edfffe]/50 to-blue-50/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Atendimento Humanizado
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Baseado na ética, ciência e escuta qualificada. Acolhemos cada
                  colaborador em sua singularidade, contribuindo para seu
                  bem-estar integral.
                </p>
              </div>
            </Card>

            {/* Service 3 */}
            <Card className="p-8 bg-gradient-to-br from-[#edfffe]/50 to-blue-50/30 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Desenvolvimento Profissional
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Capacitamos líderes e gestores com ferramentas para
                  identificar riscos psicossociais e promover comunicação
                  saudável no ambiente de trabalho.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-[#edfffe]/30 to-[#f5b26b]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Princípios que guiam nossa atuação e compromisso com a saúde
              mental organizacional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Compromisso com a Ética
              </h3>
              <p className="text-gray-600 text-sm">
                Atuamos com integridade e respeito mútuo em todas as nossas
                ações
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Segurança Emocional
              </h3>
              <p className="text-gray-600 text-sm">
                Garantimos um ambiente seguro para o desenvolvimento pessoal e
                profissional
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Respeito à Singularidade
              </h3>
              <p className="text-gray-600 text-sm">
                Cada colaborador é único e merece atenção individualizada
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Excelência Científica
              </h3>
              <p className="text-gray-600 text-sm">
                Baseamos nossas práticas em evidências científicas e
                metodologias comprovadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-gray-600 font-medium">
                Colaboradores Atendidos
              </p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent mb-2">
                50+
              </div>
              <p className="text-gray-600 font-medium">Empresas Parceiras</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent mb-2">
                98%
              </div>
              <p className="text-gray-600 font-medium">
                Satisfação dos Clientes
              </p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent mb-2">
                5
              </div>
              <p className="text-gray-600 font-medium">Anos de Experiência</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Pronto para transformar sua empresa?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Invista no bem-estar dos seus colaboradores e veja os resultados
              refletirem na produtividade e satisfação da sua equipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                asChild
                className="px-8 py-4 text-lg font-semibold rounded-2xl bg-white text-[#02b1aa] hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/portal-publico">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-white text-white hover:bg-white hover:text-[#02b1aa] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link href="/portal-publico">Faça um agendamento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logoResilience.png"
                  alt="Clínica Resilience"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">Clínica Resilience</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Somos referência no atendimento institucional, potencializando a
                cultura organizacional e as relações interpessoais através de
                profissionais qualificados.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>(82) 98816-6085</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/portal-publico/sobre"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal-publico"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Profissionais
                  </Link>
                </li>

                <li>
                  <Link
                    href="/portal-publico"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Agendamento
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Av. Fernandes Lima, 8<br />
                    Sala 406, Empresarial Office
                    <br />
                    Farol - Maceió
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4" />
                  <span>contato@clinicaresilience.com.br</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>(82) 98816-6085</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Clínica Resilience. Todos os direitos reservados. | CNPJ:
              62.141.629/0001-09
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

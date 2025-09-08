"use client";
import {
  MapPin,
  Phone,
  Building,
  Users,
  Target,
  Heart,
  Award,
  Briefcase,
  Shield,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import LogoResilience from "../../../app/assets/icones/logoResilience.png";
import ReuniaoImg from "../../assets/template/reuniao.png";
import UnionImg from "../../assets/template/union.png";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#edfffe] to-[#f5b26b]/10 relative overflow-hidden font-['Red_Hat_Display']">
      {/* Logo no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-500"></div>
          <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-2xl">
            <Image
              src={LogoResilience}
              alt="Logo Clínica Resilience"
              width={80}
              height={40}
              className="opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#02b1aa] rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-[#029fdf] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#01c2e3] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-[#7762b6] rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#f5b26b] rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
              <span className="text-sm font-medium">Clínica Resilience</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight bg-gradient-to-r from-white to-[#edfffe] bg-clip-text text-transparent">
              Transformar realidades e materializar soluções
            </h1>
            <p className="text-xl md:text-2xl text-[#edfffe] mb-12 leading-relaxed max-w-4xl mx-auto">
              Somos o benefício corporativo que seu time precisa, promovemos o
              bem-estar organizacional com profissionais qualificados para
              cuidar do ambiente do trabalho.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <Shield className="w-5 h-5 inline mr-2" />
                <span className="font-medium">Especialistas Certificados</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <TrendingUp className="w-5 h-5 inline mr-2" />
                <span className="font-medium">Resultados Comprovados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Quem Somos */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
                <span className="text-[#02b1aa] font-medium text-sm">
                  CONHEÇA-NOS
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Quem{" "}
                <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                  Somos
                </span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Uma equipe dedicada a transformar a saúde mental no ambiente
                corporativo
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-center">
              {/* Empresa Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#02b1aa]/20 to-[#029fdf]/20 rounded-2xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-[#02b1aa]" />
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Nossa Empresa
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#02b1aa]/60 to-[#029fdf]/60 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base">
                    Somos uma clínica especializada em gerenciamento de risco
                    psicossocial, impactando positivamente na produtividade e na
                    redução de problemas relacionados à saúde mental como
                    estresse, ansiedade, burnout, absentismo e presenteismo.
                  </p>
                  <div className="mt-6 flex items-center text-[#02b1aa] font-semibold text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Especialistas em Saúde Mental Corporativa</span>
                  </div>
                </div>
              </div>

              {/* Imagem de Reunião */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#7762b6]/25 to-[#f5b26b]/25 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden">
                  <div className="relative">
                    <Image
                      src={ReuniaoImg}
                      alt="Reunião profissional - Clínica Resilience"
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02b1aa]/15 via-transparent to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-white text-lg font-semibold mb-2">
                          Sessões de trabalho colaborativo
                        </p>
                        <p className="text-white/90 text-sm">
                          Ambiente profissional e acolhedor para discussões
                          sobre saúde mental organizacional
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#7762b6]/10 to-[#f5b26b]/10 rounded-full px-4 py-2">
                      <Users className="w-4 h-4 text-[#7762b6] mr-2" />
                      <span className="text-[#7762b6] font-medium text-sm">
                        Colaboração em Foco
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipe Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#029fdf]/30 to-[#01c2e3]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#029fdf]/20 to-[#01c2e3]/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#029fdf]" />
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Nossa Equipe
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-[#029fdf]/60 to-[#01c2e3]/60 rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#edfffe]/60 to-blue-50/60 rounded-xl p-4 border border-[#edfffe]/40">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-[#02b1aa]/70 rounded-full mr-3"></div>
                        <p className="font-semibold text-[#02b1aa] text-base">
                          Responsável Técnica
                        </p>
                      </div>
                      <p className="text-gray-800 font-medium text-lg">
                        Sylmara Bulhões
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        Especialista em Saúde Mental
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#edfffe]/60 to-blue-50/60 rounded-xl p-4 border border-[#edfffe]/40">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-[#029fdf]/70 rounded-full mr-3"></div>
                        <p className="font-semibold text-[#02b1aa] text-base">
                          Sócia Administrativa
                        </p>
                      </div>
                      <p className="text-gray-800 font-medium text-lg">
                        Kelly Lessa
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        Gestão Estratégica
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center text-[#02b1aa] font-semibold text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Profissionais Qualificados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VMV Cards */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#01c2e3]/10 to-[#02b1aa]/10 rounded-full px-6 py-2 mb-6">
                <Target className="w-4 h-4 text-[#02b1aa] mr-2" />
                <span className="text-[#02b1aa] font-medium text-sm">
                  NOSSA ESSÊNCIA
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Visão,{" "}
                <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                  Missão
                </span>{" "}
                e Valores
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Os pilares que guiam nossa atuação e compromisso com a saúde
                mental corporativa
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Visão */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-2xl p-4 shadow-xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-3xl font-black text-gray-900 mb-6">
                      VISÃO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Ser referência no atendimento institucional
                      potencializando a cultura organizacional e as relações
                      interpessoais.
                    </p>
                  </div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#02b1aa]/20 to-[#029fdf]/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Missão */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#029fdf] to-[#01c2e3] rounded-2xl p-4 shadow-xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-3xl font-black text-gray-900 mb-6">
                      MISSÃO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Promover sinergia organizacional, gerar comunicação
                      assertiva para estabelecer relação de confiança e respeito
                      mútuo, possibilitando a reintegração do bem-estar
                      coletivo.
                    </p>
                  </div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#029fdf]/20 to-[#01c2e3]/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#029fdf] to-[#01c2e3] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#01c2e3] to-[#02b1aa] rounded-2xl p-4 shadow-xl">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-3xl font-black text-gray-900 mb-6">
                      VALORES
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] mx-auto rounded-full mb-6"></div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-3"></div>
                        <span className="text-gray-800 font-medium">
                          Honestidade
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#029fdf] rounded-full mr-3"></div>
                        <span className="text-gray-800 font-medium">
                          Respeito
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#01c2e3] rounded-full mr-3"></div>
                        <span className="text-gray-800 font-medium">
                          Compromisso com a ética
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-3"></div>
                        <span className="text-gray-800 font-medium">
                          Comprometimento pelos resultados
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#01c2e3]/20 to-[#02b1aa]/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#01c2e3] to-[#02b1aa] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Negócio e Objetivos */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#f5b26b]/10 to-[#7762b6]/10 rounded-full px-6 py-2 mb-6">
                <Briefcase className="w-4 h-4 text-[#f5b26b] mr-2" />
                <span className="text-[#f5b26b] font-medium text-sm">
                  NOSSA ATUAÇÃO
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#7762b6] to-[#f5b26b] bg-clip-text text-transparent">
                  Negócio
                </span>{" "}
                e Objetivos
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Nossa especialização e compromisso com resultados excepcionais
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Negócio Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-[#7762b6] to-[#f5b26b] rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      NEGÓCIO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] rounded-full"></div>
                  </div>
                  <p className="text-gray-700 font-semibold text-xl mb-6">
                    Gerenciamento de Risco Psicossocial
                  </p>
                  <div className="bg-gradient-to-r from-[#f5b26b]/10 to-[#7762b6]/10 rounded-2xl p-6 border border-[#f5b26b]/20">
                    <p className="text-gray-700 leading-relaxed">
                      Especialização em saúde mental corporativa com foco em
                      prevenção, diagnóstico e tratamento de riscos
                      psicossociais no ambiente de trabalho.
                    </p>
                  </div>
                  <div className="mt-8 flex items-center text-[#7762b6] font-semibold">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Especialidade Certificada</span>
                  </div>
                </div>
              </div>

              {/* Objetivos Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-[#f5b26b] to-[#456dc6] rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      OBJETIVOS
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#edfffe] to-[#f5b26b]/10 rounded-xl p-4 border border-[#f5b26b]/20">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#f5b26b] rounded-full mr-3"></div>
                        <span className="font-semibold text-[#456dc6]">
                          Atendimento Personalizado
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Cada empresa tem suas necessidades específicas
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#edfffe] to-[#7762b6]/10 rounded-xl p-4 border border-[#7762b6]/20">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#7762b6] rounded-full mr-3"></div>
                        <span className="font-semibold text-[#456dc6]">
                          Produtividade e Retenção
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Promover ambientes de trabalho saudáveis
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#edfffe] to-[#456dc6]/10 rounded-xl p-4 border border-[#456dc6]/20">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#456dc6] rounded-full mr-3"></div>
                        <span className="font-semibold text-[#456dc6]">
                          Bem-estar Integral
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Físico, mental, cognitivo e emocional
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center text-[#f5b26b] font-semibold">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Resultados Comprovados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NR-1 Section */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#f5b26b]/10 to-[#456dc6]/10 rounded-full px-6 py-2 mb-6">
                <Shield className="w-4 h-4 text-[#f5b26b] mr-2" />
                <span className="text-[#f5b26b] font-medium text-sm">
                  LEGISLAÇÃO
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                A{" "}
                <span className="bg-gradient-to-r from-[#f5b26b] to-[#456dc6] bg-clip-text text-transparent">
                  Atualização
                </span>{" "}
                da NR-1
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Conformidade legal e gestão responsável da saúde mental no
                trabalho
              </p>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-gradient-to-br from-[#02b1aa] via-[#029fdf] to-[#01c2e3] rounded-3xl text-white p-16 overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-8 right-8 w-20 h-20 bg-[#f5b26b]/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-[#7762b6]/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#456dc6]/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                      A ATUALIZAÇÃO DA NR-1
                    </h2>
                    <p className="text-xl text-[#edfffe] max-w-2xl mx-auto leading-relaxed">
                      Sua empresa precisa estar em conformidade com a gestão dos
                      riscos psicossociais
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#f5b26b] to-[#7762b6] rounded-xl flex items-center justify-center mr-4">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold">
                            Gerenciamento de Risco Psicossocial
                          </h3>
                        </div>
                        <p className="text-[#edfffe] leading-relaxed mb-6">
                          Com a atualização da NR-1 sua empresa precisa estar em
                          conformidade com a gestão dos riscos psicossociais. A
                          norma deixa claro que a saúde mental e segurança
                          emocional não são temas opcionais, são parte essencial
                          da gestão do trabalho.
                        </p>
                        <p className="text-[#edfffe] leading-relaxed">
                          A clínica Resilience oferece o suporte completo,
                          auxiliando a sua empresa a cumprir as exigências
                          legais evitando as penalidades.
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-[#f5b26b]/20 to-[#7762b6]/20 rounded-2xl p-6 border border-[#f5b26b]/30">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="w-5 h-5 text-[#f5b26b] mr-3" />
                          <span className="font-semibold text-white">
                            Suporte Especializado
                          </span>
                        </div>
                        <p className="text-[#edfffe]/90 text-sm">
                          Acompanhamento completo para conformidade legal
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                      <h4 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="w-6 h-6 text-[#f5b26b] mr-3" />
                        QUAIS OS BENEFÍCIOS DE CONTRATAR NOSSOS SERVIÇOS?
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#f5b26b] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Investir em desenvolvimento profissional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#7762b6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Cumprimento de exigências legais
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#456dc6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Fortalecer a imagem institucional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#f5b26b] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Reduzir risco de adoecimento emocional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#7762b6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Capacitar seu time de líderes
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#456dc6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] leading-relaxed">
                            Construir um ambiente mais saudável e produtivo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Description */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#456dc6]/8 to-[#02b1aa]/8 rounded-full px-6 py-2 mb-6">
                <TrendingUp className="w-4 h-4 text-[#456dc6] mr-2" />
                <span className="text-[#456dc6] font-medium text-sm">
                  INVESTIMENTO
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#456dc6]/80 to-[#02b1aa]/80 bg-clip-text text-transparent">
                  Investimento
                </span>{" "}
                Estratégico
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#456dc6]/60 to-[#02b1aa]/60 mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Saúde mental como ativo estratégico para o sucesso
                organizacional
              </p>
            </div>

            {/* Imagem Union */}
            <div className="flex justify-center mb-16">
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#7762b6]/20 to-[#f5b26b]/20 rounded-3xl blur opacity-30 group-hover:opacity-45 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative">
                    <Image
                      src={UnionImg}
                      alt="Union - Colaboração e trabalho em equipe"
                      width={500}
                      height={350}
                      className="w-full h-72 object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#456dc6]/10 via-transparent to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-white text-xl font-bold mb-2">
                          Colaboração e Trabalho em Equipe
                        </p>
                        <p className="text-white/90 text-base">
                          Potencializando resultados através da união e sinergia
                          organizacional
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#7762b6]/10 to-[#f5b26b]/10 rounded-full px-4 py-2">
                      <Heart className="w-4 h-4 text-[#7762b6] mr-2" />
                      <span className="text-[#7762b6] font-medium text-sm">
                        Sinergia Organizacional
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#456dc6]/15 to-[#02b1aa]/15 rounded-3xl blur opacity-15 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-16 border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                {/* Elementos decorativos sutis */}
                <div className="absolute top-8 left-8 w-12 h-12 bg-[#456dc6]/8 rounded-full blur-lg"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-[#02b1aa]/8 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                      Investimento Estratégico em Saúde Mental
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#456dc6]/50 to-[#02b1aa]/50 mx-auto rounded-full"></div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#edfffe]/80 to-[#456dc6]/8 rounded-2xl p-8 border border-[#456dc6]/15">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#456dc6]/60 to-[#02b1aa]/60 rounded-xl flex items-center justify-center mr-4">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-[#456dc6]">
                            Retorno Estratégico
                          </h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          O investimento com atendimento psicológico no ambiente
                          organizacional é estratégico para a sua empresa, pois
                          promove a saúde mental e o bem-estar de seus
                          colaboradores, resultando em um ambiente de trabalho
                          mais produtivo e saudável.
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-[#edfffe]/80 to-[#f5b26b]/8 rounded-2xl p-6 border border-[#f5b26b]/15">
                        <div className="flex items-center mb-3">
                          <div className="w-2.5 h-2.5 bg-[#f5b26b]/70 rounded-full mr-3"></div>
                          <span className="font-semibold text-[#456dc6]">
                            ROI Comprovado
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Redução de custos com absenteísmo e turnover
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#edfffe]/80 to-[#7762b6]/8 rounded-2xl p-8 border border-[#7762b6]/15">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#7762b6]/60 to-[#f5b26b]/60 rounded-xl flex items-center justify-center mr-4">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-xl font-bold text-[#7762b6]">
                            Capacitação de Liderança
                          </h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          Capacitamos e treinamos o seu time de líderes para que
                          através de ferramentas possa identificar situações de
                          risco psicossociais, oferecendo também programas de
                          desenvolvimento para liderança e gestores com foco em
                          habilidades de comunicação e gestão de conflitos.
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-[#edfffe]/80 to-[#02b1aa]/8 rounded-2xl p-6 border border-[#02b1aa]/15">
                        <div className="flex items-center mb-3">
                          <div className="w-2.5 h-2.5 bg-[#02b1aa]/70 rounded-full mr-3"></div>
                          <span className="font-semibold text-[#456dc6]">
                            Desenvolvimento Sustentável
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Criação de cultura organizacional saudável
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#456dc6]/8 to-[#02b1aa]/8 rounded-full px-8 py-4">
                      <CheckCircle className="w-4 h-4 text-[#456dc6] mr-3" />
                      <span className="text-[#456dc6] font-bold">
                        Resultados Mensuráveis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
                <MapPin className="w-4 h-4 text-[#02b1aa] mr-2" />
                <span className="text-[#02b1aa] font-medium text-sm">
                  ENTRE EM CONTATO
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                  Visite-nos
                </span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Estamos prontos para ajudar sua empresa a promover o bem-estar
                organizacional
              </p>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-16 border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                <div className="grid lg:grid-cols-3 gap-12 text-center">
                  {/* Endereço */}
                  <div className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Endereço
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-gray-700 leading-relaxed font-medium">
                          Av. Fernandes Lima, 8, Sala 406
                          <br />
                          Edifício Empresarial Office
                          <br />
                          Farol - Maceió
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#029fdf] to-[#01c2e3] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Telefone
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-[#02b1aa] font-bold text-2xl leading-relaxed">
                          (82) 98816-6085
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                          Atendimento personalizado
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CNPJ */}
                  <div className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#01c2e3] to-[#02b1aa] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        CNPJ
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-gray-700 font-semibold text-lg leading-relaxed">
                          62.141.629/0001-09
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                          Empresa registrada
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 pt-12 border-t border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-8 py-4">
                      <Building className="w-5 h-5 text-[#02b1aa] mr-3" />
                      <span className="text-[#02b1aa] font-bold text-lg">
                        RECURSOS HUMANOS
                      </span>
                    </div>
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">
                      Especialistas em gestão de pessoas e saúde mental
                      organizacional, comprometidos com o desenvolvimento
                      sustentável das empresas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

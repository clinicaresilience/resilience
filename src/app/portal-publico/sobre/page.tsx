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
import {
  FadeInWhenVisible,
  SlideInWhenVisible,
  ScaleInWhenVisible,
  StaggerContainer,
} from "@/components/animations";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/animations";
import WhatsAppFloatButton from "@/components/whatsapp-float-button";
// Remove imports since we'll use src directly

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#edfffe] to-[#f5b26b]/10 relative overflow-hidden font-['Red_Hat_Display']">
      <WhatsAppFloatButton />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#02b1aa] rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-[#029fdf] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#01c2e3] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-[#7762b6] rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#f5b26b] rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white py-12 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <ScaleInWhenVisible delay={0.2} initialScale={0.8}>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8">
                <span className="text-xs md:text-sm font-medium">Clínica Resilience</span>
              </div>
            </ScaleInWhenVisible>
            <FadeInWhenVisible delay={0.4}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 md:mb-8 leading-tight bg-gradient-to-r from-white to-[#edfffe] bg-clip-text text-transparent px-4">
                Transformar realidades e materializar soluções
              </h1>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={0.6}>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#edfffe] mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-4">
                Somos o benefício corporativo que seu time precisa, promovemos o
                bem-estar organizacional com profissionais qualificados para
                cuidar do ambiente do trabalho.
              </p>
            </FadeInWhenVisible>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 md:gap-4 px-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 text-sm md:text-base">
                <Shield className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                <span className="font-medium">Especialistas Certificados</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 text-sm md:text-base">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
                <span className="font-medium">Resultados Comprovados</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Quem Somos */}
        <section className="mb-12 md:mb-20 lg:mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible>
              <div className="text-center mb-10 md:mb-16">
                <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
                  <span className="text-[#02b1aa] font-medium text-xs md:text-sm">
                    CONHEÇA-NOS
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 md:mb-6 leading-tight px-4">
                  Quem{" "}
                  <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                    Somos
                  </span>
                </h2>
                <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6 md:mb-8"></div>
                <p className="text-gray-700 text-sm md:text-base lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
                  Uma equipe dedicada a transformar a saúde mental no ambiente
                  corporativo
                </p>
              </div>
            </FadeInWhenVisible>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-10 lg:gap-12 items-center">
              {/* Empresa Card */}
              <SlideInWhenVisible direction="left" delay={0.2}>
                <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#02b1aa]/20 to-[#029fdf]/20 rounded-2xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-[#02b1aa]" />
                  </div>
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                      Nossa Empresa
                    </h3>
                    <div className="w-10 md:w-12 h-1 bg-gradient-to-r from-[#02b1aa]/60 to-[#029fdf]/60 rounded-full"></div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    Somos uma clínica especializada em gerenciamento de risco
                    psicossocial, impactando positivamente na produtividade e na
                    redução de problemas relacionados à saúde mental como
                    estresse, ansiedade, burnout, absentismo e presenteismo.
                  </p>
                  <div className="mt-4 md:mt-6 flex items-center text-[#02b1aa] font-semibold text-xs md:text-sm">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span>Especialistas em Saúde Mental Corporativa</span>
                  </div>
                </div>
                </div>
              </SlideInWhenVisible>

              {/* Imagem de Reunião */}
              <ScaleInWhenVisible delay={0.4} initialScale={0.9}>
                <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#7762b6]/25 to-[#f5b26b]/25 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <Image src="/fotossite/clinica-2.jpeg"
                        alt="Ambiente Profissional - Clínica Resilience"
                        width={300}
                        height={250}
                        className="w-full h-auto object-contain rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-900 text-lg font-semibold">
                        Sessões de trabalho colaborativo
                      </p>
                      <p className="text-gray-600 text-sm">
                        Ambiente profissional e acolhedor para discussões
                        sobre saúde mental organizacional
                      </p>
                      <div className="inline-flex items-center bg-gradient-to-r from-[#7762b6]/10 to-[#f5b26b]/10 rounded-full px-4 py-2">
                        <Users className="w-4 h-4 text-[#7762b6] mr-2" />
                        <span className="text-[#7762b6] font-medium text-sm">
                          Colaboração em Foco
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </ScaleInWhenVisible>

              {/* Equipe Card */}
              <SlideInWhenVisible direction="right" delay={0.6}>
                <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#029fdf]/30 to-[#01c2e3]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-[#029fdf]/20 to-[#01c2e3]/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#029fdf]" />
                  </div>
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                      Nossa Equipe
                    </h3>
                    <div className="w-10 md:w-12 h-1 bg-gradient-to-r from-[#029fdf]/60 to-[#01c2e3]/60 rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#edfffe]/60 to-blue-50/60 rounded-xl p-4 border border-[#edfffe]/40">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-[#02b1aa]/70 rounded-full mr-3"></div>
                        <p className="font-semibold text-[#02b1aa] text-base">
                          Responsável Técnica
                        </p>
                      </div>
                      <p className="text-gray-900 font-medium text-base md:text-lg">
                        Sylmara Bulhões
                      </p>
                      <p className="text-gray-700 text-xs md:text-sm mt-1">
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
                      <p className="text-gray-900 font-medium text-base md:text-lg">
                        Kelly Lessa
                      </p>
                      <p className="text-gray-700 text-xs md:text-sm mt-1">
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
              </SlideInWhenVisible>
            </div>
          </div>
        </section>

        {/* Clínica Resilience - Quem Somos Section */}
        <section className="mb-12 md:mb-20 lg:mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-gradient-to-br from-[#02b1aa] via-[#029fdf] to-[#01c2e3] rounded-3xl text-white p-6 md:p-10 lg:p-16 shadow-2xl overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 px-4">
                      CLÍNICA RESILIENCE
                    </h2>
                    <div className="w-24 md:w-32 h-1 md:h-1.5 bg-white/60 mx-auto rounded-full mb-6 md:mb-8"></div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-[#edfffe] px-4">
                      QUEM SOMOS?
                    </h3>
                  </div>

                  <div className="max-w-5xl mx-auto space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                      <p className="text-lg md:text-xl leading-relaxed text-white/95">
                        A clínica resilience nasceu da união de duas profissionais com ampla experiência na área de desenvolvimento humano <strong>Sylmara Bulhões</strong> e <strong>Kelly Lessa</strong>. Com olhares complementares, as sócias unem suas competências para desenvolver programas personalizados que promovem equilíbrio, fortalecem a resiliência e estimulam a qualidade de vida no dia a dia corporativo.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                      <p className="text-lg md:text-xl leading-relaxed text-white/95">
                        Essa união é um convite para que as empresas invistam em uma gestão moderna, onde cuidar da saúde mental dos colaboradores não é apenas uma tendência, mas a necessidade para o crescimento coletivo.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                      <p className="text-lg md:text-xl leading-relaxed text-white/95">
                        Acreditamos que o crescimento de uma empresa está diretamente ligado ao bem-estar e ao potencial de seus colaboradores. Por isso, nossa atuação é guiada pelo propósito de transformar ambientes de trabalho em espaços mais saudáveis, motivadores e produtivos.
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-[#f5b26b]/30 to-[#7762b6]/30 backdrop-blur-md rounded-2xl p-8 border border-white/30">
                      <p className="text-lg md:text-xl leading-relaxed text-white font-semibold text-center">
                        Mais do que oferecer soluções, buscamos criar caminhos de transformação sustentável, onde pessoas se sintam reconhecidas, equipes se tornem mais engajadas e organizações alcancem resultados consistentes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kelly Lessa Profile Section */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#f5b26b]/20 to-[#7762b6]/20 rounded-full px-6 py-2 mb-6">
                <Users className="w-4 h-4 text-[#7762b6] mr-2" />
                <span className="text-[#7762b6] font-medium text-sm">
                  NOSSA EQUIPE
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Conheça{" "}
                <span className="bg-gradient-to-r from-[#7762b6] to-[#f5b26b] bg-clip-text text-transparent">
                  Kelly Lessa
                </span>
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] mx-auto rounded-full mb-8"></div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#7762b6] via-[#f5b26b] to-[#456dc6] rounded-3xl blur-2xl opacity-25 group-hover:opacity-35 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="relative h-96 lg:h-auto">
                    <Image
                      src="/fotossite/clinica-1.jpeg"
                      alt="Kelly Lessa"
                      width={600}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#7762b6]/40 via-transparent to-transparent"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-12 lg:p-16 bg-gradient-to-br from-white via-[#edfffe]/30 to-[#f5b26b]/10">
                    <div className="space-y-6">
                      {/* Professional Title */}
                      <div className="bg-gradient-to-r from-[#7762b6] to-[#f5b26b] rounded-2xl p-6 shadow-xl">
                        <h4 className="text-2xl font-bold text-white mb-3 flex items-center">
                          <Award className="w-6 h-6 mr-3" />
                          Formação e Experiência
                        </h4>
                      </div>

                      {/* Description */}
                      <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border-2 border-[#7762b6]/20 shadow-lg">
                        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                          Graduada em <strong>Serviço Social</strong>, pós-graduada em <strong>Saúde Mental e Atendimento Psicossocial</strong>, <strong>implementadora da NR-01</strong>, tem uma carreira sólida na área de desenvolvimento humano, atuando com gerenciamento de pessoas no ambiente organizacional.
                        </p>
                      </div>

                      {/* Expertise Tags */}
                      <div className="bg-gradient-to-r from-[#edfffe] to-[#f5b26b]/10 rounded-2xl p-6 border-2 border-[#f5b26b]/20">
                        <h5 className="text-xl font-bold text-[#7762b6] mb-4">Áreas de Atuação</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-[#7762b6]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#7762b6] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Palestrante</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#f5b26b]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#f5b26b] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Trabalho em Grupo</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#456dc6]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#456dc6] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Gestão de Pessoas</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#02b1aa]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">NR-01</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mission Statement */}
                      <div className="bg-gradient-to-br from-[#7762b6] to-[#456dc6] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-start">
                          <Target className="w-6 h-6 text-white mr-3 mt-1 flex-shrink-0" />
                          <p className="text-white leading-relaxed font-medium">
                            Com o objetivo de fomentar a evolução contínua de pessoas, alinhando crescimento individual às metas corporativas.
                          </p>
                        </div>
                      </div>

                      {/* Highlight */}
                      <div className="bg-gradient-to-r from-[#f5b26b]/20 to-[#7762b6]/20 rounded-2xl p-6 border-2 border-[#f5b26b]/30">
                        <p className="text-gray-900 text-center font-semibold text-base md:text-lg italic">
                          "Vasta experiência no trabalho em grupo e gerenciamento organizacional"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sylmara Patricia Lessa Bulhões Profile Section */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/20 to-[#029fdf]/20 rounded-full px-6 py-2 mb-6">
                <Users className="w-4 h-4 text-[#02b1aa] mr-2" />
                <span className="text-[#02b1aa] font-medium text-sm">
                  NOSSA EQUIPE
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Conheça{" "}
                <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                  Sylmara Patricia Lessa Bulhões, CRP: 15/2202
                </span>
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] rounded-3xl blur-2xl opacity-25 group-hover:opacity-35 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="relative h-96 lg:h-auto">
                    <Image
                      src="/fotossite/IMG_4707.JPG"
                      alt="Sylmara Patricia Lessa Bulhões, CRP: 15/2202"
                      width={600}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02b1aa]/40 via-transparent to-transparent"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-12 lg:p-16 bg-gradient-to-br from-white via-[#edfffe]/30 to-[#029fdf]/10">
                    <div className="space-y-6">
                      {/* Professional Title */}
                      <div className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-2xl p-6 shadow-xl">
                        <h4 className="text-2xl font-bold text-white mb-3 flex items-center">
                          <Award className="w-6 h-6 mr-3" />
                          Formação e Experiência
                        </h4>
                      </div>

                      {/* Description */}
                      <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border-2 border-[#02b1aa]/20 shadow-lg">
                        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                          Graduada em <strong>Psicologia pelo Cesmac</strong>, com <strong>experiência de 21 anos no mercado</strong> e especialista em <strong>Clínica</strong>. <strong>Implementadora da RN1</strong> e há 03 anos com atuação em empresas do Grupo Amarantes, tendo como objetivo contribuir para o desenvolvimento de ações eficazes para o bem-estar psíquico, social e organizacional de acordo com as normas legais, sempre com ética, comprometimento, confiança e respeito mútuo.
                        </p>
                      </div>

                      {/* Expertise Tags */}
                      <div className="bg-gradient-to-r from-[#edfffe] to-[#029fdf]/10 rounded-2xl p-6 border-2 border-[#029fdf]/20">
                        <h5 className="text-xl font-bold text-[#02b1aa] mb-4">Áreas de Atuação</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-[#02b1aa]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Psicologia Clínica</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#029fdf]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#029fdf] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Implementadora RN1</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#01c2e3]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#01c2e3] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Saúde Organizacional</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-[#02b1aa]/20">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-2"></div>
                              <span className="text-gray-900 font-medium text-sm">Grupo Amarantes</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mission Statement */}
                      <div className="bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-start">
                          <Target className="w-6 h-6 text-white mr-3 mt-1 flex-shrink-0" />
                          <p className="text-white leading-relaxed font-medium">
                            Contribuir para o desenvolvimento de ações eficazes para o bem-estar psíquico, social e organizacional de acordo com as normas legais.
                          </p>
                        </div>
                      </div>

                      {/* Highlight */}
                      <div className="bg-gradient-to-r from-[#029fdf]/20 to-[#02b1aa]/20 rounded-2xl p-6 border-2 border-[#029fdf]/30">
                        <p className="text-gray-900 text-center font-semibold text-base md:text-lg italic">
                          "21 anos de experiência com ética, comprometimento, confiança e respeito mútuo"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VMV Cards */}
        <section className="mb-24 relative">
          <div className="max-w-7xl mx-auto">
            <FadeInWhenVisible>
              <div className="text-center mb-16">
                <div className="inline-flex items-center bg-gradient-to-r from-[#01c2e3]/10 to-[#02b1aa]/10 rounded-full px-6 py-2 mb-6">
                  <Target className="w-4 h-4 text-[#02b1aa] mr-2" />
                  <span className="text-[#02b1aa] font-medium text-sm">
                    NOSSA ESSÊNCIA
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                  Visão,{" "}
                  <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                    Missão
                  </span>{" "}
                  e Valores
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
                <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                  Os pilares que guiam nossa atuação e compromisso com a saúde
                  mental corporativa
                </p>
              </div>
            </FadeInWhenVisible>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Visão */}
              <ScaleInWhenVisible delay={0.2} rotate={-3}>
                <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-2xl p-4 shadow-xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                      VISÃO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-700 leading-relaxed text-base md:text-lg">
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
              </ScaleInWhenVisible>

              {/* Missão */}
              <ScaleInWhenVisible delay={0.4} rotate={2}>
                <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#029fdf] to-[#01c2e3] rounded-2xl p-4 shadow-xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                      MISSÃO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-700 leading-relaxed text-base md:text-lg">
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
              </ScaleInWhenVisible>

              {/* Valores */}
              <ScaleInWhenVisible delay={0.6} rotate={-2}>
                <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-br from-[#01c2e3] to-[#02b1aa] rounded-2xl p-4 shadow-xl">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="pt-8 text-center">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                      VALORES
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] mx-auto rounded-full mb-6"></div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-3"></div>
                        <span className="text-gray-900 font-medium text-sm md:text-base">
                          Honestidade
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#029fdf] rounded-full mr-3"></div>
                        <span className="text-gray-900 font-medium text-sm md:text-base">
                          Respeito
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#01c2e3] rounded-full mr-3"></div>
                        <span className="text-gray-900 font-medium text-sm md:text-base">
                          Compromisso com a ética
                        </span>
                      </div>
                      <div className="flex items-center justify-center bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-[#02b1aa] rounded-full mr-3"></div>
                        <span className="text-gray-900 font-medium text-sm md:text-base">
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
              </ScaleInWhenVisible>
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#7762b6] to-[#f5b26b] bg-clip-text text-transparent">
                  Negócio
                </span>{" "}
                e Objetivos
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] mx-auto rounded-full mb-8"></div>
              <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Nossa especialização e compromisso com resultados excepcionais
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Negócio Card */}
              <SlideInWhenVisible direction="left" delay={0.2}>
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-[#7762b6] to-[#f5b26b] rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      NEGÓCIO
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#7762b6] to-[#f5b26b] rounded-full"></div>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg md:text-xl mb-6">
                    Gerenciamento de Risco Psicossocial
                  </p>
                  <div className="bg-gradient-to-r from-[#f5b26b]/10 to-[#7762b6]/10 rounded-2xl p-6 border border-[#f5b26b]/20">
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
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
              </SlideInWhenVisible>

              {/* Objetivos Card */}
              <SlideInWhenVisible direction="right" delay={0.4}>
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-[#f5b26b] to-[#456dc6] rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
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
                      <p className="text-gray-700 text-sm md:text-base">
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
                      <p className="text-gray-700 text-sm md:text-base">
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
                      <p className="text-gray-700 text-sm md:text-base">
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
              </SlideInWhenVisible>
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                A{" "}
                <span className="bg-gradient-to-r from-[#f5b26b] to-[#456dc6] bg-clip-text text-transparent">
                  Atualização
                </span>{" "}
                da NR-1
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] mx-auto rounded-full mb-8"></div>
              <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Conformidade legal e gestão responsável da saúde mental no
                trabalho
              </p>
            </div>

            <FadeInWhenVisible delay={0.2} duration={0.7}>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#f5b26b] to-[#456dc6] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-gradient-to-br from-[#02b1aa] via-[#029fdf] to-[#01c2e3] rounded-3xl text-white p-16 overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-8 right-8 w-20 h-20 bg-[#f5b26b]/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-[#7762b6]/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#456dc6]/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
                      A ATUALIZAÇÃO DA NR-1
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-[#edfffe] max-w-2xl mx-auto leading-relaxed">
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
                          <h3 className="text-xl md:text-2xl font-bold">
                            Gerenciamento de Risco Psicossocial
                          </h3>
                        </div>
                        <p className="text-[#edfffe] text-base md:text-lg leading-relaxed mb-6">
                          Com a atualização da NR-1 sua empresa precisa estar em
                          conformidade com a gestão dos riscos psicossociais. A
                          norma deixa claro que a saúde mental e segurança
                          emocional não são temas opcionais, são parte essencial
                          da gestão do trabalho.
                        </p>
                        <p className="text-[#edfffe] text-base md:text-lg leading-relaxed">
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
                        <p className="text-[#edfffe]/90 text-sm md:text-base">
                          Acompanhamento completo para conformidade legal
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                      <h4 className="text-xl md:text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="w-6 h-6 text-[#f5b26b] mr-3" />
                        QUAIS OS BENEFÍCIOS DE CONTRATAR NOSSOS SERVIÇOS?
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#f5b26b] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Investir em desenvolvimento profissional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#7762b6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Cumprimento de exigências legais
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#456dc6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Fortalecer a imagem institucional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#f5b26b] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Reduzir risco de adoecimento emocional
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#7762b6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Capacitar seu time de líderes
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#456dc6] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#edfffe] text-sm md:text-base leading-relaxed">
                            Construir um ambiente mais saudável e produtivo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </FadeInWhenVisible>
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#456dc6]/80 to-[#02b1aa]/80 bg-clip-text text-transparent">
                  Investimento
                </span>{" "}
                Estratégico
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#456dc6]/60 to-[#02b1aa]/60 mx-auto rounded-full mb-8"></div>
              <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Saúde mental como ativo estratégico para o sucesso
                organizacional
              </p>
            </div>

            {/* Imagem Union */}
            <ScaleInWhenVisible delay={0.2} initialScale={0.95}>
            <div className="flex justify-center mb-16">
              <div className="relative group w-full max-w-4xl">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#7762b6]/20 to-[#f5b26b]/20 rounded-3xl blur opacity-30 group-hover:opacity-45 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Image src="/fotossite/clinica-1.jpeg"
                        alt="Clínica Resilience - Espaço Acolhedor e trabalho em equipe"
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-900 text-2xl font-bold">
                        Colaboração e Trabalho em Equipe
                      </p>
                      <p className="text-gray-600 text-base leading-relaxed">
                        Potencializando resultados através da união e sinergia
                        organizacional
                      </p>
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
            </div>
            </ScaleInWhenVisible>

            <FadeInWhenVisible delay={0.4} duration={0.7}>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#456dc6]/15 to-[#02b1aa]/15 rounded-3xl blur opacity-15 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-16 border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                {/* Elementos decorativos sutis */}
                <div className="absolute top-8 left-8 w-12 h-12 bg-[#456dc6]/8 rounded-full blur-lg"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-[#02b1aa]/8 rounded-full blur-lg"></div>

                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
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
                          <h4 className="text-lg md:text-xl font-bold text-[#456dc6]">
                            Retorno Estratégico
                          </h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
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
                        <p className="text-gray-700 text-sm md:text-base">
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
                          <h4 className="text-lg md:text-xl font-bold text-[#7762b6]">
                            Capacitação de Liderança
                          </h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
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
                        <p className="text-gray-700 text-sm md:text-base">
                          Criação de cultura organizacional saudável
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#456dc6]/8 to-[#02b1aa]/8 rounded-full px-8 py-4">
                      <CheckCircle className="w-4 h-4 text-[#456dc6] mr-3" />
                      <span className="text-[#456dc6] font-bold text-sm md:text-base">
                        Resultados Mensuráveis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
                <MapPin className="w-4 h-4 text-[#02b1aa] mr-2" />
                <span className="text-[#02b1aa] font-medium text-xs md:text-sm">
                  ENTRE EM CONTATO
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                  Visite-nos
                </span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
              <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Estamos prontos para ajudar sua empresa a promover o bem-estar
                organizacional
              </p>
            </div>

            <StaggerContainer staggerDelay={0.2}>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-16 border border-[#edfffe] hover:shadow-3xl transition-all duration-500">
                <div className="grid lg:grid-cols-3 gap-12 text-center">
                  {/* Endereço */}
                  <motion.div variants={staggerItemVariants} className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#02b1aa] to-[#029fdf] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        Endereço
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-gray-900 text-sm md:text-base leading-relaxed font-medium">
                          Av. Fernandes Lima, 8, Sala 406
                          <br />
                          Edifício Empresarial Office
                          <br />
                          Farol - Maceió
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Telefone */}
                  <motion.div variants={staggerItemVariants} className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#029fdf] to-[#01c2e3] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        Telefone
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#029fdf] to-[#01c2e3] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-[#02b1aa] font-bold text-xl md:text-2xl leading-relaxed">
                          (82) 98816-6085
                        </p>
                        <p className="text-gray-900 text-sm md:text-base mt-2">
                          Atendimento personalizado
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* CNPJ */}
                  <motion.div variants={staggerItemVariants} className="group/item relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-br from-[#01c2e3] to-[#02b1aa] rounded-2xl p-4 shadow-xl group-hover/item:scale-110 transition-transform duration-300">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="pt-12">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                        CNPJ
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#01c2e3] to-[#02b1aa] mx-auto rounded-full mb-6"></div>
                      <div className="bg-gradient-to-r from-[#edfffe] to-blue-50 rounded-2xl p-6 border border-[#edfffe]">
                        <p className="text-gray-900 font-semibold text-base md:text-lg leading-relaxed">
                          62.141.629/0001-09
                        </p>
                        <p className="text-gray-900 text-sm md:text-base mt-2">
                          Empresa registrada
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-16 pt-12 border-t border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-8 py-4">
                      <Building className="w-5 h-5 text-[#02b1aa] mr-3" />
                      <span className="text-[#02b1aa] font-bold text-base md:text-lg">
                        RECURSOS HUMANOS
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                      Especialistas em gestão de pessoas e saúde mental
                      organizacional, comprometidos com o desenvolvimento
                      sustentável das empresas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </StaggerContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { DrpsFormData, DRPS_TOPICS, DrpsScore, SCORE_LABELS } from '@/types/drps';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DrpsFormPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DrpsFormData>({
    nome: '',
    email: '',
    telefone: '',
    funcao: '',
    setor: '',
    nome_empresa: '',
    respostas: {}
  });
  const [cnpjOuCodigo, setCnpjOuCodigo] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaCnpj, setEmpresaCnpj] = useState<string>('');
  const [isCompanyValidated, setIsCompanyValidated] = useState(false);
  const [isCompanyAutoFilled, setIsCompanyAutoFilled] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<Array<{ id: string; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);

  const steps = [
    { 
      id: 'intro',
      title: 'Bem-vindo(a)!',
      description: 'Informações sobre o formulário'
    },
    { 
      id: 'identification',
      title: 'Identificação',
      description: 'Começaremos conhecendo um pouco de você'
    },
    ...DRPS_TOPICS.map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.description
    }))
  ];

  // Format CNPJ
  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  // Format Telefone
  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 10) {
      // Formato: (99) 9999-9999
      return cleaned
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 14);
    } else {
      // Formato: (99) 99999-9999
      return cleaned
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
    }
  };

  // Atualizar CNPJ ou Código
  const handleCnpjOuCodigoChange = (value: string) => {
    // Se parecer ser um CNPJ (apenas números), formata
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 0 && cleanValue === value.replace(/[.\-/]/g, "")) {
      // É um número - aplicar formatação de CNPJ
      setCnpjOuCodigo(formatCnpj(value));
    } else {
      // É alfanumérico - manter como está
      setCnpjOuCodigo(value.toUpperCase().trim());
    }
    setError('');

    // Reset validation if value changes after being validated
    if (isCompanyValidated) {
      setIsCompanyValidated(false);
      setIsCompanyAutoFilled(false);
      setFormData(prev => ({ ...prev, nome_empresa: '', setor: '' }));
      setEmpresaId(null);
      setEmpresaCnpj('');
      setSetoresDisponiveis([]);
    }
  };

  // Buscar setores da empresa
  const fetchSetores = async (companyId: string) => {
    try {
      setLoadingSetores(true);
      const response = await fetch(`/api/companies/${companyId}/setores?ativo=true`);

      if (!response.ok) {
        throw new Error('Erro ao buscar setores');
      }

      const data = await response.json();
      setSetoresDisponiveis(data);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      setSetoresDisponiveis([]);
    } finally {
      setLoadingSetores(false);
    }
  };

  // Detectar se é CNPJ ou Código e validar
  const handleValidateCompany = async () => {
    const cleanValue = cnpjOuCodigo.replace(/\D/g, "");

    // Detectar se é CNPJ (14 dígitos numéricos) ou código
    const isCnpj = cleanValue.length === 14 && cleanValue === cnpjOuCodigo.replace(/[.\-/]/g, "");

    if (!isCnpj && cnpjOuCodigo.trim().length < 3) {
      setError('Código deve ter pelo menos 3 caracteres');
      return;
    }

    if (isCnpj && cleanValue.length !== 14) {
      setError('CNPJ deve conter 14 dígitos');
      return;
    }

    setIsLoadingCompany(true);
    setError('');

    try {
      let response;
      let endpoint;

      if (isCnpj) {
        endpoint = `/api/companies/cnpj/${cleanValue}`;
      } else {
        endpoint = `/api/companies/codigo/${cnpjOuCodigo.trim().toUpperCase()}`;
      }

      response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok && data.nome) {
        setFormData(prev => ({ ...prev, nome_empresa: data.nome }));
        setEmpresaId(data.id);
        setEmpresaCnpj(formatCnpj(data.cnpj)); // Salvar CNPJ formatado
        setIsCompanyAutoFilled(true);
        setIsCompanyValidated(true);

        // Buscar setores da empresa
        await fetchSetores(data.id);
      } else {
        setError(data.error || 'Empresa não encontrada. Verifique o CNPJ/Código ou contate o administrador.');
        setIsCompanyValidated(false);
        setIsCompanyAutoFilled(false);
        setEmpresaId(null);
        setEmpresaCnpj('');
        setSetoresDisponiveis([]);
      }
    } catch (error) {
      setError('Erro ao buscar empresa. Tente novamente.');
      setIsCompanyValidated(false);
      setIsCompanyAutoFilled(false);
      setEmpresaId(null);
      setEmpresaCnpj('');
      setSetoresDisponiveis([]);
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const handlePersonalDataChange = (field: keyof Pick<DrpsFormData, 'nome' | 'email' | 'telefone' | 'funcao' | 'setor' | 'nome_empresa'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerChange = (questionId: string, score: DrpsScore) => {
    setFormData(prev => ({
      ...prev,
      respostas: {
        ...prev.respostas,
        [questionId]: score
      }
    }));
  };

  const validatePersonalData = () => {
    // If company not validated yet, can't proceed
    if (!isCompanyValidated) {
      return false;
    }

    const { email, telefone, funcao, setor, nome_empresa } = formData;

    if (!email.trim() || !telefone.trim() || !funcao.trim() || !setor.trim() || !nome_empresa.trim()) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    return true;
  };

  const canProceed = () => {
    if (currentStep === 1) { // Identificação
      return validatePersonalData();
    }
    if (currentStep > 1) { // Tópicos DRPS
      const topicIndex = currentStep - 2;
      const topic = DRPS_TOPICS[topicIndex];
      const answeredQuestions = topic.questions.filter(q => 
        formData.respostas[q.id] !== undefined
      );
      return answeredQuestions.length === topic.questions.length;
    }
    return true;
  };

  const nextStep = () => {
    setError('');

    // Validação específica para etapa de identificação
    if (currentStep === 1) {
      if (!isCompanyValidated) {
        setError('Por favor, valide o CNPJ ou Código da empresa antes de prosseguir');
        return;
      }

      const { email, telefone, funcao, setor, nome_empresa } = formData;

      if (!email.trim() || !telefone.trim() || !funcao.trim() || !setor.trim() || !nome_empresa.trim()) {
        setError('Todos os campos marcados com * são obrigatórios');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Email inválido');
        return;
      }
    }

    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      // Scroll to top smoothly when navigating to next step with a small delay
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    // Scroll to top smoothly when navigating to previous step with a small delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Se o nome estiver vazio, preenche com "Anônimo"
      const dataToSubmit = {
        ...formData,
        nome: formData.nome.trim() || 'Anônimo',
        empresa_id: empresaId // Incluir ID da empresa
      };

      const response = await fetch('/api/drps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIntroStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Modelo de DRPS - Avaliação dos Riscos Psicossociais (NR 01)
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full"></div>
      </div>

      <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Este formulário tem como objetivo avaliar os riscos psicossociais no ambiente de 
            trabalho, contribuindo para a construção de um ambiente mais saudável e seguro para 
            todos.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Sua participação
              </h3>
              <p>
                Sua participação é voluntária e suas respostas serão tratadas de forma confidencial. 
                Os dados coletados serão apresentados apenas de forma agregada ou anonimizada no 
                relatório final.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                LGPD Compliance
              </h3>
              <p>
                Ao preencher este formulário, você concorda com o uso das informações fornecidas 
                para fins de diagnóstico e análise, em conformidade com a Lei Geral de Proteção 
                de Dados (LGPD).
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              📊 Sobre o Questionário
            </h3>
            <p className="mb-4">
              O Questionário de DRPS (Diagnóstico de riscos psicossociais) foi criado com base nos 
              principais fatores de riscos psicossociais que têm levado ao adoecimento da classe 
              trabalhadora nas organizações de acordo com o Ministério do Trabalho e Emprego (MTE).
            </p>
            <div className="bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                ✨ Você responderá a 9 tópicos, cada um investigando a fundo a ocorrência desses riscos.
              </p>
              <p className="text-sm mt-2">
                <strong>Seja sincero(a):</strong> Sua resposta verdadeira ajudará a construir um ambiente 
                de trabalho mentalmente mais seguro!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderIdentificationStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Identificação</h2>
        <p className="text-gray-600">
          {!isCompanyValidated
            ? 'Primeiro, vamos validar o CNPJ ou Código da sua empresa'
            : 'Agora, complete as informações sobre você'}
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Etapa 1: Validação do CNPJ ou Código */}
          {!isCompanyValidated && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cnpjOuCodigo" className="text-sm font-medium text-gray-700">
                  CNPJ ou Código da Empresa *
                </Label>
                <Input
                  id="cnpjOuCodigo"
                  type="text"
                  value={cnpjOuCodigo}
                  onChange={(e) => handleCnpjOuCodigoChange(e.target.value)}
                  placeholder="00.000.000/0000-00 ou CODIGO123"
                  className="w-full"
                  required
                  disabled={isLoadingCompany}
                />
                {isLoadingCompany && (
                  <p className="text-xs text-blue-600">Buscando empresa...</p>
                )}
              </div>

              <Button
                onClick={handleValidateCompany}
                disabled={isLoadingCompany || cnpjOuCodigo.trim().length < 3}
                className="w-full bg-gradient-to-r from-[#02b1aa] to-[#029fdf] hover:from-[#029fdf] hover:to-[#01c2e3] text-white"
              >
                {isLoadingCompany ? 'Validando...' : 'Validar'}
              </Button>

              <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Digite o CNPJ (14 dígitos) ou o código da sua empresa para continuar
                </p>
              </div>
            </>
          )}

          {/* Etapa 2: Restante do formulário (após validação) */}
          {isCompanyValidated && (
            <>
              <div className="space-y-2 bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-green-900">
                      CNPJ da Empresa
                    </Label>
                    <p className="text-sm text-green-700 font-mono">{empresaCnpj}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCompanyValidated(false);
                      setIsCompanyAutoFilled(false);
                      setFormData(prev => ({ ...prev, nome_empresa: '', setor: '' }));
                      setCnpjOuCodigo('');
                      setEmpresaCnpj('');
                      setSetoresDisponiveis([]);
                    }}
                    className="text-xs text-green-700 hover:text-green-900 underline"
                  >
                    Alterar
                  </button>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-900">
                    Nome da Empresa
                  </Label>
                  <p className="text-sm text-green-700">{formData.nome_empresa}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handlePersonalDataChange('nome', e.target.value)}
                    placeholder="Digite seu nome completo (opcional)"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handlePersonalDataChange('telefone', formatTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setor" className="text-sm font-medium text-gray-700">
                    Setor *
                  </Label>
                  <Select
                    value={formData.setor}
                    onValueChange={(value) => handlePersonalDataChange('setor', value)}
                    disabled={loadingSetores}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingSetores ? "Carregando setores..." : "Selecione seu setor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {setoresDisponiveis.length === 0 ? (
                        <SelectItem value="no-sectors" disabled>
                          Nenhum setor disponível
                        </SelectItem>
                      ) : (
                        setoresDisponiveis.map((setor) => (
                          <SelectItem key={setor.id} value={setor.nome}>
                            {setor.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {loadingSetores && (
                    <p className="text-xs text-blue-600">Carregando setores...</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcao" className="text-sm font-medium text-gray-700">
                  Função *
                </Label>
                <Input
                  id="funcao"
                  type="text"
                  value={formData.funcao}
                  onChange={(e) => handlePersonalDataChange('funcao', e.target.value)}
                  placeholder="Ex: Analista, Coordenador, Assistente..."
                  className="w-full"
                  required
                />
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                <p className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Todos os campos marcados com * são obrigatórios
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  const renderTopicStep = () => {
    const topicIndex = currentStep - 2;
    const topic = DRPS_TOPICS[topicIndex];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {topic.description}
          </p>
          <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
            <p>0 = Nunca | 1 = Raramente | 2 = Ocasionalmente | 3 = Frequentemente | 4 = Sempre</p>
          </div>
        </div>

        <div className="space-y-6">
          {topic.questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 leading-relaxed">
                  {question.text}
                </h3>
                
                {/* Desktop layout - hidden on mobile */}
                <div className="hidden md:flex md:flex-wrap gap-3">
                  {[0, 1, 2, 3, 4].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswerChange(question.id, score as DrpsScore)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        formData.respostas[question.id] === score
                          ? 'bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs font-bold">
                        {score}
                      </span>
                      {SCORE_LABELS[score as DrpsScore]}
                    </button>
                  ))}
                </div>

                {/* Mobile layout - single column with full-width buttons */}
                <div className="flex flex-col space-y-2 md:hidden">
                  {[0, 1, 2, 3, 4].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleAnswerChange(question.id, score as DrpsScore)}
                      className={`w-full  p-4 rounded-xl font-medium transition-all duration-200 flex items-center  gap-3 ${
                        formData.respostas[question.id] === score
                          ? 'bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-bold">
                        {score}
                      </span>
                      <span className="text-base">
                        {SCORE_LABELS[score as DrpsScore]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            Respondidas: {topic.questions.filter(q => formData.respostas[q.id] !== undefined).length} de {topic.questions.length} perguntas
          </p>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Formulário Enviado com Sucesso!
          </h1>
          
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              Obrigado por sua participação no Diagnóstico de Riscos Psicossociais.
            </p>
            <p>
              Suas respostas foram registradas e serão utilizadas para melhorar o ambiente 
              de trabalho e promover a saúde mental no ambiente organizacional.
            </p>
          </div>

          <div className="pt-6">
            <Link href="/portal-publico">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] hover:from-[#029fdf] hover:to-[#01c2e3] text-white font-semibold px-8 py-3 rounded-xl"
              >
                Voltar ao Portal Público
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If form is not shown, display landing page
  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-20 md:pt-24 pb-8 md:pb-12 px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-4">
              Diagnóstico de Riscos
              <span className="block bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                Psicossociais (DRPS)
              </span>
            </h1>
            <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full"></div>
            <p className="text-sm md:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Ferramenta de avaliação baseada na NR-01 para identificação de riscos psicossociais no ambiente de trabalho
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-16 space-y-12">
          {/* What is DRPS */}
          <Card className="p-4 md:p-6 lg:p-8 bg-white shadow-xl">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center px-4">
                O que é o DRPS?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">Baseado na NR-01</h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        Desenvolvido conforme as diretrizes do Ministério do Trabalho e Emprego (MTE) para identificação de riscos psicossociais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">Avaliação Científica</h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        Questionário estruturado com 9 dimensões que investigam os principais fatores de risco psicossocial no trabalho.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Confidencialidade</h3>
                      <p className="text-gray-600">
                        Suas respostas são confidenciais e serão apresentadas apenas de forma agregada no relatório final.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">LGPD Compliance</h3>
                      <p className="text-gray-600">
                        Em conformidade com a Lei Geral de Proteção de Dados, garantindo a segurança das suas informações.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Assessment Details */}
          <Card className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <div className="text-center space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 px-4">
                Como funciona a avaliação?
              </h2>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-white font-bold text-base md:text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Identificação</h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Informações básicas sobre você e sua função na empresa
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">9 Dimensões</h3>
                  <p className="text-gray-600 text-sm">
                    Questionário com 90 perguntas distribuídas em 9 tópicos principais
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Relatório</h3>
                  <p className="text-gray-600 text-sm">
                    Análise detalhada dos riscos identificados e recomendações
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Topics Overview */}
          <Card className="p-8 bg-white shadow-xl">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Dimensões Avaliadas
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {DRPS_TOPICS.map((topic, index) => (
                  <div key={topic.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{topic.title}</h3>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <Card className="p-4 md:p-6 lg:p-8 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white text-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold px-4">
                Pronto para começar sua avaliação?
              </h2>
              <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-2xl mx-auto px-4">
                A avaliação leva aproximadamente 15-20 minutos para ser concluída.
                Seja honesto(a) em suas respostas - isso ajudará a construir um ambiente de trabalho mais saudável para todos.
              </p>

              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-white text-[#02b1aa] hover:bg-gray-50 font-semibold px-6 md:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  Iniciar Avaliação DRPS
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </span>
              </Button>
              
              <p className="text-xs md:text-sm opacity-75 px-4">
                ✅ Participação voluntária • ✅ Dados protegidos • ✅ Resultados confidenciais
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If form is shown, render the assessment form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-24 pb-12 px-4">
      {/* Header com progresso */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              Avaliação DRPS - Clínica Resilience
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Etapa {currentStep + 1} de {steps.length}
              </div>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                size="sm"
                className="text-xs md:text-sm px-3 py-1.5"
              >
                Voltar
              </Button>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
            <div
              className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] h-2 md:h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Conteúdo das etapas */}
      <div className="max-w-6xl mx-auto">
        {currentStep === 0 && renderIntroStep()}
        {currentStep === 1 && renderIdentificationStep()}
        {currentStep > 1 && renderTopicStep()}

        {/* Mensagem de erro */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="max-w-4xl mx-auto mt-8 flex items-center justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] hover:from-[#029fdf] hover:to-[#01c2e3] text-white flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center gap-2 px-8"
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar Avaliação'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

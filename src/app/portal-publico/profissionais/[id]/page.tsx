"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/client";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image, { StaticImageData } from "next/image";
import IconeProfissional from "@/app/assets/icones/logo.png";
import { CheckCircle2, UserPlus, Mail, Lock, Eye, EyeOff, Calendar, Clock } from "lucide-react";

type AgendaDia = {
  disponiveis: string[];
  ocupados: string[];
};

type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  crp: string;
  descricao: string;
  foto: StaticImageData;
  agenda: Record<string, AgendaDia>;
};

// 🔹 Mock com agenda
const hoje = new Date();
const anoAtual = hoje.getFullYear();
const mesAtual = hoje.getMonth();

const formatarData = (dia: number) =>
  `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(
    2,
    "0"
  )}`;

const profissionais: Profissional[] = [
  {
    id: "ana",
    nome: "Dra. Ana Souza",
    especialidade: "Psicóloga Clínica",
    crp: "CRP 12/34567",
    descricao:
      "Atendimento individual e em grupo, com foco em terapia cognitivo-comportamental.",
    foto: IconeProfissional,
    agenda: {
      [formatarData(2)]: {
        disponiveis: ["09:00", "10:00"],
        ocupados: ["14:00"],
      },
      [formatarData(5)]: {
        disponiveis: ["08:30", "11:00"],
        ocupados: ["13:30"],
      },
      [formatarData(10)]: {
        disponiveis: ["15:00"],
        ocupados: ["09:00", "10:00"],
      },
    },
  },
];

export default function PerfilProfissional() {
  const params = useParams();
  const profissional = profissionais.find((p) => p.id === params.id);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [abrirModal, setAbrirModal] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
  // Estado do usuário logado
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal de cadastro e payload pendente de agendamento
  const [showCadastro, setShowCadastro] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ profissional_id: string; data: string; hora: string } | null>(null);

  // Campos do cadastro
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [emailCad, setEmailCad] = useState('');
  const [passwordCad, setPasswordCad] = useState('');
  const [repeatPasswordCad, setRepeatPasswordCad] = useState('');

  const [cadastroError, setCadastroError] = useState<string | null>(null);
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [signupCooldownUntil, setSignupCooldownUntil] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [cadastroSuccess, setCadastroSuccess] = useState(false);

  // Atualiza e-mail do usuário logado via AuthContext
  useEffect(() => {
    if (user) {
      setUserEmail(user.email ?? null);
      setEmailCad(user.email ?? '');
    } else {
      setUserEmail(null);
    }
  }, [user]);


  //  Gera estrutura de calendário do mês atual
  const diasCalendario = useMemo(() => {
    const primeiroDiaMes = new Date(anoAtual, mesAtual, 1);
    const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0);

    const dias: (Date | null)[] = [];

    // Espaços antes do primeiro dia
    const inicioSemana = primeiroDiaMes.getDay(); // 0 = domingo
    for (let i = 0; i < inicioSemana; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
      dias.push(new Date(anoAtual, mesAtual, d));
    }

    return dias;
  }, [anoAtual, mesAtual]);

  if (!profissional) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Profissional não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-20 lg:flex-row justify-between items-start min-h-screen bg-gray-50 p-6">
      {/* Perfil (esquerda) */}
      <Card className="w-full lg:w-1/2 max-w-2xl bg-white shadow-md rounded-2xl   p-8 flex flex-col items-center text-center">
        <div className="w-40 h-40 -mt-14 mb-4 rounded-full overflow-hidden border-4 border-azul-escuro shadow-sm bg-gray-100">
          <Image
            src={profissional.foto}
            alt={`Foto de ${profissional.nome}`}
            width={160}
            height={160}
            className="object-cover w-full h-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          {profissional.nome}
        </h1>
        <p className="text-sm text-azul-escuro">{profissional.especialidade}</p>
        <p className="text-xs text-gray-500">{profissional.crp}</p>

        <p className="mt-4 text-gray-600 text-sm leading-relaxed">
          {profissional.descricao}
        </p>
      </Card>

      {/* Calendário (direita) */}
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 lg:ml-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Agenda de {hoje.toLocaleString("pt-BR", { month: "long" })} /{" "}
          {anoAtual}
        </h2>
        {userEmail && (
          <p className="text-sm text-gray-600 mb-2">
            Agendando como: {userEmail}
          </p>
        )}

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 text-center mb-2 font-medium text-gray-600">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia}>{dia}</div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {diasCalendario.map((dia, index) => {
            if (!dia) return <div key={index} className="p-1" />;

            const dataStr = dia.toISOString().split("T")[0];
            const temAgenda = Boolean(profissional.agenda[dataStr]);

            return (
              <button
                key={dataStr}
                onClick={() => {
                  if (temAgenda) {
                    setDiaSelecionado(dataStr);
                    setHoraSelecionada(null);
                    setAbrirModal(true);
                  }
                }}
                className={`p-2 rounded-lg text-xs sm:text-sm transition w-full 
                h-10 sm:h-12 md:h-14 flex items-center justify-center
                ${
                  temAgenda
                    ? "bg-azul-escuro text-white hover:bg-azul-medio"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {dia.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de horários */}
      <Dialog open={abrirModal} onOpenChange={setAbrirModal}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:max-w-lg max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-azul-escuro">
              Horários em {diaSelecionado?.split("-").reverse().join("/")}
            </DialogTitle>
          </DialogHeader>

          {/* Lista de horários */}
          {diaSelecionado && profissional.agenda[diaSelecionado] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {profissional.agenda[diaSelecionado].disponiveis.map((hora) => (
                <Button
                  key={hora}
                  onClick={() => setHoraSelecionada(hora)}
                  className={`rounded-lg py-3 text-sm font-medium transition 
              ${
                horaSelecionada === hora
                  ? "bg-azul-medio text-white shadow-md scale-105"
                  : "bg-azul-escuro text-white hover:bg-azul-medio"
              }`}
                >
                  {hora}
                </Button>
              ))}

              {profissional.agenda[diaSelecionado].ocupados.map((hora) => (
                <div
                  key={hora}
                  className="bg-gray-200 text-gray-500 rounded-lg py-3 flex items-center justify-center text-sm line-through"
                >
                  {hora}
                </div>
              ))}
            </div>
          )}

          {/* Botão confirmar */}
          <DialogFooter className="mt-8">
            <Button
              onClick={async () => {
                if (!horaSelecionada || !diaSelecionado) return;

                const payload = {
                  profissional_id: profissional.id,
                  data: diaSelecionado,
                  hora: horaSelecionada,
                };

                try {
                  const res = await fetch("/api/agendamentos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (res.status === 401) {
                    // Usuário não logado: abrir modal de cadastro e preservar payload
                    setPendingPayload(payload);
                    setShowCadastro(true);
                    return;
                  }

                  if (!res.ok) {
                    const msg = await res.text().catch(() => "");
                    console.error("Erro ao salvar agendamento:", msg);
                    alert("Erro ao confirmar agendamento.");
                    return;
                  }
                } catch (e) {
                  console.error("Erro de rede ao salvar agendamento:", e);
                  alert("Erro ao confirmar agendamento.");
                  return;
                }

                // Se deu certo, fecha modal e abre sucesso
                setAbrirModal(false);
                setAgendamentoConfirmado(true);
              }}
              disabled={!horaSelecionada}
              className="w-full rounded-lg bg-azul-escuro text-white hover:bg-azul-medio disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de cadastro para agendar - REDESENHADO */}
      <Dialog open={showCadastro} onOpenChange={setShowCadastro}>
        <DialogContent className="w-[90vw] sm:max-w-lg max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-xl p-0 bg-white border-0">
          {/* Header com gradiente - mais minimalista */}
          <div className="bg-gradient-to-r from-azul-escuro to-azul-medio text-white p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <UserPlus className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold text-white">
                Finalizar Agendamento
              </DialogTitle>
            </div>
            
            {/* Contexto do agendamento - mais compacto */}
            <div className="mt-3 bg-white/10 rounded-md p-2 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{diaSelecionado ? diaSelecionado.split("-").reverse().join("/") : "-"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{horaSelecionada || "-"}</span>
                </div>
              </div>
              <p className="text-xs mt-1 opacity-75">{profissional.nome}</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="p-5">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!pendingPayload) {
                  setCadastroError("Nenhum agendamento pendente.");
                  return;
                }
                if (passwordCad !== repeatPasswordCad) {
                  setCadastroError("As senhas não conferem.");
                  return;
                }
                if (passwordCad.length < 6) {
                  setCadastroError("A senha deve ter pelo menos 6 caracteres.");
                  return;
                }
                // Cooldown para evitar 429 do Supabase
                if (signupCooldownUntil && Date.now() < signupCooldownUntil) {
                  const secs = Math.ceil((signupCooldownUntil - Date.now()) / 1000);
                  setCadastroError(`Muitas tentativas. Aguarde ${secs}s e tente novamente.`);
                  return;
                }
                setCadastroLoading(true);
                setCadastroError(null);
                setCadastroSuccess(false);
                
                try {
                  const supabase = createClient();
                  // Tentar cadastrar
                  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: emailCad,
                    password: passwordCad,
                  });
                  if (signUpError) {
                    // Rate limit
                    const status = (signUpError as any)?.status;
                    if (status === 429) {
                      setCadastroError("Muitas tentativas. Aguarde alguns instantes e tente novamente.");
                      setSignupCooldownUntil(Date.now() + 30_000);
                      return;
                    }
                    // Se já existir ou outra falha, tentar login direto
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                      email: emailCad,
                      password: passwordCad,
                    });
                    if (signInError) {
                      throw signUpError;
                    }
                  } else {
                    // Se o projeto exigir confirmação de email, a sessão pode ser nula
                    if (!signUpData?.session) {
                      // Tentar obter sessão com signIn (só funciona se o email não precisar de confirmação)
                      await supabase.auth
                        .signInWithPassword({
                          email: emailCad,
                          password: passwordCad,
                        })
                        .catch(() => {});
                    }
                  }

                  // Garantir sessão
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;
                  if (!user) {
                    throw new Error(
                      "Não foi possível autenticar após cadastro. Caso seu projeto exija confirmação de email, confirme o link enviado e tente novamente."
                    );
                  }

                  // Registrar/atualizar perfil na tabela 'usuarios'
                  try {
                    const upsertPayload: Record<string, any> = {
                      id: user.id,
                      nome,
                      email: emailCad,
                      tipo_usuario: "paciente",
                    };
                    if (dataNascimento) {
                      upsertPayload.data_nascimento = dataNascimento;
                    }
                    // Persistência omitida no mock:
                    // (supabase as any).from("usuarios").upsert?.([upsertPayload], { onConflict: "id" });
                  } catch (e) {
                    console.warn("Falha ao registrar perfil em 'usuarios'", e);
                  }

                  setCadastroSuccess(true);
                  
                  // Aguardar um pouco para mostrar o sucesso
                  setTimeout(async () => {
                    try {
                      // Reenviar o agendamento
                      const res = await fetch("/api/agendamentos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(pendingPayload),
                      });

                      if (!res.ok) {
                        const msg = await res.text().catch(() => "");
                        throw new Error(msg || "Erro ao confirmar agendamento após cadastro.");
                      }

                      setShowCadastro(false);
                      setAbrirModal(false);
                      setAgendamentoConfirmado(true);
                    } catch (err: any) {
                      setCadastroSuccess(false);
                      const msg = err?.message || "Erro ao confirmar agendamento.";
                      setCadastroError(msg);
                    }
                  }, 1500);
                  
                } catch (err: any) {
                  const msg = err?.message || "Erro ao realizar cadastro.";
                  setCadastroError(msg);
                } finally {
                  if (!cadastroSuccess) {
                    setCadastroLoading(false);
                  }
                }
              }}
              className="space-y-6"
            >
              {/* Campo Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={cadastroLoading || cadastroSuccess}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="emailCad" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                <Input
                  id="emailCad"
                  type="email"
                  placeholder="seu@email.com"
                  value={emailCad}
                  onChange={(e) => setEmailCad(e.target.value)}
                  disabled={cadastroLoading || cadastroSuccess}
                  className="h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 transition-all duration-200"
                  required
                />
              </div>
              
              {/* Campos de Senha */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordCad" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="passwordCad"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={passwordCad}
                      onChange={(e) => setPasswordCad(e.target.value)}
                      disabled={cadastroLoading || cadastroSuccess}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 transition-all duration-200 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={cadastroLoading || cadastroSuccess}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repeatPasswordCad" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="repeatPasswordCad"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={repeatPasswordCad}
                      onChange={(e) => setRepeatPasswordCad(e.target.value)}
                      disabled={cadastroLoading || cadastroSuccess}
                      className="h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 transition-all duration-200 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={cadastroLoading || cadastroSuccess}
                    >
                      {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback de erro */}
              {cadastroError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {cadastroError}
                  </p>
                </div>
              )}
              
              {/* Feedback de sucesso */}
              {cadastroSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Conta criada com sucesso! Confirmando agendamento...
                  </p>
                </div>
              )}

              {/* Botões */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 sm:flex-1 border-2 border-azul-escuro text-azul-escuro hover:bg-azul-escuro hover:text-white transition-all duration-200"
                  disabled={cadastroLoading || cadastroSuccess}
                  onClick={() => {
                    try {
                      const storagePayload = pendingPayload ?? (
                        diaSelecionado && horaSelecionada
                          ? { profissional_id: profissional.id, data: diaSelecionado, hora: horaSelecionada }
                          : null
                      )
                      if (storagePayload) {
                        const dataStr = diaSelecionado ?? storagePayload.data
                        const horaStr = horaSelecionada ?? storagePayload.hora
                        window.localStorage.setItem(
                          "resilience_pending_appointment",
                          JSON.stringify({
                            ...storagePayload,
                            profissional_nome: profissional.nome,
                            data: dataStr,
                            hora: horaStr,
                          })
                        )
                      }
                    } catch {}
                    setShowCadastro(false);
                    window.location.href = "/auth/login";
                  }}
                >
                  Já tenho cadastro
                </Button>

                <Button
                  type="submit"
                  disabled={cadastroLoading || cadastroSuccess}
                  className="h-12 sm:flex-1 text-white font-semibold rounded-lg bg-gradient-to-r from-azul-escuro to-azul-medio hover:from-azul-medio hover:to-azul-vivido hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {cadastroLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Criando conta...
                    </div>
                  ) : cadastroSuccess ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Conta criada!
                    </div>
                  ) : (
                    "Criar conta e agendar"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de sucesso */}
      <Dialog
        open={agendamentoConfirmado}
        onOpenChange={setAgendamentoConfirmado}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md w-full rounded-2xl shadow-xl p-6 bg-white flex flex-col items-center text-center">
          <CheckCircle2 className="text-green-500 w-12 h-12 mb-4" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Agendamento confirmado!
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Seu horário foi reservado com sucesso.
          </p>
          <DialogFooter className="mt-6 w-full">
            <Button
              className="w-full bg-azul-escuro text-white hover:bg-azul-medio"
              onClick={() => (window.location.href = "/tela-usuario/agendamentos")}
            >
              Ir para meus agendamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

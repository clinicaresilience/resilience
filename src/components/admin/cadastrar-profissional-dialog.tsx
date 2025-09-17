"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { criarProfissional } from "../../app/actions/criar-profissional";
import { RefreshCw } from "lucide-react";
import { 
  normalizarCRP, 
  validarCRP, 
  aplicarMascaraCRP, 
  validarCRPEmTempoReal 
} from "@/utils/crp-validation";

interface CadastrarProfissionalDialogProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CadastrarProfissionalDialog({ onSuccess, onError }: CadastrarProfissionalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  // Função para permitir apenas números e limitar caracteres
  const handleNumericInput = (value: string, maxLength: number) => {
    return value.replace(/\D/g, '').slice(0, maxLength);
  };

  // Função para formatar CPF
  const formatCpf = (value: string) => {
    const numericValue = handleNumericInput(value, 11);
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    const numericValue = handleNumericInput(value, 11);
    if (numericValue.length <= 10) {
      return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numericValue.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };
  const [area, setArea] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [crp, setCrp] = useState("");
  const [crpError, setCrpError] = useState("");
  const [crpAviso, setCrpAviso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");

  const resetForm = () => {
    setNome("");
    setEmail("");
    setCpf("");
    setTelefone("");
    setArea("");
    setEspecialidade("");
    setCrp("");
    setDescricao("");
    setSenha("");
    setError(null);
    setSuccess(null);
  };

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    setSenha(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validações do frontend
    if (!nome.trim() || !email.trim() || !cpf.trim() || !telefone.trim() || !area.trim() || !especialidade.trim() || !crp.trim()) {
      setError("Preencha todos os campos obrigatórios (Nome, Email, CPF, Telefone, Área, Especialidade e CRP).");
      setLoading(false);
      return;
    }

    // Validar CRP
    const validacaoCRP = validarCRP(crp);
    if (!validacaoCRP.valido) {
      setError(validacaoCRP.erro || "CRP inválido");
      setLoading(false);
      return;
    }

    // Validar CPF (11 dígitos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setError("CPF deve conter exatamente 11 dígitos.");
      setLoading(false);
      return;
    }

    // Validar telefone (11 dígitos)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      setError("Telefone deve conter exatamente 11 dígitos (DDD + número com 9 dígitos).");
      setLoading(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }

    try {
      // Usar senha do estado ou gerar uma se estiver vazia
      const senhaFinal = senha.trim() || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      const result = await criarProfissional({
        nome,
        email,
        cpf,
        telefone,
        senha: senhaFinal,
        area,
        especialidade,
        crp: normalizarCRP(crp), // Normalizar antes de enviar
        descricao,
      });

      setSuccess(`Profissional cadastrado com sucesso! Senha temporária: ${result.senha}`);
      onSuccess?.();
      
      // Fechar modal após 2 segundos para que o usuário veja a mensagem de sucesso
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar profissional.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-azul-escuro text-white">
          Cadastrar profissional
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar profissional</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo profissional. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00 (11 dígitos obrigatórios)"
              maxLength={14}
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone WhatsApp *</Label>
            <Input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatTelefone(e.target.value))}
              placeholder="(11) 99999-9999 - 11 dígitos obrigatórios"
              maxLength={15}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Deve conter DDD + 9 dígitos (formato WhatsApp)
            </p>
          </div>

          <div>
            <Label htmlFor="area">Área *</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              placeholder="Ex: Psicologia Clínica, Neuropsicologia, etc."
            />
          </div>

          <div>
            <Label htmlFor="especialidade">Especialidade *</Label>
            <Input
              id="especialidade"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              required
              placeholder="Ex: Terapia Cognitivo-Comportamental, Psicanálise, etc."
            />
          </div>

          <div>
            <Label htmlFor="crp">CRP *</Label>
            <Input
              id="crp"
              value={crp}
              onChange={(e) => {
                const valor = aplicarMascaraCRP(e.target.value);
                setCrp(valor);
                
                // Validação em tempo real
                const validacao = validarCRPEmTempoReal(valor);
                if (validacao.mensagem) {
                  setCrpError(validacao.mensagem);
                  setCrpAviso("");
                } else if (validacao.aviso) {
                  setCrpError("");
                  setCrpAviso(validacao.aviso);
                } else {
                  setCrpError("");
                  setCrpAviso("");
                }
              }}
              className={crpError ? "border-red-500" : ""}
              required
              placeholder="SP/06123 ou SP06123"
            />
            {crpError && (
              <p className="text-sm text-red-500 mt-1">{crpError}</p>
            )}
            {crpAviso && (
              <p className="text-sm text-blue-500 mt-1">{crpAviso}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Formato: Sigla do estado + número (ex: SP06123, RJ12345)
            </p>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição adicional (opcional)"
            />
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <div className="flex gap-2">
              <Input
                id="senha"
                type="text"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Clique em gerar senha ou digite uma"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="px-3"
                title="Gerar senha aleatória"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {senha ? "Senha definida" : "Será gerada automaticamente se não preenchida"}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-azul-escuro text-white"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

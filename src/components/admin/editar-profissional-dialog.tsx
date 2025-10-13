"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { editarProfissional } from "../../app/actions/editar-profissional";
import {
  normalizarCRP,
  validarCRP,
  aplicarMascaraCRP,
  validarCRPEmTempoReal
} from "@/utils/crp-validation";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  area?: string;
  especialidade?: string;
  crp?: string;
  bio?: string;
  avatar_url?: string;
}

interface EditarProfissionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissional: Usuario | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function EditarProfissionalDialog({
  open,
  onOpenChange,
  profissional,
  onSuccess,
  onError
}: EditarProfissionalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [area, setArea] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [crp, setCrp] = useState("");
  const [crpError, setCrpError] = useState("");
  const [crpAviso, setCrpAviso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Preencher campos quando o profissional mudar
  useEffect(() => {
    if (profissional) {
      setNome(profissional.nome || "");
      setEmail(profissional.email || "");
      setCpf(formatCpf(profissional.cpf || ""));
      setTelefone(formatTelefone(profissional.telefone || ""));
      setArea(profissional.area || "");
      setEspecialidade(profissional.especialidade || "");
      setCrp(profissional.crp || "");
      setDescricao(profissional.bio || "");
      setFotoPreview(profissional.avatar_url || null);
      setFotoFile(null);
      setError(null);
      setSuccess(null);
      setCrpError("");
      setCrpAviso("");
    }
  }, [profissional]);

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

  const resetForm = () => {
    if (profissional) {
      setNome(profissional.nome || "");
      setEmail(profissional.email || "");
      setCpf(formatCpf(profissional.cpf || ""));
      setTelefone(formatTelefone(profissional.telefone || ""));
      setArea(profissional.area || "");
      setEspecialidade(profissional.especialidade || "");
      setCrp(profissional.crp || "");
      setDescricao(profissional.bio || "");
      setFotoPreview(profissional.avatar_url || null);
      setFotoFile(null);
    }
    setError(null);
    setSuccess(null);
    setCrpError("");
    setCrpAviso("");
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("A foto deve ter no máximo 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Formato de imagem inválido. Use JPG, PNG ou WEBP");
        return;
      }

      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profissional) return;

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
      // Upload da foto, se fornecida
      let fotoUrl: string | undefined = profissional.avatar_url || undefined;
      if (fotoFile) {
        const formData = new FormData();
        formData.append("file", fotoFile);

        const uploadResponse = await fetch("/api/upload-foto-profissional", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Erro ao fazer upload da foto");
        }

        const uploadData = await uploadResponse.json();
        fotoUrl = uploadData.url;
      }

      await editarProfissional({
        userId: profissional.id,
        nome,
        email,
        cpf,
        telefone,
        area,
        especialidade,
        crp: normalizarCRP(crp),
        descricao,
        foto_url: fotoUrl,
      });

      setSuccess(`Profissional atualizado com sucesso!`);
      onSuccess?.();

      // Fechar modal após 1.5 segundos
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar profissional.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!profissional) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
    >
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Profissional</DialogTitle>
          <DialogDescription>
            Atualize os dados do profissional. Campos marcados com * são obrigatórios.
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
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              title="O email não pode ser alterado"
            />
            <p className="text-xs text-gray-500 mt-1">
              O email não pode ser alterado
            </p>
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
            <Label htmlFor="descricao">Mini Bio</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve biografia do profissional (opcional)"
            />
          </div>

          <div>
            <Label htmlFor="foto">Foto do Profissional</Label>
            <div className="space-y-3">
              {fotoPreview && (
                <div className="flex justify-center">
                  <img
                    src={fotoPreview}
                    alt="Preview da foto"
                    className="w-32 h-32 rounded-full object-cover border-2 border-azul-escuro"
                  />
                </div>
              )}
              <Input
                id="foto"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFotoChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-azul-escuro text-white"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

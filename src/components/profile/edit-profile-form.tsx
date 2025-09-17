"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Upload,
  Save,
  X,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  normalizarCRP, 
  validarCRP, 
  aplicarMascaraCRP, 
  validarCRPEmTempoReal 
} from "@/utils/crp-validation";

interface User {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  bio?: string;
  avatar_url?: string;
  area?: string;
  especialidade?: string;
  crp?: string;
}

interface EditProfileFormProps {
  user: User;
  userType: "administrador" | "profissional" | "comum";
  onSave?: (updatedUser: Partial<User>) => Promise<void>;
}

export function EditProfileForm({
  user,
  userType,
  onSave,
}: EditProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar_url || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: user.nome || "",
    telefone: user.telefone || "",
    data_nascimento: user.data_nascimento || "",
    endereco: user.endereco || "",
    bio: user.bio || "",
    area: user.area || "",
    especialidade: user.especialidade || "",
    crp: user.crp || "",
  });

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "nome":
        if (!value.trim()) return "Nome é obrigatório";
        if (value.length < 2) return "Nome deve ter pelo menos 2 caracteres";
        return "";
      
      case "telefone":
        if (value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
          return "Formato: (11) 99999-9999";
        }
        return "";
      
      case "crp":
        if (userType === "profissional" && value) {
          const validacao = validarCRP(value);
          return validacao.valido ? "" : (validacao.erro || "CRP inválido");
        }
        return "";
      
      default:
        return "";
    }
  };

  const formatTelefone = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === "telefone") {
      formattedValue = formatTelefone(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    
    // Validar campo em tempo real
    const error = validateField(field, formattedValue);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    const res = await fetch("/api/upload-avatar", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao enviar avatar");
    }

    const result = await res.json();
    return result.avatar_url;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!onSave) return;

    if (!validateForm()) {
      alert("Por favor, corrija os erros antes de salvar.");
      return;
    }

    setIsLoading(true);
    try {
      const updatedData: Partial<User> = { ...formData };

      // Se houver uma nova foto, fazer upload primeiro
      if (avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(avatarFile);
          updatedData.avatar_url = avatarUrl;
          setAvatarPreview(avatarUrl);
        } catch (uploadError) {
          console.error("Erro no upload:", uploadError);
          alert(`Erro ao fazer upload da imagem: ${uploadError}`);
          return;
        }
      }

      await onSave(updatedData);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: user.nome || "",
      telefone: user.telefone || "",
      data_nascimento: user.data_nascimento || "",
      endereco: user.endereco || "",
      bio: user.bio || "",
      area: user.area || "",
      especialidade: user.especialidade || "",
      crp: user.crp || "",
    });
    setAvatarPreview(user.avatar_url || null);
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case "administrador":
        return "Administrador";
      case "profissional":
        return "Profissional";
      case "comum":
        return "Paciente";
      default:
        return "Usuário";
    }
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case "administrador":
        return "from-purple-400 to-purple-600";
      case "profissional":
        return "from-blue-400 to-blue-600";
      case "comum":
        return "from-green-400 to-green-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informações Pessoais */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  readOnly={!isEditing}
                  className={cn(
                    !isEditing ? "bg-gray-50" : "",
                    errors.nome ? "border-red-500" : ""
                  )}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  readOnly={!isEditing}
                  className={cn(
                    !isEditing ? "bg-gray-50" : "",
                    errors.telefone ? "border-red-500" : ""
                  )}
                />
                {errors.telefone && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="nascimento">Data de Nascimento</Label>
                <Input
                  id="nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) =>
                    handleInputChange("data_nascimento", e.target.value)
                  }
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Rua, número, bairro, cidade"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>

            {/* Campos específicos para profissionais */}
            {userType === "profissional" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Informações Profissionais
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Área de Atuação</Label>
                    <Input
                      id="area"
                      placeholder="Ex: Psicologia Clínica"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crp">CRP</Label>
                    <Input
                      id="crp"
                      placeholder="SP/123456"
                      value={formData.crp}
                      onChange={(e) => handleInputChange("crp", e.target.value)}
                      readOnly={!isEditing}
                      className={cn(
                        !isEditing ? "bg-gray-50" : "",
                        errors.crp ? "border-red-500" : ""
                      )}
                    />
                    {errors.crp && (
                      <p className="text-sm text-red-500 mt-1">{errors.crp}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="especialidade">Especialidades</Label>
                  <Input
                    id="especialidade"
                    placeholder="Ex: Terapia Cognitivo-Comportamental, Psicanálise"
                    value={formData.especialidade}
                    onChange={(e) => handleInputChange("especialidade", e.target.value)}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </>
            )}

            {userType !== "comum" && (
              <div>
                <Label htmlFor="bio">Biografia/Descrição</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Foto de Perfil e Resumo */}
      <div>
        {/* Foto de Perfil */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div
                  className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-r border-4 border-gray-200",
                    getUserTypeColor()
                  )}
                >
                  <User className="w-12 h-12 text-white" />
                </div>
              )}

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {isEditing && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Resumo da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r",
                  getUserTypeColor()
                )}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {getUserTypeLabel()}
                </p>
                <p className="text-sm text-blue-700">Conta ativa</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Membro desde Janeiro 2024</span>
              </div>
              {formData.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{formData.telefone}</span>
                </div>
              )}
              {formData.endereco && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{formData.endereco}</span>
                </div>
              )}
              {userType === "profissional" && formData.crp && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>CRP: {formData.crp}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

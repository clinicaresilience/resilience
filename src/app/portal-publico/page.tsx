"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PortalPublico() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoProfissional, setTipoProfissional] = useState("");
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  // Mock: profissionais por tipo
  const profissionaisPorTipo: Record<string, { id: string; nome: string }[]> = {
    psicologo: [
      { id: "ana", nome: "Dra. Ana (Psicóloga)" },
      { id: "marcos", nome: "Dr. Marcos (Psicólogo)" },
    ],
    cardiologista: [
      { id: "carlos", nome: "Dr. Carlos (Cardiologista)" },
      { id: "helena", nome: "Dra. Helena (Cardiologista)" },
    ],
    dermatologista: [{ id: "maria", nome: "Dra. Maria (Dermatologista)" }],
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <Card className="w-full max-w-lg border border-gray-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-azul-escuro-secundario)]">
            Agendamento
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados abaixo para realizar seu agendamento
          </p>
        </CardHeader>

        <CardContent className="text-black">
          <form className="flex flex-col gap-4">
            {/* Nome */}
            <div className="grid gap-1.5">
              <Label htmlFor="nome" className="text-sm text-gray-700">
                Nome completo
              </Label>
              <Input
                required
                id="nome"
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-sm text-gray-700">
                E-mail
              </Label>
              <Input
                required
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Telefone */}
            <div className="grid gap-1.5">
              <Label htmlFor="telefone" className="text-sm text-gray-700">
                Telefone
              </Label>
              <Input
                required
                id="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Tipo de profissional */}
            <div className="grid gap-1.5">
              <Label className="text-sm text-gray-700">Área de atuação</Label>
              <Select
                onValueChange={(value) => {
                  setTipoProfissional(value);
                  setProfissional("");
                }}
              >
                <SelectTrigger className="border-gray-300 bg-white focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]">
                  <SelectValue placeholder="Selecione o tipo de profissional" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300">
                  <SelectItem value="psicologo">Psicólogo</SelectItem>
                  <SelectItem value="cardiologista">Cardiologista</SelectItem>
                  <SelectItem value="dermatologista">Dermatologista</SelectItem>
                </SelectContent>
              </Select>
              {/* Campo hidden para validar required */}
              <input type="hidden" value={tipoProfissional} required />
            </div>

            {/* Profissional */}
            <div className="grid gap-1.5">
              <Label className="text-sm text-gray-700">Profissional</Label>
              <Select
                disabled={!tipoProfissional}
                onValueChange={setProfissional}
              >
                <SelectTrigger className="border-gray-300 bg-white focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300">
                  {profissionaisPorTipo[tipoProfissional]?.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Campo hidden para validar required */}
              <input type="hidden" value={profissional} required />
            </div>

            {/* Data */}
            <div className="grid gap-1.5">
              <Label htmlFor="data" className="text-sm text-gray-700">
                Data do agendamento
              </Label>
              <Input
                required
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Hora */}
            <div className="grid gap-1.5">
              <Label htmlFor="hora" className="text-sm text-gray-700">
                Horário
              </Label>
              <Input
                required
                id="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Botão */}
            <Button className="mt-4 w-full bg-[var(--color-azul-escuro)] hover:bg-[var(--color-azul-medio)] text-white font-medium rounded-lg">
              Agendar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

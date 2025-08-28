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
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <Card className="w-full max-w-lg border border-gray-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[var(--color-azul-escuro-secundario)]">
            Agendamento
          </CardTitle>
        </CardHeader>

        <CardContent className="text-black">
          <form className="flex flex-col gap-4">
            {/* Nome */}
            <div className="grid gap-1.5">
              <Label htmlFor="nome" className="text-sm text-gray-700">
                Informe seu nome
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-gray-300 focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]"
              />
            </div>

            {/* Profissional */}
            <div className="grid gap-1.5 ">
              <Label htmlFor="profissional" className="text-sm text-gray-700">
                Selecione um profissional
              </Label>
              <Select onValueChange={setProfissional}>
                <SelectTrigger className="border-gray-300 bg-white focus:border-[var(--color-azul-medio)] focus:ring-[var(--color-azul-medio)]">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300">
                  <SelectItem value="dr-joao">
                    Dr. João (Clínico Geral)
                  </SelectItem>
                  <SelectItem value="dra-maria">
                    Dra. Maria (Dermatologista)
                  </SelectItem>
                  <SelectItem value="dr-carlos">
                    Dr. Carlos (Cardiologista)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="grid gap-1.5">
              <Label htmlFor="data" className="text-sm text-gray-700">
                Data
              </Label>
              <Input
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

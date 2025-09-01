"use client";

import { Badge } from "@/components/ui/badge";

export type GenericStatus =
  | "ativo"
  | "inativo"
  | "alta"
  | "arquivado"
  | "em_andamento"
  | "confirmado"
  | "pendente"
  | "concluido"
  | "cancelado"
  | (string & {});

/**
 * StatusBadge
 * - Componente genérico para exibir um status com cores padronizadas
 * - Cobre statuses comuns usados em várias telas do app
 * - Para valores desconhecidos, aplica o variant secundário
 */
export function StatusBadge({ status, className }: { status: GenericStatus; className?: string }) {
  const normalized = String(status).toLowerCase();

  if (normalized === "ativo") {
    return <Badge className={merge("bg-green-100 text-green-800", className)}>Ativo</Badge>;
  }
  if (normalized === "inativo") {
    return <Badge className={merge("bg-gray-100 text-gray-800", className)}>Inativo</Badge>;
  }
  if (normalized === "alta") {
    return <Badge className={merge("bg-blue-100 text-blue-800", className)}>Alta</Badge>;
  }
  if (normalized === "arquivado") {
    return <Badge className={merge("bg-gray-100 text-gray-800", className)}>Arquivado</Badge>;
  }
  if (normalized === "em_andamento") {
    return <Badge className={merge("bg-blue-100 text-blue-800", className)}>Em Andamento</Badge>;
  }

  // Status de agendamento/consulta
  if (normalized === "confirmado") {
    return <Badge className={merge("bg-blue-100 text-blue-800", className)}>confirmado</Badge>;
  }
  if (normalized === "pendente") {
    return <Badge className={merge("bg-yellow-100 text-yellow-800", className)}>pendente</Badge>;
  }
  if (normalized === "concluido") {
    return <Badge className={merge("bg-green-100 text-green-800", className)}>concluido</Badge>;
  }
  if (normalized === "cancelado") {
    return <Badge className={merge("bg-red-100 text-red-800", className)}>cancelado</Badge>;
  }

  // fallback
  return <Badge variant="secondary" className={className}>{status}</Badge>;
}

// Pequeno util para juntar classes
function merge(a: string, b?: string) {
  return [a, b].filter(Boolean).join(" ");
}

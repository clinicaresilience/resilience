"use client"

import React from "react"
import { StatusAgendamento } from "@/types/agendamento"

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  const map: Record<
    StatusAgendamento,
    { text: string; classes: string }
  > = {
    confirmado: {
      text: "Confirmado",
      classes:
        "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-200",
    },
    pendente: {
      text: "Pendente",
      classes:
        "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200",
    },
    cancelado: {
      text: "Cancelado",
      classes:
        "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-200",
    },
    concluido: {
      text: "Concluído",
      classes:
        "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-200",
    },
  }

  const { text, classes } = map[status]
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${classes}`}>
      {text}
    </span>
  )
}

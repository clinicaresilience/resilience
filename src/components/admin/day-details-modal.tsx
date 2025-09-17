"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TimezoneUtils } from "@/utils/timezone"

import {
  Calendar,
  Clock,
  User,
  MapPin,
  Stethoscope,
  Phone,
  Mail,
  Eye
} from "lucide-react"

type Agendamento = {
  id: string
  usuarioId: string
  profissionalId: string
  profissionalNome: string
  especialidade?: string
  dataISO: string
  data_consulta: string
  local: string
  status: string
  notas?: string
  modalidade: string
  pacienteNome: string
  pacienteEmail?: string
  pacienteTelefone?: string
  paciente: {
    id: string
    nome: string
    email?: string
    telefone?: string
  }
  profissional: {
    nome: string
    especialidade?: string
  }
}

type DayDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  agendamentos: Agendamento[]
}

type PatientDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  agendamento: Agendamento | null
}

function PatientDetailsModal({ isOpen, onClose, agendamento }: PatientDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [justificativa, setJustificativa] = useState("")
  const [showCancelForm, setShowCancelForm] = useState(false)

  if (!agendamento) return null

  const utcDateTime = TimezoneUtils.dbTimestampToUTC(agendamento.dataISO)
  const date = TimezoneUtils.formatForDisplay(utcDateTime, undefined, 'date')
  const time = TimezoneUtils.formatForDisplay(utcDateTime, undefined, 'time')

  const getStatusColor = (status: string) => {
    const colors = {
      confirmado: "bg-green-100 text-green-800 border-green-200",
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
      concluido: "bg-blue-100 text-blue-800 border-blue-200",
      presencial: "bg-blue-100 text-blue-800 border-blue-200"
    }
    return colors[status as keyof typeof colors] || colors.confirmado
  }

  const handleCancelAgendamento = async () => {
    if (!justificativa.trim()) {
      alert('Por favor, informe uma justificativa para o cancelamento.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelado',
          justificativa: justificativa.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Agendamento cancelado com sucesso!')
        onClose()
        // Recarregar a página para atualizar a lista
        window.location.reload()
      } else {
        alert(result.error || 'Erro ao cancelar agendamento')
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      alert('Erro ao cancelar agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  const canCancel = agendamento.status === 'confirmado' || agendamento.status === 'pendente'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Detalhes do Paciente</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Paciente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg truncate">{agendamento.pacienteNome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agendamento.pacienteEmail && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{agendamento.pacienteEmail}</span>
                </div>
              )}
              {agendamento.pacienteTelefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{agendamento.pacienteTelefone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações da Consulta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Consulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{date} às {time}</span>
              </div>

              <div className="flex items-center gap-2 text-sm min-w-0">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">Dr. {agendamento.profissionalNome}</span>
              </div>

              <div className="flex items-center gap-2 text-sm min-w-0">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{agendamento.local}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={`${getStatusColor(agendamento.status)} text-xs`}>
                  {agendamento.status}
                </Badge>
              </div>

              {agendamento.notas && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium">Notas:</span>
                  <p className="text-sm text-gray-600 mt-1 break-words">{agendamento.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          {canCancel && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showCancelForm ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelForm(true)}
                    className="w-full"
                  >
                    Cancelar Agendamento
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Justificativa do cancelamento:
                      </label>
                      <textarea
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        placeholder="Informe o motivo do cancelamento..."
                        className="w-full p-2 border rounded-md text-sm resize-none h-20"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancelAgendamento}
                        disabled={isLoading || !justificativa.trim()}
                        className="flex-1"
                      >
                        {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCancelForm(false)
                          setJustificativa("")
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DayDetailsModal({ isOpen, onClose, selectedDate, agendamentos }: DayDetailsModalProps) {
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)

  // Filtrar agendamentos para a data selecionada usando TimezoneUtils
  const dayAgendamentos = selectedDate ? agendamentos.filter(ag => {
    const agDate = TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(ag.dataISO))
    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    return agDate === selectedDateStr
  }).sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime()) : []

  // Obter lista única de profissionais trabalhando no dia
  const profissionaisNoDia = Array.from(new Set(dayAgendamentos.map(ag => ag.profissionalNome)))

  // Usar formatTime do utilitário universal

  const getStatusColor = (status: string) => {
    const colors = {
      confirmado: "bg-green-100 text-green-800 border-green-200",
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelado: "bg-red-100 text-red-800 border-red-200",
      concluido: "bg-blue-100 text-blue-800 border-blue-200"
    }
    return colors[status as keyof typeof colors] || colors.confirmado
  }

  const handlePatientClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento)
    setShowPatientModal(true)
  }

  if (!selectedDate) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden px-1">
            {profissionaisNoDia.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum profissional trabalhando neste dia</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profissionaisNoDia.map(profissionalNome => {
                  const consultasProfissional = dayAgendamentos.filter(ag => ag.profissionalNome === profissionalNome)

                  return (
                    <Card key={profissionalNome} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          <span className="truncate">Dr. {profissionalNome}</span>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {consultasProfissional.length} consulta{consultasProfissional.length !== 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {consultasProfissional.length === 0 ? (
                          <p className="text-gray-500 text-sm">Nenhuma consulta agendada</p>
                        ) : (
                          <div className="space-y-3">
                            {consultasProfissional.map(agendamento => (
                              <div
                                key={agendamento.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer gap-2 sm:gap-3"
                                onClick={() => handlePatientClick(agendamento)}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="font-medium text-sm">
                                      {TimezoneUtils.formatForDisplay(TimezoneUtils.dbTimestampToUTC(agendamento.dataISO), undefined, 'time')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">
                                      {agendamento.pacienteNome}
                                    </span>
                                  </div>
                                  <Badge className={`text-xs ${getStatusColor(agendamento.status)} flex-shrink-0`}>
                                    {agendamento.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-600 truncate">
                                    {agendamento.local}
                                  </span>
                                  <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PatientDetailsModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        agendamento={selectedAgendamento}
      />
    </>
  )
}

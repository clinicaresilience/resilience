"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PendingAppointment = {
  profissional_id: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  profissional_nome?: string;
};

const LS_KEY = "resilience_pending_appointment";

export default function PendingAppointmentResumer() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PendingAppointment;
      if (parsed && parsed.profissional_id && parsed.data && parsed.hora) {
        setPending(parsed);
        setOpen(true);
      } else {
        // invalid payload, clear
        window.localStorage.removeItem(LS_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const descricao = useMemo(() => {
    if (!pending) return "";
    // Format date to pt-BR
    const d = (() => {
      try {
        const [y, m, day] = pending.data.split("-").map((x) => parseInt(x, 10));
        return new Date(y, (m ?? 1) - 1, day ?? 1);
      } catch {
        return null;
      }
    })();
    const dataFmt = d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : pending.data;
    const hora = pending.hora;
    const prof = pending.profissional_nome ? ` com o(a) profissional ${pending.profissional_nome}` : "";
    return `Deseja continuar com o agendamento do dia ${dataFmt} às ${hora}${prof}?`;
  }, [pending]);

  const clearPending = () => {
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {}
    setPending(null);
    setOpen(false);
    setError(null);
  };

  const onConfirm = async () => {
    if (!pending) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: pending.profissional_id,
          data_consulta: `${pending.data}T${pending.hora}:00.000Z`,
          codigo_empresa: "RESILIENCE", // Código padrão para agendamentos pendentes - usuário já validou antes
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha ao criar agendamento.");
      }
      clearPending();
      // Ir para meus agendamentos
      window.location.href = "/tela-usuario/agendamentos";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao criar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  if (!pending) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearPending(); }}>
      <DialogContent className="w-[90vw] sm:max-w-lg max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-azul-escuro">
            Continuar agendamento?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-gray-700">
          <p>{descricao}</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={clearPending}
            disabled={loading}
          >
            Não, obrigado
          </Button>
          <Button
            type="button"
            className="bg-azul-escuro text-white hover:bg-azul-medio"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Agendando..." : "Sim, confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

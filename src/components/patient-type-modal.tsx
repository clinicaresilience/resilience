'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';

export type TipoPaciente = 'fisica' | 'juridica';

interface PatientTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tipo: TipoPaciente) => void;
}

export function PatientTypeModal({ open, onClose, onSelect }: PatientTypeModalProps) {
  const [selectedType, setSelectedType] = useState<TipoPaciente | null>(null);

  const handleSelect = (tipo: TipoPaciente) => {
    setSelectedType(tipo);
    onSelect(tipo);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl">
            Como você deseja agendar?
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Selecione o tipo de agendamento que se aplica a você
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-4 sm:py-6">
          <Button
            variant={selectedType === 'juridica' ? 'default' : 'outline'}
            className="h-auto flex-col gap-2 sm:gap-3 py-4 sm:py-6"
            onClick={() => handleSelect('juridica')}
          >
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
            <div className="text-center">
              <div className="font-semibold text-base sm:text-lg">Empresa Conveniada</div>
              <div className="text-xs sm:text-sm font-normal text-muted-foreground mt-1">
                Tenho um código de empresa
              </div>
            </div>
          </Button>

          <Button
            variant={selectedType === 'fisica' ? 'default' : 'outline'}
            className="h-auto flex-col gap-2 sm:gap-3 py-4 sm:py-6"
            onClick={() => handleSelect('fisica')}
          >
            <User className="h-6 w-6 sm:h-8 sm:w-8" />
            <div className="text-center">
              <div className="font-semibold text-base sm:text-lg">Particular</div>
              <div className="text-xs sm:text-sm font-normal text-muted-foreground mt-1">
                Vou pagar pelas sessões
              </div>
            </div>
          </Button>
        </div>

        <div className="text-[10px] sm:text-xs text-center text-muted-foreground">
          Esta escolha determinará o fluxo de agendamento
        </div>
      </DialogContent>
    </Dialog>
  );
}

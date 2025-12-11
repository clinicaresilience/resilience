export interface CompanySector {
  id: string;
  empresa_id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanySectorDto {
  nome: string;
  ativo?: boolean;
}

export interface UpdateCompanySectorDto {
  nome?: string;
  ativo?: boolean;
}

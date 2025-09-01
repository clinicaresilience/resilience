export type Company = {
  id: string;
  name: string;
  code: string; // unique company code required for scheduling
  active: boolean;
};

function uid(prefix = "comp"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export const DEFAULT_COMPANIES: Company[] = [
  { id: "comp_acme", name: "ACME Saúde", code: "ACME123", active: true },
  { id: "comp_globex", name: "Globex Corp", code: "GLOBEX456", active: true },
];

// Client-only store (admin can manage extra companies via localStorage)
const LS_KEY = "mock_companies";

export function getCompaniesClient(): Company[] {
  if (typeof window === "undefined") return DEFAULT_COMPANIES;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_COMPANIES;
    const extras = JSON.parse(raw) as Company[];
    if (!Array.isArray(extras)) return DEFAULT_COMPANIES;
    // merge by code (extras override defaults)
    const byCode = new Map<string, Company>();
    for (const c of DEFAULT_COMPANIES) byCode.set(c.code, c);
    for (const c of extras) byCode.set(c.code, c);
    return Array.from(byCode.values());
  } catch {
    return DEFAULT_COMPANIES;
  }
}

export function saveCompaniesClient(list: Company[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {}
}

export function addCompanyClient(input: { name: string; code: string; active?: boolean }) {
  if (typeof window === "undefined") return;
  const current = getCompaniesClient().filter((c) => !DEFAULT_COMPANIES.some((d) => d.code === c.code));
  if (current.some((c) => c.code.toUpperCase() === input.code.toUpperCase())) {
    throw new Error("Código de empresa já existente");
  }
  current.push({
    id: uid(),
    name: input.name,
    code: input.code.toUpperCase().trim(),
    active: input.active ?? true,
  });
  saveCompaniesClient(current);
}

export function updateCompanyClient(code: string, patch: Partial<Company>) {
  if (typeof window === "undefined") return;
  const current = getCompaniesClient().filter((c) => !DEFAULT_COMPANIES.some((d) => d.code === c.code));
  const idx = current.findIndex((c) => c.code === code);
  if (idx === -1) throw new Error("Empresa não encontrada (custom)");
  current[idx] = { ...current[idx], ...patch };
  saveCompaniesClient(current);
}

export function isValidCompanyCodeClient(code?: string): boolean {
  if (!code) return false;
  return getCompaniesClient().some((c) => c.active && c.code.toUpperCase() === code.toUpperCase());
}

// Server-safe validation only against defaults (admin-managed clients are client-side only for mock)
export function isValidCompanyCodeServer(code?: string): boolean {
  if (!code) return false;
  return DEFAULT_COMPANIES.some((c) => c.active && c.code.toUpperCase() === code.toUpperCase());
}

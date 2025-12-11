-- Inserir empresa padrão para o sistema
INSERT INTO public.empresas (id, nome, codigo, ativa)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Resilience', 'RESILIENCE', true)
ON CONFLICT (id) DO NOTHING;

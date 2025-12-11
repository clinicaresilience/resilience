-- Migration: Sistema de Pacotes para Pessoa Física
-- Data: 2025-10-03
-- Descrição: Adiciona suporte a agendamentos para pessoa física com pacotes e pagamento via Mercado Pago

-- ================================================
-- 1. Tabela de Pacotes de Sessões
-- ================================================
CREATE TABLE IF NOT EXISTS pacotes_sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantidade_sessoes INTEGER NOT NULL CHECK (quantidade_sessoes > 0),
  preco_total DECIMAL(10,2) NOT NULL CHECK (preco_total > 0),
  preco_por_sessao DECIMAL(10,2) NOT NULL CHECK (preco_por_sessao > 0),
  desconto_percentual INTEGER DEFAULT 0 CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pacotes_ativo ON pacotes_sessoes(ativo);
CREATE INDEX idx_pacotes_quantidade ON pacotes_sessoes(quantidade_sessoes);

-- ================================================
-- 2. Tabela de Compras de Pacotes
-- ================================================
CREATE TABLE IF NOT EXISTS compras_pacotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pacote_id UUID NOT NULL REFERENCES pacotes_sessoes(id) ON DELETE RESTRICT,
  sessoes_total INTEGER NOT NULL CHECK (sessoes_total > 0),
  sessoes_utilizadas INTEGER DEFAULT 0 CHECK (sessoes_utilizadas >= 0),
  sessoes_restantes INTEGER GENERATED ALWAYS AS (sessoes_total - sessoes_utilizadas) STORED,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'cancelado', 'expirado')),
  pagamento_mp_id VARCHAR(255),
  valor_pago DECIMAL(10,2) CHECK (valor_pago >= 0),
  data_compra TIMESTAMPTZ DEFAULT NOW(),
  data_validade TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_compras_paciente ON compras_pacotes(paciente_id);
CREATE INDEX idx_compras_profissional ON compras_pacotes(profissional_id);
CREATE INDEX idx_compras_status ON compras_pacotes(status);
CREATE INDEX idx_compras_pagamento_mp ON compras_pacotes(pagamento_mp_id);

-- ================================================
-- 3. Tabela de Pagamentos Mercado Pago
-- ================================================
CREATE TABLE IF NOT EXISTS pagamentos_mercadopago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_pacote_id UUID NOT NULL REFERENCES compras_pacotes(id) ON DELETE CASCADE,
  preference_id VARCHAR(255),
  payment_id VARCHAR(255),
  status VARCHAR(50),
  status_detail VARCHAR(255),
  valor DECIMAL(10,2),
  payment_type VARCHAR(50),
  payment_method VARCHAR(50),
  webhook_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pagamentos_compra ON pagamentos_mercadopago(compra_pacote_id);
CREATE INDEX idx_pagamentos_preference ON pagamentos_mercadopago(preference_id);
CREATE INDEX idx_pagamentos_payment_id ON pagamentos_mercadopago(payment_id);
CREATE INDEX idx_pagamentos_status ON pagamentos_mercadopago(status);

-- ================================================
-- 4. Modificar Tabela Agendamentos
-- ================================================
-- Adicionar colunas para tipo de paciente e vinculação com pacote
DO $$
BEGIN
    -- Adicionar tipo_paciente se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agendamentos' AND column_name = 'tipo_paciente'
    ) THEN
        ALTER TABLE agendamentos
        ADD COLUMN tipo_paciente VARCHAR(20) DEFAULT 'juridica' CHECK (tipo_paciente IN ('fisica', 'juridica'));
    END IF;

    -- Adicionar compra_pacote_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agendamentos' AND column_name = 'compra_pacote_id'
    ) THEN
        ALTER TABLE agendamentos
        ADD COLUMN compra_pacote_id UUID REFERENCES compras_pacotes(id) ON DELETE SET NULL;
    END IF;

    -- Remover NOT NULL de codigo_empresa (agora é condicional)
    ALTER TABLE agendamentos
    ALTER COLUMN codigo_empresa DROP NOT NULL;
END$$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_tipo_paciente ON agendamentos(tipo_paciente);
CREATE INDEX IF NOT EXISTS idx_agendamentos_compra_pacote ON agendamentos(compra_pacote_id);

-- ================================================
-- 5. Inserir Pacotes Padrão
-- ================================================
-- Baseado na imagem fornecida pelo usuário
INSERT INTO pacotes_sessoes (quantidade_sessoes, preco_total, preco_por_sessao, desconto_percentual, ativo) VALUES
(1, 100.00, 100.00, 0, true),      -- 1 sessão - R$ 100,00
(4, 360.00, 90.00, 10, true),      -- 4 sessões - R$ 360,00 (R$ 90,00/sessão - 10% desconto = R$ 40,00 desconto)
(8, 640.00, 80.00, 20, true),      -- 8 sessões - R$ 640,00 (R$ 80,00/sessão - 20% desconto = R$ 160,00 desconto)
(12, 840.00, 70.00, 30, true),     -- 12 sessões - R$ 840,00 (R$ 70,00/sessão - 30% desconto = R$ 360,00 desconto)
(16, 960.00, 60.00, 40, true)      -- 16 sessões - R$ 960,00 (R$ 60,00/sessão - 40% desconto = R$ 640,00 desconto)
ON CONFLICT DO NOTHING;

-- ================================================
-- 6. Triggers para atualização automática
-- ================================================

-- Trigger para atualizar updated_at em pacotes_sessoes
CREATE OR REPLACE FUNCTION update_pacotes_sessoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pacotes_sessoes_updated_at
    BEFORE UPDATE ON pacotes_sessoes
    FOR EACH ROW
    EXECUTE FUNCTION update_pacotes_sessoes_updated_at();

-- Trigger para atualizar updated_at em compras_pacotes
CREATE OR REPLACE FUNCTION update_compras_pacotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_compras_pacotes_updated_at
    BEFORE UPDATE ON compras_pacotes
    FOR EACH ROW
    EXECUTE FUNCTION update_compras_pacotes_updated_at();

-- Trigger para atualizar updated_at em pagamentos_mercadopago
CREATE OR REPLACE FUNCTION update_pagamentos_mercadopago_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pagamentos_mercadopago_updated_at
    BEFORE UPDATE ON pagamentos_mercadopago
    FOR EACH ROW
    EXECUTE FUNCTION update_pagamentos_mercadopago_updated_at();

-- ================================================
-- 7. Políticas de Segurança RLS (Row Level Security)
-- ================================================

-- Habilitar RLS nas tabelas
ALTER TABLE pacotes_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras_pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_mercadopago ENABLE ROW LEVEL SECURITY;

-- Políticas para pacotes_sessoes (todos podem ler pacotes ativos)
CREATE POLICY "Pacotes ativos são visíveis para todos" ON pacotes_sessoes
    FOR SELECT
    USING (ativo = true);

CREATE POLICY "Apenas admins podem gerenciar pacotes" ON pacotes_sessoes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND tipo_usuario = 'administrador'
        )
    );

-- Políticas para compras_pacotes
CREATE POLICY "Pacientes podem ver suas próprias compras" ON compras_pacotes
    FOR SELECT
    USING (
        paciente_id = auth.uid()
        OR profissional_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND tipo_usuario = 'administrador'
        )
    );

CREATE POLICY "Pacientes podem criar compras" ON compras_pacotes
    FOR INSERT
    WITH CHECK (paciente_id = auth.uid());

CREATE POLICY "Apenas admins podem atualizar compras" ON compras_pacotes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND tipo_usuario = 'administrador'
        )
    );

-- Políticas para pagamentos_mercadopago
CREATE POLICY "Usuários podem ver pagamentos de suas compras" ON pagamentos_mercadopago
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM compras_pacotes cp
            WHERE cp.id = compra_pacote_id
            AND (cp.paciente_id = auth.uid() OR cp.profissional_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND tipo_usuario = 'administrador'
        )
    );

CREATE POLICY "Sistema pode criar pagamentos" ON pagamentos_mercadopago
    FOR INSERT
    WITH CHECK (true); -- Será criado via service role

CREATE POLICY "Sistema pode atualizar pagamentos" ON pagamentos_mercadopago
    FOR UPDATE
    USING (true); -- Será atualizado via webhooks com service role

-- ================================================
-- 8. Comentários nas tabelas
-- ================================================
COMMENT ON TABLE pacotes_sessoes IS 'Pacotes de sessões disponíveis para compra por pessoa física';
COMMENT ON TABLE compras_pacotes IS 'Registro de compras de pacotes realizadas por pacientes';
COMMENT ON TABLE pagamentos_mercadopago IS 'Registro de transações do Mercado Pago';

COMMENT ON COLUMN agendamentos.tipo_paciente IS 'Tipo de paciente: fisica (paga via MP) ou juridica (empresa)';
COMMENT ON COLUMN agendamentos.compra_pacote_id IS 'Vinculação com pacote comprado (apenas para tipo fisica)';

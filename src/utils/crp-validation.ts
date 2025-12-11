/**
 * Utilitário para validação e normalização de CRP (Conselho Regional de Psicologia)
 * Padrão oficial brasileiro: UF seguido de 4-6 dígitos (ex: SP06123, RJ12345)
 */

// Estados brasileiros válidos
const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Remove caracteres especiais do CRP (pontos, barras, espaços)
 */
export function normalizarCRP(crp: string): string {
  if (!crp) return '';
  
  // Remove todos os caracteres que não são letras ou números
  const limpo = crp.replace(/[^A-Za-z0-9]/g, '');
  
  // Converte para maiúsculas
  return limpo.toUpperCase();
}

/**
 * Valida se o CRP está no formato correto
 */
export function validarCRP(crp: string): { valido: boolean; erro?: string } {
  if (!crp || crp.trim() === '') {
    return { valido: false, erro: 'CRP é obrigatório' };
  }

  const crpNormalizado = normalizarCRP(crp);
  
  // Verificar formato básico: 2 letras + 4-6 números
  const regex = /^[A-Z]{2}[0-9]{4,6}$/;
  
  if (!regex.test(crpNormalizado)) {
    return { 
      valido: false, 
      erro: 'CRP deve ter 2 letras (estado) seguidas de 4-6 números. Ex: SP06123' 
    };
  }

  // Extrair estado (primeiras 2 letras)
  const estado = crpNormalizado.substring(0, 2);
  
  // Verificar se é um estado brasileiro válido
  if (!ESTADOS_BRASILEIROS.includes(estado)) {
    return { 
      valido: false, 
      erro: `Estado "${estado}" não é válido. Use siglas de estados brasileiros (SP, RJ, MG, etc.)` 
    };
  }

  // Extrair número (resto da string)
  const numero = crpNormalizado.substring(2);
  
  // Verificar se o número não é só zeros
  if (numero === '0000' || numero === '00000' || numero === '000000') {
    return { 
      valido: false, 
      erro: 'Número do CRP não pode ser apenas zeros' 
    };
  }

  return { valido: true };
}

/**
 * Formata o CRP para exibição (adiciona barra)
 */
export function formatarCRPParaExibicao(crp: string): string {
  const crpNormalizado = normalizarCRP(crp);
  
  if (crpNormalizado.length < 6) return crp;
  
  const estado = crpNormalizado.substring(0, 2);
  const numero = crpNormalizado.substring(2);
  
  return `${estado}/${numero}`;
}

/**
 * Aplica máscara durante a digitação permitindo formatos flexíveis
 */
export function aplicarMascaraCRP(valor: string): string {
  if (!valor) return '';
  
  // Remove caracteres especiais primeiro
  let limpo = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Limita a 8 caracteres (2 letras + 6 números máximo)
  if (limpo.length > 8) {
    limpo = limpo.substring(0, 8);
  }
  
  // Se tem pelo menos 2 caracteres, assume que são letras do estado
  if (limpo.length >= 2) {
    const estado = limpo.substring(0, 2);
    const numero = limpo.substring(2);
    
    // Se tem números após as letras, adiciona a barra
    if (numero.length > 0) {
      return `${estado}/${numero}`;
    }
    
    return estado;
  }
  
  return limpo;
}

/**
 * Validação em tempo real durante digitação
 */
export function validarCRPEmTempoReal(crp: string): { valido: boolean; mensagem?: string; aviso?: string } {
  if (!crp || crp.trim() === '') {
    return { valido: false };
  }

  const crpNormalizado = normalizarCRP(crp);
  
  // Se tem menos de 6 caracteres, ainda está digitando
  if (crpNormalizado.length < 6) {
    if (crpNormalizado.length >= 2) {
      const estado = crpNormalizado.substring(0, 2);
      if (!ESTADOS_BRASILEIROS.includes(estado)) {
        return { 
          valido: false, 
          mensagem: `Estado "${estado}" não é válido` 
        };
      }
      return { 
        valido: false, 
        aviso: `Continue digitando... (${crpNormalizado.length}/6-8 caracteres)` 
      };
    }
    return { 
      valido: false, 
      aviso: 'Digite a sigla do estado (ex: SP, RJ, MG...)' 
    };
  }

  // Validação completa
  return validarCRP(crp);
}

// Tipos para o Formulário DRPS - Diagnóstico de Riscos Psicossociais

export type DrpsScore = 0 | 1 | 2 | 3 | 4;

export interface DrpsQuestion {
  id: string;
  text: string;
  required: boolean;
}

export interface DrpsTopic {
  id: string;
  title: string;
  description: string;
  questions: DrpsQuestion[];
}

export interface DrpsFormData {
  // Identificação (campos obrigatórios)
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  setor: string;
  
  // Respostas por tópico
  respostas: Record<string, DrpsScore>; // questionId -> score
}

export interface DrpsSubmission {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  setor: string;
  respostas: Record<string, DrpsScore>;
  created_at: string;
}

// Configuração dos tópicos e perguntas do DRPS
export const DRPS_TOPICS: DrpsTopic[] = [
  {
    id: 'assedio',
    title: 'TÓPICO 01 - Assédio',
    description: 'O Objetivo dessa seção é avaliar a severidade/Gravidade e probabilidade de ocorrência do Risco de Assédio.',
    questions: [
      {
        id: 'assedio_1',
        text: '1. Você já presenciou ou sofreu comentários ofensivos, piadas ou insinuações inadequadas no ambiente de trabalho?',
        required: true
      },
      {
        id: 'assedio_2',
        text: '2. Você se sente à vontade para relatar situações de assédio moral ou sexual na empresa sem medo de represálias?',
        required: true
      },
      {
        id: 'assedio_3',
        text: '3. Existe um canal seguro e sigiloso para denunciar assédio na empresa?',
        required: true
      },
      {
        id: 'assedio_4',
        text: '4. Você já recebeu tratamento desrespeitoso ou humilhante de colegas ou superiores?',
        required: true
      },
      {
        id: 'assedio_5',
        text: '5. Você sente que há favoritismo ou perseguição por parte da liderança?',
        required: true
      },
      {
        id: 'assedio_6',
        text: '6. Há casos conhecidos de assédio moral ou sexual que não foram devidamente investigados ou punidos?',
        required: true
      },
      {
        id: 'assedio_7',
        text: '7. A empresa realiza treinamentos ou campanhas de conscientização sobre assédio?',
        required: true
      },
      {
        id: 'assedio_8',
        text: '8. O RH e os gestores demonstram comprometimento real com a prevenção do assédio?',
        required: true
      },
      {
        id: 'assedio_9',
        text: '9. Você já foi forçado(a) a realizar tarefas humilhantes ou degradantes?',
        required: true
      },
      {
        id: 'assedio_10',
        text: '10. Existe uma cultura de "brincadeiras" que desrespeitam funcionários? Já foi vítima de alguma delas?',
        required: true
      }
    ]
  },
  {
    id: 'carga_trabalho',
    title: 'TÓPICO 02 - Carga Excessiva de Trabalho',
    description: 'O Objetivo dessa seção é avaliar a severidade/Gravidade e probabilidade de ocorrência do Risco de Exaustão Por Carga Excessiva de Trabalho.',
    questions: [
      {
        id: 'carga_1',
        text: '1. Você sente que sua carga de trabalho diária é superior à sua capacidade de execução dentro do horário normal?',
        required: true
      },
      {
        id: 'carga_2',
        text: '2. Você frequentemente precisa fazer horas extras ou levar trabalho para casa?',
        required: true
      },
      {
        id: 'carga_3',
        text: '3. As demandas e prazos estabelecidos são realistas e atingíveis?',
        required: true
      },
      {
        id: 'carga_4',
        text: '4. Você sente que a empresa respeita seus limites físicos e mentais?',
        required: true
      },
      {
        id: 'carga_5',
        text: '5. Você recebe pausas adequadas ao longo do dia?',
        required: true
      },
      {
        id: 'carga_6',
        text: '6. Existe um equilíbrio entre tarefas administrativas e operacionais?',
        required: true
      },
      {
        id: 'carga_7',
        text: '7. Há redistribuição de tarefas quando há sobrecarga em algum setor ou equipe?',
        required: true
      },
      {
        id: 'carga_8',
        text: '8. Você já teve sintomas físicos ou emocionais (como ansiedade, exaustão, insônia) devido ao excesso de trabalho?',
        required: true
      },
      {
        id: 'carga_9',
        text: '9. Existe flexibilidade para gerenciar sua própria carga de trabalho?',
        required: true
      },
      {
        id: 'carga_10',
        text: '10. A equipe é dimensionada (Quantidade necessária de funcionários por função) corretamente para a demanda da empresa?',
        required: true
      }
    ]
  },
  {
    id: 'reconhecimento',
    title: 'Tópico 03 - Reconhecimento e Recompensas',
    description: 'O Objetivo dessa sessão é avaliar a severidade/Gravidade e probabilidade de ocorrência do risco de desmotivação e tristeza pela falta de reconhecimento e recompensas.',
    questions: [
      {
        id: 'reconhecimento_1',
        text: '1. Você sente que seu esforço e desempenho são reconhecidos pela liderança?',
        required: true
      },
      {
        id: 'reconhecimento_2',
        text: '2. A empresa possui políticas claras de promoção e progressão de carreira?',
        required: true
      },
      {
        id: 'reconhecimento_3',
        text: '3. As avaliações de desempenho são justas e transparentes?',
        required: true
      },
      {
        id: 'reconhecimento_4',
        text: '4. Você sente que há igualdade no reconhecimento entre diferentes áreas ou equipes?',
        required: true
      },
      {
        id: 'reconhecimento_5',
        text: '5. A empresa oferece incentivos financeiros ou não financeiros pelo bom desempenho?',
        required: true
      },
      {
        id: 'reconhecimento_6',
        text: '6. Você recebe feedback construtivo regularmente?',
        required: true
      },
      {
        id: 'reconhecimento_7',
        text: '7. Existe uma cultura de valorização dos funcionários?',
        required: true
      },
      {
        id: 'reconhecimento_8',
        text: '8. Você já se sentiu desmotivado(a) por falta de reconhecimento?',
        required: true
      },
      {
        id: 'reconhecimento_9',
        text: '9. A empresa celebra conquistas individuais e coletivas?',
        required: true
      },
      {
        id: 'reconhecimento_10',
        text: '10. O plano de benefícios da empresa é condizente com suas necessidades e expectativas?',
        required: true
      }
    ]
  },
  {
    id: 'clima_organizacional',
    title: 'Tópico 4 - Clima Organizacional',
    description: 'O Objetivo dessa seção é avaliar as características do clima organizacional que contribuem para o bem estar emocional dos colaboradores.',
    questions: [
      {
        id: 'clima_1',
        text: '1. O ambiente de trabalho é amigável e colaborativo?',
        required: true
      },
      {
        id: 'clima_2',
        text: '2. Existe um sentimento de confiança entre os colegas de trabalho?',
        required: true
      },
      {
        id: 'clima_3',
        text: '3. Você se sente confortável para expressar suas opiniões na equipe?',
        required: true
      },
      {
        id: 'clima_4',
        text: '4. Os gestores promovem um ambiente saudável e respeitoso?',
        required: true
      },
      {
        id: 'clima_5',
        text: '5. Existe transparência na comunicação da empresa?',
        required: true
      },
      {
        id: 'clima_6',
        text: '6. Você sente que pode contar com seus colegas em momentos de dificuldade?',
        required: true
      },
      {
        id: 'clima_7',
        text: '7. Há um senso de propósito e pertencimento entre os funcionários?',
        required: true
      },
      {
        id: 'clima_8',
        text: '8. Conflitos são resolvidos de forma justa e eficiente?',
        required: true
      },
      {
        id: 'clima_9',
        text: '9. O ambiente físico do local de trabalho é confortável e seguro?',
        required: true
      },
      {
        id: 'clima_10',
        text: '10. A cultura organizacional da empresa está alinhada com seus valores pessoais?',
        required: true
      }
    ]
  },
  {
    id: 'autonomia',
    title: 'Tópico 05 - Autonomia e Controle sobre o Trabalho',
    description: 'O Objetivo dessa seção é avaliar as características dos processos de trabalho, afim de averiguar o nível de conforto e liberdade dos colaboradores ao desempenhar as suas atividades.',
    questions: [
      {
        id: 'autonomia_1',
        text: '1. Você tem liberdade para tomar decisões sobre suas tarefas diárias?',
        required: true
      },
      {
        id: 'autonomia_2',
        text: '2. Seu trabalho permite flexibilidade para adaptar sua rotina conforme necessário?',
        required: true
      },
      {
        id: 'autonomia_3',
        text: '3. Você sente que tem voz ativa na empresa?',
        required: true
      },
      {
        id: 'autonomia_4',
        text: '4. A empresa confia em sua capacidade de autogestão?',
        required: true
      },
      {
        id: 'autonomia_5',
        text: '5. Você recebe instruções claras sobre suas responsabilidades?',
        required: true
      },
      {
        id: 'autonomia_6',
        text: '6. O excesso de controle ou burocracia interfere no seu desempenho?',
        required: true
      },
      {
        id: 'autonomia_7',
        text: '7. Suas sugestões são ouvidas e consideradas pela liderança?',
        required: true
      },
      {
        id: 'autonomia_8',
        text: '8. Você tem acesso às ferramentas e recursos necessários para desempenhar bem seu trabalho?',
        required: true
      },
      {
        id: 'autonomia_9',
        text: '9. Você sente que pode propor melhorias sem medo de represálias?',
        required: true
      },
      {
        id: 'autonomia_10',
        text: '10. O excesso de supervisão impacta sua produtividade ou bem-estar?',
        required: true
      }
    ]
  },
  {
    id: 'pressao_metas',
    title: 'Tópico 06 - Pressão e Metas',
    description: 'O Objetivo dessa seção é avaliar como as metas de trabalho afetam a saúde mental dos colaboradores.',
    questions: [
      {
        id: 'pressao_1',
        text: '1. As metas da empresa são realistas e atingíveis?',
        required: true
      },
      {
        id: 'pressao_2',
        text: '2. Você sente que há pressão excessiva para alcançar resultados?',
        required: true
      },
      {
        id: 'pressao_3',
        text: '3. A cobrança por metas impacta sua saúde mental ou emocional?',
        required: true
      },
      {
        id: 'pressao_4',
        text: '4. Existe apoio da liderança para lidar com desafios relacionados às metas?',
        required: true
      },
      {
        id: 'pressao_5',
        text: '5. Você sente que pode negociar prazos ou objetivos quando necessário?',
        required: true
      },
      {
        id: 'pressao_6',
        text: '6. A competitividade entre os funcionários é estimulada de maneira saudável?',
        required: true
      },
      {
        id: 'pressao_7',
        text: '7. Você já sentiu medo de punição por não atingir metas?',
        required: true
      },
      {
        id: 'pressao_8',
        text: '8. O sistema de avaliação de metas é transparente?',
        required: true
      },
      {
        id: 'pressao_9',
        text: '9. Você tem tempo suficiente para cumprir suas demandas com qualidade?',
        required: true
      },
      {
        id: 'pressao_10',
        text: '10. A pressão por resultados impacta negativamente o ambiente de trabalho?',
        required: true
      }
    ]
  },
  {
    id: 'inseguranca',
    title: 'Tópico 07 - Insegurança e Ameaças',
    description: 'O objetivo dessa seção é avaliar o nível de sentimento de insegurança e a presença de fatores ameaçadores à estabilidade emocional dos colaboradores.',
    questions: [
      {
        id: 'inseguranca_1',
        text: '1. Você já sentiu que seu emprego está ameaçado sem justificativa clara?',
        required: true
      },
      {
        id: 'inseguranca_2',
        text: '2. A empresa faz cortes ou demissões repentinas sem aviso prévio?',
        required: true
      },
      {
        id: 'inseguranca_3',
        text: '3. Há comunicação clara sobre a estabilidade da empresa e dos empregos?',
        required: true
      },
      {
        id: 'inseguranca_4',
        text: '4. Você já sofreu ameaças veladas ou diretas no ambiente de trabalho?',
        required: true
      },
      {
        id: 'inseguranca_5',
        text: '5. Você sente que há transparência nas políticas de desligamento?',
        required: true
      },
      {
        id: 'inseguranca_6',
        text: '6. Mudanças organizacionais impactaram seu sentimento de segurança no trabalho?',
        required: true
      },
      {
        id: 'inseguranca_7',
        text: '7. Você já presenciou casos de demissões injustas?',
        required: true
      },
      {
        id: 'inseguranca_8',
        text: '8. O medo da demissão afeta seu desempenho?',
        required: true
      },
      {
        id: 'inseguranca_9',
        text: '9. A empresa oferece suporte psicológico para funcionários inseguros?',
        required: true
      },
      {
        id: 'inseguranca_10',
        text: '10. Você já evitou expressar sua opinião por medo de represálias?',
        required: true
      }
    ]
  },
  {
    id: 'conflitos',
    title: 'Tópico 08 - Conflitos Interpessoais e Falta de Comunicação',
    description: 'O objetivo dessa seção é identificar a presença e severidade de possíveis conflitos no ambiente de trabalho e bem como prejuízos devido à falta de comunicação.',
    questions: [
      {
        id: 'conflitos_1',
        text: '1. Conflitos internos são resolvidos de maneira justa?',
        required: true
      },
      {
        id: 'conflitos_2',
        text: '2. A comunicação entre equipes e departamentos é eficiente?',
        required: true
      },
      {
        id: 'conflitos_3',
        text: '3. Você já evitou colegas ou superiores devido a desentendimentos?',
        required: true
      },
      {
        id: 'conflitos_4',
        text: '4. Existe um canal aberto para feedback entre colaboradores e liderança?',
        required: true
      },
      {
        id: 'conflitos_5',
        text: '5. A falta de comunicação já comprometeu seu trabalho?',
        required: true
      },
      {
        id: 'conflitos_6',
        text: '6. Você sente que há rivalidade desnecessária entre setores?',
        required: true
      },
      {
        id: 'conflitos_7',
        text: '7. Há treinamentos sobre comunicação assertiva e gestão de conflitos?',
        required: true
      },
      {
        id: 'conflitos_8',
        text: '8. Você sente que pode expressar suas dificuldades sem ser julgado?',
        required: true
      },
      {
        id: 'conflitos_9',
        text: '9. A empresa promove um ambiente de diálogo aberto?',
        required: true
      },
      {
        id: 'conflitos_10',
        text: '10. O RH está presente e atuante na mediação de conflitos?',
        required: true
      }
    ]
  },
  {
    id: 'vida_pessoal',
    title: 'Tópico 09 - Alinhamento entre Vida Pessoal e Profissional',
    description: 'O objetivo dessa seção é avaliar o nível de atendimento da conciliação entre vida pessoal e profissional dos trabalhadores, mediante as condições de trabalho impostas.',
    questions: [
      {
        id: 'vida_1',
        text: '1. Você sente que a sua jornada de trabalho permite equilíbrio com sua vida pessoal?',
        required: true
      },
      {
        id: 'vida_2',
        text: '2. Você sente que tem tempo para sua família e lazer?',
        required: true
      },
      {
        id: 'vida_3',
        text: '3. O trabalho impacta negativamente sua saúde mental?',
        required: true
      },
      {
        id: 'vida_4',
        text: '4. Você tem flexibilidade para lidar com questões pessoais urgentes?',
        required: true
      },
      {
        id: 'vida_5',
        text: '5. A empresa oferece suporte para equilíbrio entre trabalho e vida pessoal?',
        required: true
      },
      {
        id: 'vida_6',
        text: '6. Você consegue se desconectar do trabalho fora do expediente?',
        required: true
      },
      {
        id: 'vida_7',
        text: '7. Você sente que sua vida pessoal é respeitada pela empresa?',
        required: true
      },
      {
        id: 'vida_8',
        text: '8. Há incentivo ao bem-estar e qualidade de vida no trabalho?',
        required: true
      },
      {
        id: 'vida_9',
        text: '9. O estresse profissional afeta sua vida familiar?',
        required: true
      },
      {
        id: 'vida_10',
        text: '10. O ambiente corporativo valoriza o descanso e recuperação dos funcionários?',
        required: true
      },

    ]
  }
];

export const SCORE_LABELS: Record<DrpsScore, string> = {
  0: 'Nunca',
  1: 'Raramente',
  2: 'Ocasionalmente',
  3: 'Frequentemente',
  4: 'Sempre'
};

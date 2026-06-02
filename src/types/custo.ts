// ─── Respostas do backend ─────────────────────────────────────────────────────

// GET /custos/atividade/:idAtividade
export interface CustosAtividade {
  idAtividade: number
  idProjeto: number
  nomeAtividade: string
  custoPlanejado: {
    materiais: number
    maoDeObra: number
    total: number
  }
  custoReal: {
    materiais: number
    maoDeObra: number
    total: number
  }
  desvio: {
    valor: number
    percentual: number
  }
}

// GET /custos/projeto/:idProjeto
export interface CustosProjeto {
  idProjeto: number
  custoPlanejado: {
    materiais: number
    maoDeObra: number
    total: number
  }
  custoReal: {
    materiais: number
    maoDeObra: number
    total: number
  }
  desvio: {
    valor: number
    percentual: number
  }
}

// ─── GET /atividades/:idAtividade/materiaisPlanejado ──────────────────────────
// Shape retornado pelo backend (join de MateriaisPlanejado + Material)
export interface ItemMaterial {
  id: number
  idMaterial: number
  idAtividade: number
  quantidade_planejada: number
  // campos do Material (via include)
  nome_material: string
  unidade_medida: string
  valor_unitario_cotado: number | null    // custo unitário planejado
  valor_unitario_adquirido: number | null // custo unitário real

  // campos computados no frontend
  item: string          // alias de nome_material
  unidade: string       // alias de unidade_medida
  qtdPlanejada: number  // alias de quantidade_planejada
  custoUnitPlan: number // alias de valor_unitario_cotado
  custoReal: number     // alias de valor_unitario_adquirido * qtd  (ou valor direto)
  custoPlanTotal: number // custoUnitPlan * qtdPlanejada
  variacao: number      // custoReal - custoPlanTotal
}

// ─── GET /atividades/:idAtividade/perfisPlanejado (via custos/atividade) ──────
// Shape retornado pelo backend (join de PerfisPlanejado + PerfisColaboradores)
export interface RecursoHH {
  id: number
  idAtividade: number
  idPerfilColaborador: number
  hh_planejada: number
  // campos do Perfil (via include)
  nome_cargo: string // alias de funcao

  // campos computados pelo serviço de custos
  funcao: string         // alias de nome_cargo
  hhPlanejado: number    // alias de hh_planejada
  custoPlanTotal: number // calculado pelo backend (hh_planejada * custo/h histórico)
  hhReal: number         // soma de hh_real dos ColaboradoresUtilizados
  custoRealTotal: number // calculado pelo backend
  variacao: number       // custoRealTotal - custoPlanTotal
}

// ─── Payloads de criação ──────────────────────────────────────────────────────

// POST /atividades/:idAtividade/materiaisPlanejado
export interface NovoMateriaisPlanejado {
  idMaterial: number
  quantidade_planejada: number
  valor_unitario_adquirido?: number | null
}

// POST /atividades/:idAtividade/perfisPlanejado
export interface NovoPerfilPlanejado {
  idPerfilColaborador: number
  hh_planejada: number
}

// ─── Shapes usados internamente pelos modais ──────────────────────────────────
// (o modal coleta estes campos e o service os transforma antes de enviar)

export interface NovoItemMaterial {
  item: string          // nome_material → usado para criar o Material se necessário
  unidade: string       // unidade_medida
  qtdPlanejada: number  // quantidade_planejada
  custoUnitPlan: number // valor_unitario_cotado
  custoReal: number     // valor_unitario_adquirido (total, será dividido por qtd internamente)
}

export interface NovoRecursoHH {
  funcao: string        // nome_cargo → para buscar/criar o perfil
  hhPlanejado: number   // hh_planejada
  custoPlanHH: number   // informativo; o backend recalcula pelo histórico
  hhReal: number        // informativo; o backend lê do diário de obra
  custoRealHH: number   // informativo; o backend recalcula
}
import api from "./api";
import type {
  CustosAtividade,
  CustosProjeto,
  NovoMateriaisPlanejado,
  NovoPerfilPlanejado,
} from "@/types/custo";

type ApiResponse<T> = { data: T };
type ApiListResponse<T> = { data: T; total?: number; nPages?: number };

// Tipos retornados pelo backend ao listar
export interface ItemMaterialPlanejado {
  id: string;
  idMaterial: number;
  idAtividade: number;
  quantidade_planejada: number;
  material: {
    id: number;
    nome_material: string;
    unidade_medida: string;
    valor_unitario_cotado: number | null;
    valor_unitario_adquirido: number | null;
  };
  // calculados no frontend
  item: string;
  unidade: string;
  qtdPlanejada: number;
  custoUnitPlan: number;
  custoPlanTotal: number;
  custoReal: number;
  variacao: number;
}

export interface RecursoHHPlanejado {
  id: string;
  idPerfilColaborador: number;
  idAtividade: number;
  hh_planejada: number;
  perfisColaborador: {
    id: number;
    nome_cargo: string;
  };
  // calculados no frontend
  funcao: string;
  hhPlanejado: number;
  custoPlanTotal: number;
  hhReal: number;
  custoRealTotal: number;
  variacao: number;
}

export const custosService = {
  buscarPorAtividade: async (
    idAtividade: number | string,
  ): Promise<CustosAtividade> => {
    const { data } = await api.get<ApiResponse<CustosAtividade>>(
      `/custos/atividade/${idAtividade}`,
    );

    return data.data;
  },

  buscarPorProjeto: async (
    idProjeto: number | string,
  ): Promise<CustosProjeto> => {
    const { data } = await api.get<ApiResponse<CustosProjeto>>(
      `/custos/projeto/${idProjeto}`,
    );
    return data.data;
  },

  // Lista materiais planejados de uma atividade
  listarMateriaisPlanejado: async (
    idAtividade: number | string,
  ): Promise<ItemMaterialPlanejado[]> => {
    const { data } = await api.get<ApiListResponse<any[]>>(
      `/atividades/${idAtividade}/materiaisPlanejado`,
      { params: { limit: 200 } },
    );
    // Normaliza para o formato que o frontend espera
    return (data.data ?? []).map((row: any) => {
      const mat = row.material ?? {};
      const qtd = Number(row.quantidade_planejada) || 0;
      const custoUnit = Number(mat.valor_unitario_cotado) || 0;
      const custoReal = Number(mat.valor_unitario_adquirido) || 0;
      const custoPlanTotal = qtd * custoUnit;
      return {
        ...row,
        item: mat.nome_material ?? "-",
        unidade: mat.unidade_medida ?? "-",
        qtdPlanejada: qtd,
        custoUnitPlan: custoUnit,
        custoPlanTotal,
        custoReal: qtd * custoReal,
        variacao: qtd * custoReal - custoPlanTotal,
      };
    });
  },

  // Lista perfis planejados (HH) de uma atividade
  listarPerfisPlanejado: async (
    idAtividade: number | string,
  ): Promise<RecursoHHPlanejado[]> => {
    const { data } = await api.get<ApiListResponse<any[]>>(
      `/atividades/${idAtividade}/perfisPlanejado`,
      { params: { limit: 200 } },
    );
    return (data.data ?? []).map((row: any) => {
      const perfil = row.perfisColaborador ?? {};
      const hhPlanejado = Number(row.hh_planejada) || 0;
      return {
        ...row,
        funcao: perfil.nome_cargo ?? "-",
        hhPlanejado,
        custoPlanTotal: 0, // backend não retorna custo/hora planejado ainda
        hhReal: 0, // vem do diário de obra (futuro)
        custoRealTotal: 0,
        variacao: 0,
      };
    });
  },

  // Adiciona material planejado a uma atividade
  adicionarMaterialPlanejado: async (
    idAtividade: number | string,
    dados: NovoMateriaisPlanejado,
  ): Promise<void> => {
    await api.post(`/atividades/${idAtividade}/materiaisPlanejado`, {
      idMaterial: dados.idMaterial,
      quantidade_planejada: dados.quantidade_planejada,
      valor_unitario_adquirido: dados.valor_unitario_adquirido ?? null,
    });
  },

  // Adiciona perfil planejado (HH) a uma atividade
  criarPerfilPlanejado: async (
    atividadeId: number,
    dados: {
      idPerfilColaborador: number;
      hh_planejada: number;
    },
  ) => {
    const response = await api.post(
      `/atividades/${atividadeId}/perfisPlanejado`,
      dados,
    );

    return response.data.data;
  },
};

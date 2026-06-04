import api from "./api";
import type {
  CustosAtividade,
  CustosProjeto,
  NovoMateriaisPlanejado,
  NovoPerfilPlanejado,
} from "@/types/custo";

type ApiResponse<T> = { data: T };
type ApiListResponse<T> = { data: T; total?: number; nPages?: number };

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

  listarMateriaisPlanejado: async (
    idAtividade: number | string,
  ): Promise<ItemMaterialPlanejado[]> => {
    const { data } = await api.get<ApiListResponse<any[]>>(
      `/atividades/${idAtividade}/materiaisPlanejado`,
      { params: { limit: 200 } },
    );
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

  listarPerfisPlanejado: async (
    idAtividade: number | string,
  ): Promise<RecursoHHPlanejado[]> => {
    const { data } = await api.get<ApiListResponse<any[]>>(
      `/atividades/${idAtividade}/perfisPlanejado`,
      { params: { limit: 200 } },
    );
    const lista = Array.isArray(data.data) ? data.data : [];
    return lista.map((row: any) => {
      const perfil = row.perfisColaborador ?? {};
      const hhPlanejado = Number(row.hh_planejada) || 0;
      return {
        ...row,
        funcao: perfil.nome_cargo ?? "-",
        hhPlanejado,
        custoPlanTotal: 0,
        hhReal: 0,
        custoRealTotal: 0,
        variacao: 0,
      };
    });
  },

  adicionarMaterialPlanejado: async (
    idAtividade: number | string,
    dados: NovoMateriaisPlanejado,
  ): Promise<void> => {
    await api.post(`/atividades/${idAtividade}/materiaisPlanejado`, {
      idMaterial: dados.idMaterial,
      quantidade_planejada: dados.quantidade_planejada,
      valor_unitario_cotado: dados.valor_unitario_cotado ?? null,
      valor_unitario_adquirido: dados.valor_unitario_adquirido ?? null,
    });
  },

  adicionarPerfilPlanejado: async (
    idAtividade: number | string,
    dados: NovoPerfilPlanejado,
  ): Promise<void> => {
    await api.post(`/atividades/${idAtividade}/perfisPlanejado`, {
      idPerfilColaborador: dados.idPerfilColaborador,
      hh_planejada: dados.hh_planejada,
    });
  },
};
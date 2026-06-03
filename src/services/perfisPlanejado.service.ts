import api from "./api";

export interface CriarPerfilPlanejadoDTO {
  idPerfilColaborador: number;
  hh_planejada: number;
}

export interface PerfilPlanejado {
  id: number;
  idAtividade: number;
  idPerfilColaborador: number;
  hh_planejada: string | number;
  createdAt?: string;
  updatedAt?: string;
}

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export const custosService = {
  criarPerfilPlanejado: async (
    atividadeId: number,
    dados: CriarPerfilPlanejadoDTO,
  ): Promise<PerfilPlanejado> => {
    const { data } = await api.post<ApiResponse<PerfilPlanejado>>(
      `/atividades/${atividadeId}/perfisPlanejado`,
      dados,
    );

    return data.data;
  },
};
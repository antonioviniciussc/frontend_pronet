import api from './api'

export interface PerfilColaborador {
  id: number
  nome_cargo: string
  descricao: string | null
}

type ApiListResponse<T> = { data: T; total?: number }

export const perfisColaboradoresService = {
  listar: async (): Promise<PerfilColaborador[]> => {
    const { data } = await api.get<ApiListResponse<PerfilColaborador[]>>(
      '/perfisColaboradores/listarColaborador',
      { params: { limit: 200 } }
    )
    return data.data ?? []
  },
}

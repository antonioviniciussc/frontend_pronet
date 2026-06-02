import api from './api'

export interface Material {
  id: number
  nome_material: string
  unidade_medida: string
  valor_unitario_cotado: number | null
  valor_unitario_adquirido: number | null
  descricao?: string | null
  codigo_produto?: string | null
}

type ApiListResponse<T> = { data: T; total?: number }

export const materiaisService = {
  listar: async (): Promise<Material[]> => {
    const { data } = await api.get<ApiListResponse<Material[]>>('/materiais/listarMateriais', {
      params: { limit: 100 }
    })
    return data.data
  }
}
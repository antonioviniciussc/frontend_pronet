import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { custosService } from '@/services/custos.service'
import { materiaisService } from '@/services/materiais.service'
import { perfisColaboradoresService } from '@/services/perfisColaboradores.service'
import type { NovoMateriaisPlanejado, NovoPerfilPlanejado } from '@/types/custo'
import api from '@/services/api'

// ── Materiais planejados ────────────────────────────────────────────────────

export function useItens(_projetoId: string, atividadeId: string) {
  return useQuery({
    queryKey: ['itens', atividadeId],
    queryFn: () => custosService.listarMateriaisPlanejado(atividadeId),
    enabled: !!atividadeId,
  })
}

export function useCriarItem(_projetoId: string, atividadeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: NovoMateriaisPlanejado) =>
      custosService.adicionarMaterialPlanejado(atividadeId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens', atividadeId] })
    },
  })
}

export function useExcluirItem(_projetoId: string, atividadeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string | number) =>
      api.delete(`/atividades/materiaisPlanejado/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itens', atividadeId] })
    },
  })
}

// ── Recursos HH planejados ──────────────────────────────────────────────────

export function useRecursos(_projetoId: string, atividadeId: string) {
  return useQuery({
    queryKey: ['recursos', atividadeId],
    queryFn: () => custosService.listarPerfisPlanejado(atividadeId),
    enabled: !!atividadeId,
  })
}

export function useCriarRecurso(_projetoId: string, atividadeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: NovoPerfilPlanejado) =>
      custosService.adicionarPerfilPlanejado(atividadeId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos', atividadeId] })
    },
  })
}

export function useExcluirRecurso(_projetoId: string, atividadeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (_recursoId: string) => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos', atividadeId] })
    },
  })
}

// ── Listas para os selects dos modais ──────────────────────────────────────

export function useMateriais() {
  return useQuery({
    queryKey: ['materiais'],
    queryFn: () => materiaisService.listar(),
  })
}

export function usePerfisColaboradores() {
  return useQuery({
    queryKey: ['perfisColaboradores'],
    queryFn: () => perfisColaboradoresService.listar(),
  })
}

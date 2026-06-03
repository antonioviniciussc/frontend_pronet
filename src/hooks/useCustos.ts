import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { custosService } from "@/services/custos.service";
import { materiaisService } from "@/services/materiais.service";
import { perfisColaboradoresService } from "@/services/perfisColaboradores.service";
import type {
  NovoMateriaisPlanejado,
  NovoPerfilPlanejado,
} from "@/types/custo";
import api from "@/services/api";

// ── Materiais planejados ────────────────────────────────────────────────────

export function useItens(_projetoId: number, atividadeId: number) {
  return useQuery({
    queryKey: ["itens", atividadeId],
    queryFn: () => custosService.listarMateriaisPlanejado(atividadeId),
    enabled: !!atividadeId,
  });
}

export function useCriarItem(_projetoId: number, atividadeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoMateriaisPlanejado) =>
      custosService.adicionarMaterialPlanejado(atividadeId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens", atividadeId] });
    },
  });
}

export function useExcluirItem(_projetoId: number, atividadeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      api.delete(`/atividades/materiaisPlanejado/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens", atividadeId] });
    },
  });
}

// ── Recursos HH planejados ──────────────────────────────────────────────────

export function useRecursos(_projetoId: number, atividadeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: {
      idPerfilColaborador: number;
      hh_planejada: number;
    }) => custosService.criarPerfilPlanejado(atividadeId, dados),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recursos", atividadeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["custos-atividade", atividadeId],
      });
    },
  });
}

export function useCriarRecurso(projetoId: number, atividadeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: {
      idPerfilColaborador: number;
      hh_planejada: number;
    }) => custosService.criarPerfilPlanejado(atividadeId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recursos", projetoId, atividadeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["custos-atividade", atividadeId],
      });
    },
  });
}

export function useExcluirRecurso(_projetoId: number, atividadeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_recursoId: number) => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recursos", atividadeId] });
    },
  });
}

// ── Listas para os selects dos modais ──────────────────────────────────────

export function useMateriais() {
  return useQuery({
    queryKey: ["materiais"],
    queryFn: () => materiaisService.listar(),
  });
}

export function usePerfisColaboradores() {
  return useQuery({
    queryKey: ["perfisColaboradores"],
    queryFn: () => perfisColaboradoresService.listar(),
  });
}

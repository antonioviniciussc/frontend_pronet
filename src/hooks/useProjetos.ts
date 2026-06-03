import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NovoProjeto } from "@/types/projeto";

import { projetosService } from "@/services/projetos.service";

// ─── Projetos ────────────────────────────────────────────────────────────────

export function useProjeto() {
  return useQuery({
    queryKey: ["projetos"],
    queryFn: projetosService.listar,
  });
}

export function useCriarProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: NovoProjeto) => projetosService.criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
    },
  });
}

export function useProjetoFind(id?: string) {
  return useQuery({
    queryKey: ["projetos", id],
    queryFn: () => projetosService.buscarPorId(String(id)),
    enabled: !!id,
  });
}

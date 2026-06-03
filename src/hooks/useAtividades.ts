import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atividadesService } from "@/services/atividades.service";
import type { NovaAtividade, Atividade } from "@/types/projeto";
export function useAtividades(projetoId: number | string) {
  return useQuery({
    queryKey: ["atividades", projetoId],
    queryFn: () => atividadesService.listar(projetoId),
    enabled: !!projetoId,
  });
}

export function useCriarAtividade(projetoId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: NovaAtividade) =>
      atividadesService.criar(projetoId, dados),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["atividades", projetoId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projetos", projetoId],
      });
    },
  });
}


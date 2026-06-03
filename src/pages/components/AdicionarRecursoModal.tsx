import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import { useCriarRecurso, usePerfisColaboradores } from "@/hooks/useCustos";

const schema = z.object({
  idPerfilColaborador: z.coerce.number().min(1, "Selecione uma função"),
  hh_planejada: z.coerce
    .number()
    .min(0.01, "Informe uma HH planejada maior que zero"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  projetoId: number;
  atividadeId: number;
}

export default function AdicionarRecursoModal({
  open,
  onClose,
  projetoId,
  atividadeId,
}: Props) {
  const criarRecurso = useCriarRecurso(projetoId, atividadeId);
  const { data: perfis = [], isLoading: loadingPerfis } =
    usePerfisColaboradores();

  console.log(perfis);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      idPerfilColaborador: 0,
      hh_planejada: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    await criarRecurso.mutateAsync({
      idPerfilColaborador: data.idPerfilColaborador,
      hh_planejada: data.hh_planejada,
    });

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Adicionar Recurso Humano Planejado"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Função <span className="text-danger">*</span>
          </label>

          <select
            {...register("idPerfilColaborador")}
            className="input-field"
            disabled={loadingPerfis}
          >
            <option value={0}>
              {loadingPerfis ? "Carregando..." : "Selecione uma função"}
            </option>

            {perfis.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.nome_cargo}
              </option>
            ))}
          </select>

          {errors.idPerfilColaborador && (
            <p className="text-danger text-xs mt-1">
              {errors.idPerfilColaborador.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            HH Planejada <span className="text-danger">*</span>
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            {...register("hh_planejada")}
            className="input-field"
          />

          {errors.hh_planejada && (
            <p className="text-danger text-xs mt-1">
              {errors.hh_planejada.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancelar
          </button>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

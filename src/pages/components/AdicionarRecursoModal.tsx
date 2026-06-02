import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import { useCriarRecurso, usePerfisColaboradores } from '@/hooks/useCustos'

const schema = z.object({
  idPerfilColaborador: z.coerce.number().min(1, 'Selecione uma função'),
  hh_planejada: z.coerce.number().min(0),
  custoPlanHH: z.coerce.number().min(0),
  hhReal: z.coerce.number().min(0),
  custoRealHH: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  projetoId: string
  atividadeId: string
}

export default function AdicionarRecursoModal({ open, onClose, projetoId, atividadeId }: Props) {
  const criarRecurso = useCriarRecurso(projetoId, atividadeId)
  const { data: perfis = [], isLoading: loadingPerfis } = usePerfisColaboradores()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { idPerfilColaborador: 0, hh_planejada: 0, custoPlanHH: 0, hhReal: 0, custoRealHH: 0 },
  })

  const onSubmit = async (data: FormData) => {
    // Backend aceita: idPerfilColaborador + hh_planejada
    // custoPlanHH, hhReal, custoRealHH são calculados (diário de obra / histórico)
    await criarRecurso.mutateAsync({
      idPerfilColaborador: data.idPerfilColaborador,
      hh_planejada: data.hh_planejada,
    })
    reset()
    onClose()
  }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Adicionar Recurso Humano (HH)">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Função (select do banco — nome_cargo de PerfisColaboradores) */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Função <span className="text-danger">*</span>
          </label>
          <select
            {...register('idPerfilColaborador')}
            className="input-field"
            disabled={loadingPerfis}
          >
            <option value={0}>
              {loadingPerfis ? 'Carregando...' : 'Pedreiro, Engenheiro...'}
            </option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_cargo}
              </option>
            ))}
          </select>
          {errors.idPerfilColaborador && (
            <p className="text-danger text-xs mt-1">{errors.idPerfilColaborador.message}</p>
          )}
        </div>

        {/* HH Planejado + Custo Plan. (R$/HH) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">HH Planejado</label>
            <input type="number" step="0.01" min="0" {...register('hh_planejada')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Custo Plan. (R$/HH)</label>
            <input type="number" step="0.01" min="0" {...register('custoPlanHH')} className="input-field" />
          </div>
        </div>

        {/* HH Real + Custo Real (R$/HH) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">HH Real</label>
            <input type="number" step="0.01" min="0" {...register('hhReal')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Custo Real (R$/HH)</label>
            <input type="number" step="0.01" min="0" {...register('custoRealHH')} className="input-field" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

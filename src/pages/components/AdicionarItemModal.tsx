import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import { useCriarItem, useMateriais } from '@/hooks/useCustos'

const schema = z.object({
  idMaterial: z.coerce.number().min(1, 'Selecione um material'),
  quantidade_planejada: z.coerce.number().min(0),
  custoUnitPlan: z.coerce.number().min(0),
  custoReal: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  projetoId: number
  atividadeId: number
}

export default function AdicionarItemModal({ open, onClose, projetoId, atividadeId }: Props) {
  const criarItem = useCriarItem(projetoId, atividadeId)
  const { data: materiais = [], isLoading: loadingMateriais } = useMateriais()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { idMaterial: 0, quantidade_planejada: 0, custoUnitPlan: 0, custoReal: 0 },
  })

  // Ao selecionar um material, preenche automaticamente Custo Unit. Plan. e Custo Real
  const idMaterialSelecionado = watch('idMaterial')
  const materialSelecionado = materiais.find((m) => m.id === Number(idMaterialSelecionado))

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setValue('idMaterial', id)
    const mat = materiais.find((m) => m.id === id)
    if (mat) {
      setValue('custoUnitPlan', mat.valor_unitario_cotado ?? 0)
      setValue('custoReal', Number((mat as any).valor_unitario_adquirido) ?? 0)
    }
  }

  const onSubmit = async (data: FormData) => {
  await criarItem.mutateAsync({
    idMaterial: data.idMaterial,
    quantidade_planejada: data.quantidade_planejada,
    valor_unitario_adquirido: Number(data.custoReal) || null,
  })
  reset()
  onClose()
}

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Adicionar Item de Material">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Item (select do banco) + Unidade (preenchida automaticamente) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Item <span className="text-danger">*</span>
            </label>
            <select
              {...register('idMaterial')}
              className="input-field"
              disabled={loadingMateriais}
              onChange={handleMaterialChange}
            >
              <option value={0}>
                {loadingMateriais ? 'Carregando...' : 'Ex: Cabo 6mm'}
              </option>
              {materiais.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome_material}
                </option>
              ))}
            </select>
            {errors.idMaterial && (
              <p className="text-danger text-xs mt-1">{errors.idMaterial.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Unidade</label>
            <input
              className="input-field bg-gray-50"
              readOnly
              value={materialSelecionado?.unidade_medida ?? ''}
              placeholder="m², kg..."
            />
          </div>
        </div>

        {/* Qtd. Planejada + Custo Unit. Plan. */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Qtd. Planejada</label>
            <input type="number" step="0.01" min="0" {...register('quantidade_planejada')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Custo Unit. Plan. (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('custoUnitPlan')}
              className="input-field"
              placeholder="valor_unitario_cotado"
            />
          </div>
        </div>

        {/* Custo Real */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Custo Real (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('custoReal')}
            className="input-field"
            placeholder="valor_unitario_adquirido"
          />
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

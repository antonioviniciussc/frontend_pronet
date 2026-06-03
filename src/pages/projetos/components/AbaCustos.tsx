import { useAtividades } from '@/hooks/useAtividades'
import { formatCurrency } from '@/utils/formatters'
import { Pencil } from 'lucide-react'
import type { Projeto } from '@/types/projeto'

interface Props {
  projeto: Projeto
}

export default function AbaCustos({ projeto }: Props) {
  const { data: atividades = [], isLoading } = useAtividades(projeto.id)

  const totals = atividades.reduce(
    (acc, a) => ({
      matPlan: acc.matPlan + (a.materialPlanejado ?? 0),
      matReal: acc.matReal + (a.materialReal ?? 0),
      hhPlan: acc.hhPlan + a.hhPlanejado,
      hhReal: acc.hhReal + a.hhReal,
    }),
    { matPlan: 0, matReal: 0, hhPlan: 0, hhReal: 0 }
  )

  const desvioTotal =
    totals.matPlan + totals.hhPlan > 0
      ? (((totals.matReal + totals.hhReal - (totals.matPlan + totals.hhPlan)) /
          (totals.matPlan + totals.hhPlan)) *
          100)
      : 0

  const calcDesvio = (plan: number, real: number) =>
    plan > 0 ? (((real - plan) / plan) * 100).toFixed(1) : '0.0'

  if (isLoading) {
    return <div className="card p-8 text-center text-text-muted text-sm">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      {/* Cards de resumo */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Material Planejado', value: formatCurrency(totals.matPlan) },
          { label: 'Material Real', value: formatCurrency(totals.matReal) },
          { label: 'HH Planejado', value: formatCurrency(totals.hhPlan) },
          { label: 'HH Real', value: formatCurrency(totals.hhReal) },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-text-secondary mb-1">{item.label}</p>
            <p className="text-lg font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela detalhada */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="text-left px-4 py-3 table-header">Atividade</th>
              <th className="text-right px-4 py-3 table-header">Mat. Plan.</th>
              <th className="text-right px-4 py-3 table-header">Mat. Real</th>
              <th className="text-right px-4 py-3 table-header">HH Plan.</th>
              <th className="text-right px-4 py-3 table-header">HH Real</th>
              <th className="text-right px-4 py-3 table-header">Desvio</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {atividades.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-text-muted text-sm">
                  Nenhuma atividade cadastrada.
                </td>
              </tr>
            ) : (
              <>
                {atividades.map((a) => {
                  const desvio = Number(calcDesvio(
                    (a.materialPlanejado ?? 0) + a.hhPlanejado,
                    (a.materialReal ?? 0) + a.hhReal
                  ))
                  return (
                    <tr key={a.id} className="table-row">
                      <td className="px-4 py-3 text-sm text-text-primary">{a.nome}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">
                        {formatCurrency(a.materialPlanejado ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">
                        {formatCurrency(a.materialReal ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">
                        {formatCurrency(a.hhPlanejado)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">
                        {formatCurrency(a.hhReal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={desvio > 0 ? 'text-danger' : desvio < 0 ? 'text-success' : 'text-text-secondary'}>
                          {desvio > 0 ? '+' : ''}{desvio.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-text-muted hover:text-primary transition-colors p-1 rounded">
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {/* Totais */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-text-primary">Total</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.matPlan)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.matReal)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.hhPlan)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(totals.hhReal)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={desvioTotal > 0 ? 'text-danger' : desvioTotal < 0 ? 'text-success' : 'text-text-secondary'}>
                      {desvioTotal > 0 ? '+' : ''}{desvioTotal.toFixed(1)}%
                    </span>
                  </td>
                  <td />
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
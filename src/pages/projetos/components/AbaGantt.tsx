import { useMemo } from 'react'
import { useAtividades } from '@/hooks/useAtividades'
import type { Projeto } from '@/types/projeto'

interface Props {
  projeto: Projeto
}

function getDaysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function AbaGantt({ projeto }: Props) {
  const { data: atividades = [], isLoading } = useAtividades(projeto.id)

  const ganttData = useMemo(() => {
    if (!atividades.length) return null

    const projetoInicio = new Date(projeto.dataInicio)
    const projetoFim = new Date(projeto.dataTermino)
    const totalDays = getDaysBetween(projetoInicio, projetoFim) || 1

    // Gera os meses do período
    const months: { label: string; offset: number; width: number }[] = []
    const current = new Date(projetoInicio)
    current.setDate(1)
    while (current <= projetoFim) {
      const monthStart = new Date(Math.max(current.getTime(), projetoInicio.getTime()))
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1)
      const monthEnd = new Date(Math.min(nextMonth.getTime() - 1, projetoFim.getTime()))
      const offset = (getDaysBetween(projetoInicio, monthStart) / totalDays) * 100
      const width = ((getDaysBetween(monthStart, monthEnd) + 1) / totalDays) * 100
      months.push({
        label: `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`,
        offset: Math.max(0, offset),
        width,
      })
      current.setMonth(current.getMonth() + 1)
    }

    const today = new Date()
    const todayOffset = Math.max(
      0,
      Math.min(100, (getDaysBetween(projetoInicio, today) / totalDays) * 100)
    )

    const bars = atividades.map((a) => {
      const start = new Date(a.dataInicio)
      const end = new Date(a.dataTermino)
      const offset = Math.max(0, (getDaysBetween(projetoInicio, start) / totalDays) * 100)
      const width = Math.max(0.5, (getDaysBetween(start, end) / totalDays) * 100)
      return { ...a, offset, width }
    })

    return { months, bars, todayOffset }
  }, [atividades, projeto])

  if (isLoading) {
    return <div className="card p-8 text-center text-text-muted text-sm">Carregando...</div>
  }

  return (
    <div className="card p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Gráfico de Gantt</h3>

      {!ganttData || atividades.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">
          Nenhuma atividade para exibir no Gantt.
        </p>
      ) : (
        <div className="min-w-[600px]">
          {/* Colunas + header */}
          <div className="flex">
            <div className="w-40 flex-shrink-0 text-xs font-semibold text-text-secondary pb-2 pr-4">
              Atividade
            </div>
            <div className="flex-1 relative h-6">
              {ganttData.months.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 text-xs text-text-muted font-medium"
                  style={{ left: `${m.offset}%`, width: `${m.width}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Linha de hoje */}
          <div className="flex relative">
            <div className="w-40 flex-shrink-0" />
            <div className="flex-1 relative">
              <div
                className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                style={{ left: `${ganttData.todayOffset}%` }}
              >
                <div className="bg-red-500 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap -translate-x-1/2">
                  Hoje
                </div>
              </div>

              {/* Barras */}
              {ganttData.bars.map((bar) => (
                <div key={bar.id} className="flex items-center mb-2 h-8">
                  <div className="relative w-full h-5">
                    {/* Planejado */}
                    <div
                      className="absolute h-full rounded bg-primary/20 border border-primary/40"
                      style={{ left: `${bar.offset}%`, width: `${bar.width}%` }}
                    />
                    {/* Real (progresso) */}
                    <div
                      className="absolute h-full rounded bg-primary/60"
                      style={{
                        left: `${bar.offset}%`,
                        width: `${(bar.width * bar.progresso) / 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nomes das atividades */}
          <div className="flex mt-[-${ganttData.bars.length * 40}px]">
            <div className="w-40 flex-shrink-0 flex flex-col gap-2">
              {ganttData.bars.map((bar) => (
                <div key={bar.id} className="h-8 flex items-center">
                  <span className="text-xs text-text-primary truncate pr-2">{bar.nome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40" />
              <span className="text-xs text-text-secondary">Planejado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary/60" />
              <span className="text-xs text-text-secondary">Real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-xs text-text-secondary">Hoje</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

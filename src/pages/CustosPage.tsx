import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, TrendingDown } from 'lucide-react'
import { useProjeto, useAtividades } from '@/hooks/useProjetos'
import { useItens, useRecursos, useExcluirItem, useExcluirRecurso } from '@/hooks/useCustos'
import AdicionarItemModal from '@/pages/components/AdicionarItemModal'
import AdicionarRecursoModal from '@/pages/components/AdicionarRecursoModal'
import { formatCurrency } from '@/utils/formatters'
import type { Atividade } from '@/types/projeto'


// Hook que retorna os totais de uma atividade (materiais + HH)
function useTotaisAtividade(projetoId: string, atividadeId: string) {
  const { data: itens = [] } = useItens(projetoId, atividadeId)
  const { data: recursos = [] } = useRecursos(projetoId, atividadeId)
  return {
    matPlan: itens.reduce((s, i) => s + i.custoPlanTotal, 0),
    matReal: itens.reduce((s, i) => s + i.custoReal, 0),
    hhPlan: recursos.reduce((s, r) => s + r.custoPlanTotal, 0),
    hhReal: recursos.reduce((s, r) => s + r.custoRealTotal, 0),
  }
}

function DetalheAtividade({ projetoId, atividade }: { projetoId: string; atividade: Atividade }) {
  const [modalItem, setModalItem] = useState(false)
  const [modalRecurso, setModalRecurso] = useState(false)

  const { data: itens = [] } = useItens(projetoId, atividade.id)
  const { data: recursos = [] } = useRecursos(projetoId, atividade.id)
  const excluirItem = useExcluirItem(projetoId, atividade.id)
  const excluirRecurso = useExcluirRecurso(projetoId, atividade.id)

  const totalMatPlan = itens.reduce((s, i) => s + i.custoPlanTotal, 0)
  const totalMatReal = itens.reduce((s, i) => s + i.custoReal, 0)
  const totalHHPlan = recursos.reduce((s, r) => s + r.custoPlanTotal, 0)
  const totalHHReal = recursos.reduce((s, r) => s + r.custoRealTotal, 0)

  return (
    <div className="mt-2 bg-gray-50 rounded-lg border border-border p-4 space-y-4">
      <p className="text-sm font-semibold text-text-primary">
        Detalhamento da Atividade: {atividade.nome}
      </p>

      {/* Materiais */}
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Materiais</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {['Item', 'Unid.', 'Qtd. Plan.', 'Custo Plan. (R$)', 'Custo Real (R$)', 'Variação (R$)', ''].map((h) => (
                <th key={h} className="text-left px-2 py-1.5 text-text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-3 text-text-muted">Nenhum item</td></tr>
            ) : (
              <>
                {itens.map((it) => (
                  <tr key={it.id} className="border-b border-border/50">
                    <td className="px-2 py-2 text-text-primary">{it.item}</td>
                    <td className="px-2 py-2 text-text-secondary">{it.unidade}</td>
                    <td className="px-2 py-2 text-text-secondary">{it.qtdPlanejada}</td>
                    <td className="px-2 py-2 text-text-secondary">{formatCurrency(it.custoPlanTotal)}</td>
                    <td className="px-2 py-2 text-text-secondary">{formatCurrency(it.custoReal)}</td>
                    <td className={`px-2 py-2 font-medium ${it.variacao > 0 ? 'text-danger' : it.variacao < 0 ? 'text-success' : 'text-text-secondary'}`}>
                      {it.variacao > 0 ? '+' : ''}{formatCurrency(it.variacao)}
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => excluirItem.mutate(it.id)} className="text-text-muted hover:text-danger transition-colors p-0.5 rounded">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold bg-white">
                  <td colSpan={3} className="px-2 py-2 text-text-primary text-xs">Total Materiais</td>
                  <td className="px-2 py-2 text-text-secondary">{formatCurrency(totalMatPlan)}</td>
                  <td className="px-2 py-2 text-text-secondary">{formatCurrency(totalMatReal)}</td>
                  <td className={`px-2 py-2 ${totalMatReal - totalMatPlan > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(totalMatReal - totalMatPlan)}
                  </td>
                  <td />
                </tr>
              </>
            )}
          </tbody>
        </table>
        <button onClick={() => setModalItem(true)} className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          <Plus size={13} /> Adicionar Item
        </button>
      </div>

      {/* Recursos HH */}
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Recursos Humanos (HH)</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {['Função', 'HH Plan.', 'Custo Plan. (R$)', 'HH Real', 'Custo Real (R$)', 'Variação (R$)', ''].map((h) => (
                <th key={h} className="text-left px-2 py-1.5 text-text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recursos.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-3 text-text-muted">Nenhum recurso</td></tr>
            ) : (
              <>
                {recursos.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="px-2 py-2 text-text-primary">{r.funcao}</td>
                    <td className="px-2 py-2 text-text-secondary">{r.hhPlanejado}</td>
                    <td className="px-2 py-2 text-text-secondary">{formatCurrency(r.custoPlanTotal)}</td>
                    <td className="px-2 py-2 text-text-secondary">{r.hhReal}</td>
                    <td className="px-2 py-2 text-text-secondary">{formatCurrency(r.custoRealTotal)}</td>
                    <td className={`px-2 py-2 font-medium ${r.variacao > 0 ? 'text-danger' : r.variacao < 0 ? 'text-success' : 'text-text-secondary'}`}>
                      {r.variacao > 0 ? '+' : ''}{formatCurrency(r.variacao)}
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => excluirRecurso.mutate(r.id)} className="text-text-muted hover:text-danger transition-colors p-0.5 rounded">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold bg-white">
                  <td className="px-2 py-2 text-text-primary text-xs">Total HH</td>
                  <td className="px-2 py-2 text-text-secondary">{recursos.reduce((s, r) => s + r.hhPlanejado, 0)}</td>
                  <td className="px-2 py-2 text-text-secondary">{formatCurrency(totalHHPlan)}</td>
                  <td className="px-2 py-2 text-text-secondary">{recursos.reduce((s, r) => s + r.hhReal, 0)}</td>
                  <td className="px-2 py-2 text-text-secondary">{formatCurrency(totalHHReal)}</td>
                  <td className={`px-2 py-2 ${totalHHReal - totalHHPlan > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(totalHHReal - totalHHPlan)}
                  </td>
                  <td />
                </tr>
              </>
            )}
          </tbody>
        </table>
        <button onClick={() => setModalRecurso(true)} className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          <Plus size={13} /> Adicionar Recurso
        </button>
      </div>

      <AdicionarItemModal open={modalItem} onClose={() => setModalItem(false)} projetoId={projetoId} atividadeId={atividade.id} />
      <AdicionarRecursoModal open={modalRecurso} onClose={() => setModalRecurso(false)} projetoId={projetoId} atividadeId={atividade.id} />
    </div>
  )
}

// Linha da tabela — também contribui para os totais dos cards via onTotais
function LinhaAtividade({
  atividade,
  projetoId,
  projetoNome,
  onTotais,
}: {
  atividade: Atividade
  projetoId: string
  projetoNome: string
  onTotais?: (t: { matPlan: number; matReal: number; hhPlan: number; hhReal: number }) => void
}) {
  const [expandido, setExpandido] = useState(false)
  const totais = useTotaisAtividade(projetoId, atividade.id)

  // Reporta os totais para o pai toda vez que mudarem
   useEffect(() => {
    onTotais?.(totais)
  }, [totais.matPlan, totais.matReal, totais.hhPlan, totais.hhReal])

  const totalPlan = totais.matPlan + totais.hhPlan
  const totalReal = totais.matReal + totais.hhReal
  const variacao = totalReal - totalPlan
  const variacaoPerc = totalPlan > 0 ? (variacao / totalPlan) * 100 : 0
  const varClass = variacao > 0 ? 'text-danger' : variacao < 0 ? 'text-success' : 'text-text-secondary'

  return (
    <>
      <tr className="table-row cursor-pointer" onClick={() => setExpandido((v) => !v)}>
        <td className="px-4 py-3">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 text-text-muted flex-shrink-0">
              {expandido ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary leading-tight">{atividade.nome}</p>
              <p className="text-xs text-text-muted">{projetoNome}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-sm text-text-secondary text-right">{formatCurrency(totais.matPlan)}</td>
        <td className="px-3 py-3 text-sm text-text-secondary text-right">{formatCurrency(totais.hhPlan)}</td>
        <td className="px-3 py-3 text-sm font-medium text-text-primary text-right">{formatCurrency(totalPlan)}</td>
        <td className="px-3 py-3 text-sm text-text-secondary text-right">{formatCurrency(totais.matReal)}</td>
        <td className="px-3 py-3 text-sm text-text-secondary text-right">{formatCurrency(totais.hhReal)}</td>
        <td className="px-3 py-3 text-sm font-medium text-text-primary text-right">{formatCurrency(totalReal)}</td>
        <td className={`px-3 py-3 text-sm font-medium text-right ${varClass}`}>
          {variacao > 0 ? '+' : ''}{formatCurrency(variacao)}
        </td>
        <td className={`px-3 py-3 text-sm font-medium text-right ${varClass}`}>
          {variacaoPerc > 0 ? '+' : ''}{variacaoPerc.toFixed(1)}%
        </td>
        <td className="px-3 py-3 w-8 text-text-muted text-center">···</td>
      </tr>
      {expandido && (
        <tr>
          <td colSpan={10} className="px-4 pb-3">
            <DetalheAtividade projetoId={projetoId} atividade={atividade} />
          </td>
        </tr>
      )}
    </>
  )
}

// Agrega totais de todas as atividades de um projeto
function ProjetoAtividades({
  projetoId,
  projetoNome,
  onTotaisProjeto,
}: {
  projetoId: string
  projetoNome: string
  onTotaisProjeto?: (id: string, t: { matPlan: number; matReal: number; hhPlan: number; hhReal: number }) => void
}) {
  const { data: atividades = [] } = useAtividades(projetoId)
  const totaisMap = useMemo(() => new Map<string, TotaisProjeto>(), [projetoId])

  const reportar = (atividadeId: string, t: { matPlan: number; matReal: number; hhPlan: number; hhReal: number }) => {
    totaisMap.set(atividadeId, t)
    const soma = Array.from(totaisMap.values()).reduce(
      (acc, v) => ({ matPlan: acc.matPlan + v.matPlan, matReal: acc.matReal + v.matReal, hhPlan: acc.hhPlan + v.hhPlan, hhReal: acc.hhReal + v.hhReal }),
      { matPlan: 0, matReal: 0, hhPlan: 0, hhReal: 0 }
    )
    onTotaisProjeto?.(projetoId, soma)
  }

  return (
    <>
      {atividades.map((a) => (
        <LinhaAtividade
          key={a.id}
          atividade={a}
          projetoId={projetoId}
          projetoNome={projetoNome}
          onTotais={(t) => reportar(a.id, t)}
        />
      ))}
    </>
  )
}

export default function CustosPage() {
  const { data: projetos = [], isLoading } = useProjeto()
  const [projetoFiltro, setProjetoFiltro] = useState<string>('todos')
  // Mapa de totais por projeto — atualizado pelos filhos via callback
  type TotaisProjeto = { matPlan: number; matReal: number; hhPlan: number; hhReal: number }
const [totaisPorProjeto, setTotaisPorProjeto] = useState<Map<string, TotaisProjeto>>(new Map())

  const projetosFiltrados = useMemo(
    () => (projetoFiltro === 'todos' ? projetos : projetos.filter((p) => p.id === projetoFiltro)),
    [projetos, projetoFiltro]
  )


  const handleFiltro = (v: string) => {
    setProjetoFiltro(v)
    setTotaisPorProjeto(new Map())
  }

  const atualizarTotaisProjeto = (id: string, t: { matPlan: number; matReal: number; hhPlan: number; hhReal: number }) => {
    setTotaisPorProjeto((prev) => {
      const next = new Map(prev)
      next.set(id, t)
      return next
    })
  }

  // Totais dos cards = soma apenas dos projetos filtrados
  const totais = useMemo(() => {
    const idsFiltrados = new Set(projetosFiltrados.map((p) => p.id))
    let matPlan = 0, matReal = 0, hhPlan = 0, hhReal = 0
    totaisPorProjeto.forEach((t, id) => {
      if (idsFiltrados.has(id)) {
        matPlan += t.matPlan
        matReal += t.matReal
        hhPlan += t.hhPlan
        hhReal += t.hhReal
      }
    })
    const totalPlan = matPlan + hhPlan
    const totalReal = matReal + hhReal
    const variacao = totalReal - totalPlan
    const variacaoPerc = totalPlan > 0 ? (variacao / totalPlan) * 100 : 0
    const percRealizado = totalPlan > 0 ? Math.min((totalReal / totalPlan) * 100, 100) : 0
    return { matPlan, matReal, hhPlan, hhReal, totalPlan, totalReal, variacao, variacaoPerc, percRealizado }
  }, [totaisPorProjeto, projetosFiltrados])

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestão de Custos</h1>
          <p className="text-text-secondary text-sm mt-0.5">Planejado, Real e Comparativo por atividade</p>
        </div>
        <select value={projetoFiltro} onChange={(e) => handleFiltro(e.target.value)} className="input-field w-48">
          <option value="todos">Todos os Projetos</option>
          {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      {/* Cards do topo — alimentados pelos dados reais da tabela */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Custo Planejado Total</p>
          <p className="text-xl font-bold text-primary mb-1">{formatCurrency(totais.totalPlan)}</p>
          <div className="flex gap-3 text-xs text-text-muted">
            <span>Materiais: <span className="text-primary">{formatCurrency(totais.matPlan)}</span></span>
            <span>HH: <span className="text-primary">{formatCurrency(totais.hhPlan)}</span></span>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Custo Real Total</p>
          <p className="text-xl font-bold text-success mb-1">{formatCurrency(totais.totalReal)}</p>
          <div className="flex gap-3 text-xs text-text-muted">
            <span>Materiais: <span className="text-success">{formatCurrency(totais.matReal)}</span></span>
            <span>HH: <span className="text-success">{formatCurrency(totais.hhReal)}</span></span>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Variação Total</p>
          <div className="flex items-center gap-1.5 mb-1">
            <p className={`text-xl font-bold ${totais.variacao > 0 ? 'text-danger' : totais.variacao < 0 ? 'text-success' : 'text-text-primary'}`}>
              {totais.variacao > 0 ? '+' : ''}{formatCurrency(totais.variacao)}
            </p>
            {totais.variacao !== 0 && <TrendingDown size={16} className={totais.variacao > 0 ? 'text-danger' : 'text-success'} />}
          </div>
          <p className={`text-xs font-medium ${totais.variacao > 0 ? 'text-danger' : totais.variacao < 0 ? 'text-success' : 'text-text-muted'}`}>
            {totais.variacaoPerc > 0 ? '+' : ''}{totais.variacaoPerc.toFixed(2)}%
          </p>
        </div>

        <div className="card p-4 flex flex-col items-center justify-center">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-3">% Realizado</p>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${totais.percRealizado} ${100 - totais.percRealizado}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-text-primary">{totais.percRealizado.toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2">do planejado</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Custos por Atividade</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 table-header">Atividade</th>
                    <th colSpan={3} className="text-center px-3 py-2.5 table-header border-l border-border/50">Planejado (R$)</th>
                    <th colSpan={3} className="text-center px-3 py-2.5 table-header border-l border-border/50">Real (R$)</th>
                    <th colSpan={2} className="text-center px-3 py-2.5 table-header border-l border-border/50">Variação (R$)</th>
                    <th className="w-8" />
                  </tr>
                  <tr className="border-b border-border bg-gray-50/30 text-xs">
                    <th className="px-4 py-1.5" />
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium border-l border-border/50">Materiais</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium">HH</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium">Total</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium border-l border-border/50">Materiais</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium">HH</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium">Total</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium border-l border-border/50">Total</th>
                    <th className="px-3 py-1.5 text-right text-text-muted font-medium">%</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={10} className="text-center py-10 text-text-muted text-sm">Carregando...</td></tr>
                  ) : projetosFiltrados.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-10 text-text-muted text-sm">Nenhum projeto encontrado.</td></tr>
                  ) : (
                    projetosFiltrados.map((p) => (
                      <ProjetoAtividades
                        key={p.id}
                        projetoId={p.id}
                        projetoNome={p.nome}
                        onTotaisProjeto={atualizarTotaisProjeto}
                      />
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-text-primary">TOTAL</td>
                    <td className="px-3 py-3 text-sm text-right text-primary">{formatCurrency(totais.matPlan)}</td>
                    <td className="px-3 py-3 text-sm text-right text-primary">{formatCurrency(totais.hhPlan)}</td>
                    <td className="px-3 py-3 text-sm text-right text-primary">{formatCurrency(totais.totalPlan)}</td>
                    <td className="px-3 py-3 text-sm text-right text-success">{formatCurrency(totais.matReal)}</td>
                    <td className="px-3 py-3 text-sm text-right text-success">{formatCurrency(totais.hhReal)}</td>
                    <td className="px-3 py-3 text-sm text-right text-success">{formatCurrency(totais.totalReal)}</td>
                    <td className={`px-3 py-3 text-sm text-right ${totais.variacao > 0 ? 'text-danger' : 'text-success'}`}>
                      {totais.variacao > 0 ? '+' : ''}{formatCurrency(totais.variacao)}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right ${totais.variacaoPerc > 0 ? 'text-danger' : 'text-success'}`}>
                      {totais.variacaoPerc > 0 ? '+' : ''}{totais.variacaoPerc.toFixed(2)}%
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td colSpan={10} className="px-4 py-2">
                      <p className="text-xs text-text-muted">ⓘ Valores em Real (R$)</p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Composição do Custo Real</h3>
            {totais.totalReal === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">Sem dados de custo real</p>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Materiais</span>
                    <span className="text-text-primary font-medium">
                      {((totais.matReal / totais.totalReal) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(totais.matReal / totais.totalReal) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Mão de Obra</span>
                    <span className="text-text-primary font-medium">
                      {((totais.hhReal / totais.totalReal) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(totais.hhReal / totais.totalReal) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Comparativo Geral</h3>
            <div className="flex items-end justify-center gap-6 h-24">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                  <div
                    className="w-10 bg-blue-500 rounded-t transition-all"
                    style={{ height: totais.totalPlan > 0 ? `${Math.max(4, (totais.totalPlan / Math.max(totais.totalPlan, totais.totalReal)) * 72)}px` : '4px' }}
                  />
                </div>
                <span className="text-xs text-text-muted">Planejado</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                  <div
                    className="w-10 bg-emerald-400 rounded-t transition-all"
                    style={{ height: totais.totalReal > 0 ? `${Math.max(4, (totais.totalReal / Math.max(totais.totalPlan, totais.totalReal)) * 72)}px` : '4px' }}
                  />
                </div>
                <span className="text-xs text-text-muted">Real</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Variação Geral</h3>
            <div className="flex items-center gap-1.5">
              <p className={`text-xl font-bold ${totais.variacao > 0 ? 'text-danger' : totais.variacao < 0 ? 'text-success' : 'text-text-primary'}`}>
                {totais.variacao > 0 ? '+' : ''}{formatCurrency(totais.variacao)}
              </p>
              {totais.variacao !== 0 && <TrendingDown size={16} className={totais.variacao > 0 ? 'text-danger' : 'text-success'} />}
            </div>
            <p className={`text-xs mt-1 font-medium ${totais.variacaoPerc > 0 ? 'text-danger' : totais.variacaoPerc < 0 ? 'text-success' : 'text-text-muted'}`}>
              {totais.variacaoPerc > 0 ? '+' : ''}{totais.variacaoPerc.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
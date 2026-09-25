import React, { useState, useMemo } from 'react';
import { Dumbbell, ShieldCheck, CheckCircle2, Key, Clock, Search, X, CheckCheck, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';
import { getBrasiliaCurrentDateTime } from '../utils/formatters.ts';

interface GymKeyTurn {
  id: string;
  apto: string;
  responsavel: string;
  item: 'Chave Principal da Academia' | 'Cartão de Acesso / Tag' | 'Chave Armário / Vestiário' | string;
  horario: string;
  status: 'em_uso' | 'devolvido';
  observacaoDevolucao?: string;
  dataDevolucao?: string;
  teveNaoConformidade?: boolean;
}

export const GymView: React.FC = () => {
  const [turns, setTurns] = useState<GymKeyTurn[]>([
    {
      id: 'g-1',
      apto: '502',
      responsavel: 'Rafael Santos',
      item: 'Chave Principal da Academia',
      horario: '2026-09-22',
      status: 'em_uso'
    },
    {
      id: 'g-2',
      apto: '304',
      responsavel: 'Juliana Mendes',
      item: 'Chave Principal da Academia',
      horario: '2026-09-22',
      status: 'em_uso'
    },
    {
      id: 'g-3',
      apto: '108',
      responsavel: 'Thiago Oliveira',
      item: 'Cartão de Acesso / Tag',
      horario: '2026-09-22',
      status: 'devolvido',
      dataDevolucao: '2026-09-22 às 09:40',
      observacaoDevolucao: 'Chave e chaveiro devolvidos intactos na recepção.',
      teveNaoConformidade: false
    }
  ]);

  const [newTurn, setNewTurn] = useState({
    apto: '',
    responsavel: '',
    item: 'Chave Principal da Academia',
    horario: '2026-09-22'
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Filter and search state: Default to 'pendentes' as in the games room
  const [statusFilter, setStatusFilter] = useState<'pendentes' | 'devolvidos' | 'todos'>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');

  // Return modal state
  const [selectedTurnForReturn, setSelectedTurnForReturn] = useState<GymKeyTurn | null>(null);
  const [returnDataHora, setReturnDataHora] = useState(() => getBrasiliaCurrentDateTime());
  const [returnObs, setReturnObs] = useState('');
  const [hasNonConformity, setHasNonConformity] = useState(false);

  const pendingCount = useMemo(() => turns.filter(t => t.status === 'em_uso').length, [turns]);
  const returnedCount = useMemo(() => turns.filter(t => t.status === 'devolvido').length, [turns]);

  const filteredTurns = useMemo(() => {
    return turns.filter((t) => {
      // Status filter
      if (statusFilter === 'pendentes' && t.status !== 'em_uso') return false;
      if (statusFilter === 'devolvidos' && t.status !== 'devolvido') return false;

      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchApto = t.apto.toLowerCase().includes(query);
        const matchResp = t.responsavel.toLowerCase().includes(query);
        const matchItem = t.item.toLowerCase().includes(query);
        const matchObs = (t.observacaoDevolucao || '').toLowerCase().includes(query);
        const matchData = (t.dataDevolucao || '').toLowerCase().includes(query) || t.horario.includes(query);
        return matchApto || matchResp || matchItem || matchObs || matchData;
      }
      return true;
    });
  }, [turns, statusFilter, searchQuery]);

  const handleAddTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurn.apto || !newTurn.responsavel) return;
    setTurns([
      ...turns,
      {
        id: `gym-key-${Date.now()}`,
        apto: newTurn.apto,
        responsavel: newTurn.responsavel,
        item: newTurn.item,
        horario: newTurn.horario,
        status: 'em_uso'
      }
    ]);
    setNewTurn({ apto: '', responsavel: '', item: 'Chave Principal da Academia', horario: '2026-09-22' });
    setShowAddForm(false);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurnForReturn) return;

    let formattedDataDevolucao = '';
    if (returnDataHora) {
      const [datePart, timePart] = returnDataHora.includes('T')
        ? returnDataHora.split('T')
        : returnDataHora.split(' ');
      const ptDate = datePart.includes('-')
        ? datePart.split('-').reverse().join('/')
        : datePart;
      formattedDataDevolucao = timePart ? `${ptDate} às ${timePart}` : ptDate;
    } else {
      const nowFormatted = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const todayFormatted = new Date().toISOString().split('T')[0].split('-').reverse().join('/');
      formattedDataDevolucao = `${todayFormatted} às ${nowFormatted}`;
    }

    setTurns(turns.map(t => {
      if (t.id === selectedTurnForReturn.id) {
        return {
          ...t,
          status: 'devolvido',
          dataDevolucao: formattedDataDevolucao,
          observacaoDevolucao: returnObs.trim() || (hasNonConformity ? 'Não conformidade informada sem detalhes adicionais.' : 'Chave devolvida sem ressalvas na recepção.'),
          teveNaoConformidade: hasNonConformity
        };
      }
      return t;
    }));

    setSelectedTurnForReturn(null);
    setReturnObs('');
    setHasNonConformity(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sala Academia</h2>
            <p className="text-xs text-slate-500">
              Controle de retirada de chave na recepção, equipamentos e normas de uso
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>07h00 às 22h00</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Key className="w-4 h-4" />
            <span>{showAddForm ? 'Fechar Formulário' : 'RETIRADA DE CHAVE'}</span>
          </button>
        </div>
      </div>

      {/* Checkout Form */}
      {showAddForm && (
        <form onSubmit={handleAddTurn} className="bg-white p-5 rounded-xl border-2 border-blue-600/30 shadow-xs space-y-4 animate-scaleUp">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-700" />
            <span>RETIRADA DE CHAVE DA ACADEMIA NA RECEPÇÃO</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Apto</label>
              <input
                type="text"
                placeholder="Ex: 304"
                value={newTurn.apto}
                onChange={(e) => setNewTurn({ ...newTurn, apto: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Responsável</label>
              <input
                type="text"
                placeholder="Nome do morador/hóspede"
                value={newTurn.responsavel}
                onChange={(e) => setNewTurn({ ...newTurn, responsavel: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Item / Chave</label>
              <select
                value={newTurn.item}
                onChange={(e) => setNewTurn({ ...newTurn, item: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Chave Principal da Academia">Chave Principal da Academia</option>
                <option value="Cartão de Acesso / Tag">Cartão de Acesso / Tag</option>
                <option value="Chave Armário / Vestiário">Chave Armário / Vestiário</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Data da Retirada</label>
              <input
                type="date"
                value={newTurn.horario}
                onChange={(e) => setNewTurn({ ...newTurn, horario: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              Confirmar Retirada
            </button>
          </div>
        </form>
      )}

      {/* Grid: Checkouts & Returns + Equipment & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Keys & Items Checkout Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>CHAVES RETIRADAS & DEVOLUÇÕES</span>
            </h3>
            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-semibold">
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search Bar for Consultations */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por apto, morador, item ou histórico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs (Default: Pendentes) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('pendentes')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                statusFilter === 'pendentes'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pendentes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'pendentes' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('devolvidos')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                statusFilter === 'devolvidos'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Devolvidos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'devolvidos' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {returnedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                statusFilter === 'todos'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                {turns.length}
              </span>
            </button>
          </div>

          {/* List of checkout items */}
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
            {filteredTurns.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                {statusFilter === 'pendentes' && !searchQuery ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Nenhuma chave pendente de devolução</p>
                    <p className="text-[11px] text-slate-400">Todas as chaves da academia estão guardadas na recepção.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">Nenhum registro encontrado</p>
                    <p className="text-[11px] text-slate-400">
                      {searchQuery
                        ? `Não encontramos resultados para "${searchQuery}".`
                        : statusFilter === 'devolvidos'
                        ? 'Não há devoluções de chave registradas no momento.'
                        : 'Não há registros de retirada.'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              filteredTurns.map((t) => (
                <div key={t.id} className="py-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <Key className="w-3 h-3 text-slate-500" />
                          <span>{t.item}</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Apto {t.apto}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">Responsável: <strong>{t.responsavel}</strong></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Retirado em: {t.horario.includes('-') && t.horario.length === 10 ? t.horario.split('-').reverse().join('/') : t.horario}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'em_uso'
                            ? 'bg-amber-100 text-amber-800'
                            : t.teveNaoConformidade
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status === 'em_uso'
                          ? 'PENDENTE DEVOLUÇÃO'
                          : t.teveNaoConformidade
                          ? 'Devolvido c/ Avaria'
                          : 'Devolvido'}
                      </span>

                      {t.status === 'em_uso' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTurnForReturn(t);
                            setReturnDataHora(getBrasiliaCurrentDateTime());
                            setReturnObs('');
                            setHasNonConformity(false);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Fazer Devolução</span>
                        </button>
                      ) : (
                        <div className="mt-1 text-[11px] text-slate-500 text-right">
                          <span>{t.dataDevolucao}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observations if returned */}
                  {t.observacaoDevolucao && (
                    <div className={`rounded-lg p-2 text-xs border ${
                      t.teveNaoConformidade
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700'
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-0.5">
                        {t.teveNaoConformidade ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-rose-800 font-bold">Não Conformidade / Ressalva Registrada:</span>
                          </>
                        ) : (
                          <span className="text-slate-600">Observações da Devolução:</span>
                        )}
                      </div>
                      <p className={t.teveNaoConformidade ? 'text-rose-800' : 'text-slate-600'}>
                        {t.observacaoDevolucao}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Equipment & Rules */}
        <div className="space-y-5">
          {/* Equipment Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Equipamentos da Academia
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                6 itens cadastrados
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">01 Esteira Ergométrica</span>
                <span className="text-emerald-700 font-semibold">Operacional</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">02 Bikes (Bicicletas)</span>
                <span className="text-emerald-700 font-semibold">Operacionais</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">01 Estação Multifuncional</span>
                <span className="text-emerald-700 font-semibold">Operacional</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Conjunto de Halteres</span>
                <span className="text-emerald-700 font-semibold">Disponível</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">01 Elíptico</span>
                <span className="text-emerald-700 font-semibold">Operacional</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">01 Banco Supino</span>
                <span className="text-emerald-700 font-semibold">Operacional</span>
              </div>
            </div>
          </div>

          {/* Regulations */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Regras de Convivência e Chaves</span>
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Horário:</strong> Aberta diariamente das 07h00 às 22h00.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Retirada na Recepção:</strong> A chave deve ser retirada e devolvida na portaria/recepção pelo morador responsável.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Obrigatório o uso de calçado esportivo adequado e toalha de treino.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Higienizar os aparelhos com álcool 70% após a utilização.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Guardar os pesos e anilhas nos suportes correspondentes após o treino.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Return Key Modal */}
      {selectedTurnForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registrar Devolução de Chave</h3>
                <p className="text-xs text-slate-500">
                  Apto {selectedTurnForReturn.apto} • {selectedTurnForReturn.responsavel}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Item retirado:</strong> {selectedTurnForReturn.item}</p>
              <p><strong>Data da retirada:</strong> {selectedTurnForReturn.horario}</p>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Data e Hora da Devolução *</span>
                </label>
                <input
                  type="datetime-local"
                  value={returnDataHora}
                  onChange={(e) => setReturnDataHora(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium bg-white"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasNonConformity}
                    onChange={(e) => setHasNonConformity(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span>Houve perda, avaria ou não conformidade na devolução?</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Observações da Devolução {hasNonConformity && <span className="text-amber-600 font-bold">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    hasNonConformity
                      ? 'Descreva a ocorrência (ex: chaveiro quebrado, chave entregue por terceiro...)'
                      : 'Ex: Chave entregue na recepção sem ressalvas.'
                  }
                  value={returnObs}
                  onChange={(e) => setReturnObs(e.target.value)}
                  required={hasNonConformity}
                  className={`w-full text-xs px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none ${
                    hasNonConformity ? 'border-amber-400 focus:ring-amber-500' : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTurnForReturn(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Devolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

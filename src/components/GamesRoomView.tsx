import React, { useState, useMemo } from 'react';
import { Gamepad2, Clock, ShieldAlert, CheckCircle2, AlertCircle, RotateCcw, PackageCheck, Search, X, CheckCheck, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { getBrasiliaCurrentDateTime } from '../utils/formatters.ts';
import { GameTurn } from '../types.ts';
import { INITIAL_GAMES_TURNS } from '../data/condoMockData.ts';

export interface GamesRoomViewProps {
  turns?: GameTurn[];
  onAddTurn?: (turn: GameTurn) => void;
  onUpdateTurn?: (turn: GameTurn) => void;
  isAdmin?: boolean;
  onClearModule?: () => void;
}

export const GamesRoomView: React.FC<GamesRoomViewProps> = ({
  turns: propTurns,
  onAddTurn,
  onUpdateTurn,
  isAdmin,
  onClearModule
}) => {
  const [localTurns, setLocalTurns] = useState<GameTurn[]>(INITIAL_GAMES_TURNS);
  const turns = propTurns ?? localTurns;

  const [newTurn, setNewTurn] = useState({
    apto: '',
    responsavel: '',
    mesa: 'kit bolas + 04 tacos' as GameTurn['mesa'],
    horario: '2026-09-22',
    observacoes: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Filter and search state: Default to 'pendentes' as requested
  const [statusFilter, setStatusFilter] = useState<'pendentes' | 'devolvidos' | 'todos'>('pendentes');
  const [searchQuery, setSearchQuery] = useState('');

  // Return item modal state
  const [selectedTurnForReturn, setSelectedTurnForReturn] = useState<GameTurn | null>(null);
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
        const matchMesa = t.mesa.toLowerCase().includes(query);
        const matchObs = ((t.observacoes || '') + ' ' + (t.observacaoDevolucao || '')).toLowerCase().includes(query);
        const matchData = (t.dataDevolucao || '').toLowerCase().includes(query) || t.horario.includes(query);
        return matchApto || matchResp || matchMesa || matchObs || matchData;
      }
      return true;
    });
  }, [turns, statusFilter, searchQuery]);

  const handleAddTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurn.apto || !newTurn.responsavel) return;
    const newEntry: GameTurn = {
      id: `turn-${Date.now()}`,
      apto: newTurn.apto,
      responsavel: newTurn.responsavel,
      mesa: newTurn.mesa,
      horario: newTurn.horario,
      status: 'em_uso',
      observacoes: newTurn.observacoes.trim() || undefined
    };
    if (onAddTurn) {
      onAddTurn(newEntry);
    } else {
      setLocalTurns((prev) => [...prev, newEntry]);
    }
    setNewTurn({ apto: '', responsavel: '', mesa: 'kit bolas + 04 tacos', horario: '2026-09-22', observacoes: '' });
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

    const updatedTurn: GameTurn = {
      ...selectedTurnForReturn,
      status: 'devolvido',
      dataDevolucao: formattedDataDevolucao,
      observacaoDevolucao: returnObs.trim() || (hasNonConformity ? 'Não conformidade informada sem detalhes adicionais.' : 'Item devolvido sem ressalvas.'),
      teveNaoConformidade: hasNonConformity
    };

    if (onUpdateTurn) {
      onUpdateTurn(updatedTurn);
    } else {
      setLocalTurns((prev) => prev.map((t) => (t.id === updatedTurn.id ? updatedTurn : t)));
    }

    setSelectedTurnForReturn(null);
    setReturnObs('');
    setHasNonConformity(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sala de Jogos</h2>
            <p className="text-xs text-slate-500">
              Controle de retirada e devolução de itens, jogos e normas da sala
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isAdmin && onClearModule && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Atenção Administrador: Deseja limpar todos os registros e histórico da Sala de Jogos?')) {
                  onClearModule();
                }
              }}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="Limpar todos os registros deste módulo (Função Administrador)"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Limpar Módulo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <PackageCheck className="w-4 h-4" />
            <span>{showAddForm ? 'Fechar Formulário' : 'RETIRADA DE ITENS'}</span>
          </button>
        </div>
      </div>

      {/* Booking Form */}
      {showAddForm && (
        <form onSubmit={handleAddTurn} className="bg-white p-5 rounded-xl border-2 border-blue-600/30 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            RETIRADA DE ITENS NA RECEPÇÃO
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
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Item / Jogo</label>
              <select
                value={newTurn.mesa}
                onChange={(e) => setNewTurn({ ...newTurn, mesa: e.target.value as GameTurn['mesa'] })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="kit bolas + 04 tacos">kit bolas + 04 tacos</option>
                <option value="Ludo">Ludo</option>
                <option value="Dominó">Dominó</option>
                <option value="Xadrez">Xadrez</option>
                <option value="Dama">Dama</option>
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
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Observações (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Apenas 2 tacos emprestados, autorização especial, conferir na entrega..."
              value={newTurn.observacoes}
              onChange={(e) => setNewTurn({ ...newTurn, observacoes: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg"
            >
              Confirmar Retirada
            </button>
          </div>
        </form>
      )}

      {/* Equipment and Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registered Pickups & Returns */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Itens Retirados & Devoluções</span>
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

          {/* List of items */}
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
            {filteredTurns.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                {statusFilter === 'pendentes' && !searchQuery ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Nenhum item pendente de devolução</p>
                    <p className="text-[11px] text-slate-400">Todos os itens retirados já foram devolvidos à portaria.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">Nenhum registro encontrado</p>
                    <p className="text-[11px] text-slate-400">
                      {searchQuery
                        ? `Não encontramos resultados para "${searchQuery}".`
                        : statusFilter === 'devolvidos'
                        ? 'Não há devoluções registradas no momento.'
                        : 'Não há itens registrados.'}
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
                        <span className="font-bold text-slate-900 text-xs">{t.mesa}</span>
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
                          ? 'Pendente Devolução'
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

                  {/* Observations on checkout */}
                  {t.observacoes && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 w-fit">
                      <span className="font-semibold text-slate-700">Obs:</span>
                      <span>{t.observacoes}</span>
                    </div>
                  )}

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
                            <span className="text-rose-800 font-bold">Não Conformidade / Avaria Registrada:</span>
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

        {/* Rules and Guidelines */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Normas e Regulamento da Sala de Jogos</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Horário de Funcionamento:</strong> Diariamente das 08h00 às 22h00.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Retirada de Tacos e Bolas:</strong> Disponíveis na portaria mediante identificação do apartamento.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Conferência na Devolução:</strong> Todos os itens devem ser conferidos no momento da entrega; avarias ou peças faltantes serão registradas nas observações.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Idade Mínima:</strong> Menores de 12 anos devem estar acompanhados de responsável.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Proibições:</strong> É vedado consumir bebidas na borda das mesas de sinuca e fumar no local.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Return Modal */}
      {selectedTurnForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registrar Devolução de Item</h3>
                <p className="text-xs text-slate-500">
                  Apto {selectedTurnForReturn.apto} • {selectedTurnForReturn.responsavel}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Item retirado:</strong> {selectedTurnForReturn.mesa}</p>
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
                  <span>Houve avaria ou não conformidade no item devolvido?</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Observações / Estado do item devolvido {hasNonConformity && <span className="text-amber-600 font-bold">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    hasNonConformity
                      ? 'Descreva a avaria ou peças faltantes (ex: taco trincado, peça de xadrez faltando...)'
                      : 'Ex: Todos os itens devolvidos em perfeito estado.'
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


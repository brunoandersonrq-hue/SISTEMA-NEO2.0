import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Car,
  User,
  RotateCcw,
  ArrowUpDown,
  Download,
  Plus,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { Reservation, ReservationStatus, FilterOptions } from '../types.ts';
import {
  formatDateBR,
  calculateNights,
  isReservationOverlapping,
  formatBrasiliaDateTime,
  getBrasiliaTodayDate,
  getBrasiliaTodayDateFormatted,
  getBrasiliaFutureDate
} from '../utils/formatters.ts';
import { exportReservationsToExcelXML, exportReservationsToCSV } from '../utils/exportExcel.ts';
import { PrintPreviewModal } from './PrintPreviewModal.tsx';

interface ReservationHistoryProps {
  reservations: Reservation[];
  onEditReservation: (reservation: Reservation) => void;
  onViewVoucher: (reservation: Reservation) => void;
  onDeleteReservation: (id: string) => void;
  onStatusChange: (id: string, newStatus: ReservationStatus) => void;
  onNewReservation: () => void;
}

export const ReservationHistory: React.FC<ReservationHistoryProps> = ({
  reservations,
  onEditReservation,
  onViewVoucher,
  onDeleteReservation,
  onStatusChange,
  onNewReservation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'todos'>('todos');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortField, setSortField] = useState<'entrada' | 'apto' | 'nomeResponsavel'>('entrada');
  const [sortAsc, setSortAsc] = useState(false); // Default most recent first
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const todayIso = useMemo(() => getBrasiliaTodayDate(), []);
  const todayFormatted = useMemo(() => getBrasiliaTodayDateFormatted(), []);
  const next7DaysIso = useMemo(() => getBrasiliaFutureDate(7), []);

  // Quick preset period handlers
  const handlePreset = (preset: 'all' | 'today' | 'this_month' | 'next_month' | 'next_7_days') => {
    switch (preset) {
      case 'all':
        setDateStart('');
        setDateEnd('');
        break;
      case 'today':
        setDateStart(todayIso);
        setDateEnd(todayIso);
        break;
      case 'this_month': {
        const [y, m] = todayIso.split('-');
        const lastDay = new Date(Number(y), Number(m), 0).getDate();
        setDateStart(`${y}-${m}-01`);
        setDateEnd(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
        break;
      }
      case 'next_month': {
        const [y, m] = todayIso.split('-');
        const nextMonthDate = new Date(Number(y), Number(m), 1);
        const ny = nextMonthDate.getFullYear();
        const nm = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(ny, nextMonthDate.getMonth() + 1, 0).getDate();
        setDateStart(`${ny}-${nm}-01`);
        setDateEnd(`${ny}-${nm}-${String(lastDay).padStart(2, '0')}`);
        break;
      }
      case 'next_7_days':
        setDateStart(todayIso);
        setDateEnd(next7DaysIso);
        break;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setDateStart('');
    setDateEnd('');
  };

  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  const handleExportExcel = () => {
    exportReservationsToExcelXML(filteredReservations);
  };

  const handleExportCSV = () => {
    exportReservationsToCSV(filteredReservations);
  };

  const hasActiveFilters = Boolean(
    searchTerm || statusFilter !== 'todos' || dateStart || dateEnd
  );

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations
      .filter((res) => {
        // Status filter
        if (statusFilter !== 'todos' && res.status !== statusFilter) {
          return false;
        }

        // Period filter (stay range overlap)
        if (!isReservationOverlapping(res.entrada, res.saida, dateStart, dateEnd)) {
          return false;
        }

        // Text search
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = res.nomeResponsavel.toLowerCase().includes(query);
          const matchApto = res.apto.toLowerCase().includes(query);
          const matchCpf = res.cpf.toLowerCase().includes(query);
          const matchEmail = res.email.toLowerCase().includes(query);
          const matchPlaca1 = res.placaCarro1.toLowerCase().includes(query);
          const matchPlaca2 = res.placaCarro2.toLowerCase().includes(query);
          const matchLocador = res.locador.toLowerCase().includes(query);
          const matchRecep = res.recepcionista.toLowerCase().includes(query);
          return (
            matchName ||
            matchApto ||
            matchCpf ||
            matchEmail ||
            matchPlaca1 ||
            matchPlaca2 ||
            matchLocador ||
            matchRecep
          );
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortAsc) {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
  }, [reservations, statusFilter, dateStart, dateEnd, searchTerm, sortField, sortAsc]);

  const toggleSort = (field: 'entrada' | 'apto' | 'nomeResponsavel') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'ativa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Ativa (Check-in)
          </span>
        );
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Confirmada
          </span>
        );
      case 'concluida':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Concluída
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Cancelada
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filters Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="input-search-history"
              placeholder="Buscar por hóspede, apartamento, CPF, placa de veículo, locador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* New Reservation Action */}
          <button
            type="button"
            onClick={onNewReservation}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-800 hover:bg-blue-900 text-white transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reserva</span>
          </button>
        </div>

        {/* Filter Controls Row: Status & Período de Estadia */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Status Filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">Status:</label>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'todos')}
              className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="todos">Todos os Status ({reservations.length})</option>
              <option value="confirmada">Confirmada</option>
              <option value="ativa">Ativa (Em Estadia / Check-in)</option>
              <option value="concluida">Concluída (Check-out)</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Stay Period (Data Início & Data Fim) */}
          <div className="md:col-span-6 flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <label className="text-xs font-bold text-slate-700 shrink-0">Período de Estadia:</label>
            <div className="flex items-center gap-1.5 w-full">
              <input
                type="date"
                id="input-filter-date-start"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                title="Data inicial da estadia"
              />
              <span className="text-xs text-slate-400">até</span>
              <input
                type="date"
                id="input-filter-date-end"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                title="Data final da estadia"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-2 flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                id="btn-reset-filters"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Period Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Atalhos:</span>
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              !dateStart && !dateEnd
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas as Datas
          </button>
          <button
            type="button"
            onClick={() => handlePreset('today')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              dateStart === todayIso && dateEnd === todayIso
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hoje ({todayFormatted})
          </button>
          <button
            type="button"
            onClick={() => handlePreset('this_month')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              dateStart.endsWith('-01') && dateEnd.includes('-09-')
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Setembro / 2026
          </button>
          <button
            type="button"
            onClick={() => handlePreset('next_month')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              dateStart.endsWith('-01') && dateEnd.includes('-10-')
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Outubro / 2026
          </button>
          <button
            type="button"
            onClick={() => handlePreset('next_7_days')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              dateStart === todayIso && dateEnd === next7DaysIso
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Próximos 7 dias
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="print-only mb-5 pb-3 border-b-2 border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Relatório de Histórico de Reservas de Hóspedes
            </h1>
            <p className="text-xs text-slate-600">
              Controle de Hóspedes, Apartamentos e Veículos • Recepção & Portaria
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>
              <strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às{' '}
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div>
              <strong>Total listado:</strong> {filteredReservations.length} reservas
            </div>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-slate-100 rounded text-[11px] text-slate-700 flex flex-wrap gap-4 border border-slate-300">
          <div>
            <strong>Status:</strong>{' '}
            <span className="capitalize">
              {statusFilter === 'todos' ? 'Todos os Status' : statusFilter}
            </span>
          </div>
          <div>
            <strong>Período de Estadia:</strong>{' '}
            {dateStart ? formatDateBR(dateStart) : 'Desde o início'} até{' '}
            {dateEnd ? formatDateBR(dateEnd) : 'Sem limite'}
          </div>
          {searchTerm && (
            <div>
              <strong>Termo de busca:</strong> "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Results Header & Actions Bar (No print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 gap-3 no-print">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600">
            Mostrando <span className="font-bold text-slate-900">{filteredReservations.length}</span> de{' '}
            <span className="font-bold text-slate-900">{reservations.length}</span> reservas no histórico
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Filtros aplicados
            </span>
          )}
        </div>

        {/* Action Buttons: Impressão e Exportar para Excel */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botão para Impressão */}
          <button
            type="button"
            id="btn-print-history"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Imprimir relatório do histórico de reservas formatado"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir Relatório</span>
          </button>

          {/* Botão para Exportar para Excel */}
          <div className="inline-flex rounded-lg shadow-2xs overflow-hidden border border-emerald-700">
            <button
              type="button"
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
              title="Exportar registros filtrados para planilha Excel (.xls com formatação de cores e colunas)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar para Excel</span>
            </button>
            <button
              type="button"
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="px-2 py-1.5 text-[11px] font-bold bg-emerald-800 hover:bg-emerald-900 text-emerald-100 border-l border-emerald-600 transition-colors cursor-pointer"
              title="Exportar como arquivo CSV padrão (delimitador ponto e vírgula, compatível com Excel e Google Sheets)"
            >
              .CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Nenhuma reserva encontrada</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Não encontramos nenhuma reserva com os filtros aplicados. Tente ajustar o período ou o status selecionado.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors"
            >
              Ver Todas as Reservas
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                <tr>
                  <th className="py-3.5 px-4">Status</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-900"
                    onClick={() => toggleSort('apto')}
                  >
                    <div className="flex items-center gap-1">
                      <span>APTO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-900"
                    onClick={() => toggleSort('nomeResponsavel')}
                  >
                    <div className="flex items-center gap-1">
                      <span>HÓSPEDE (RESPONSÁVEL)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-900"
                    onClick={() => toggleSort('entrada')}
                  >
                    <div className="flex items-center gap-1">
                      <span>ESTADIA (ENTRADA / SAÍDA)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">VEÍCULOS</th>
                  <th className="py-3.5 px-4">RECEPCIONISTA / LOCADOR</th>
                  <th className="py-3.5 px-4 text-center font-black text-blue-950 no-print">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReservations.map((res) => {
                  const nights = calculateNights(res.entrada, res.saida);
                  const isCurrentActive = res.status === 'ativa';

                  return (
                    <tr
                      key={res.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isCurrentActive ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(res.status)}
                        </div>
                      </td>

                      {/* APTO */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-black text-sm text-blue-950 px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                          {res.apto}
                        </span>
                      </td>

                      {/* Hóspede */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 max-w-[220px]">
                          <div className="font-bold text-slate-900 truncate" title={res.nomeResponsavel}>
                            {res.nomeResponsavel}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            CPF: {res.cpf || 'Não informado'}
                          </div>
                          {res.telefone && (
                            <div className="text-[11px] text-slate-600">{res.telefone}</div>
                          )}
                          {res.acompanhantes && (
                            <div className="text-[10px] text-slate-400 italic truncate" title={res.acompanhantes}>
                              + {res.acompanhantes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Período de Estadia & Horários */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">
                            {formatDateBR(res.entrada)}{' '}
                            <span className="text-slate-400 font-normal">até</span>{' '}
                            {formatDateBR(res.saida)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {nights} {nights === 1 ? 'diária' : 'diárias'}
                          </div>
                          {res.dataHoraCheckIn && (
                            <div
                              className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5"
                              title={`Horário de Check-in: ${formatBrasiliaDateTime(res.dataHoraCheckIn, true)}`}
                            >
                              <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Check-in: {formatBrasiliaDateTime(res.dataHoraCheckIn, false)}</span>
                            </div>
                          )}
                          {res.dataHoraCheckOut && (
                            <div
                              className="text-[10px] text-amber-800 font-medium flex items-center gap-1"
                              title={`Horário de Check-out: ${formatBrasiliaDateTime(res.dataHoraCheckOut, true)}`}
                            >
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Check-out: {formatBrasiliaDateTime(res.dataHoraCheckOut, false)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Veículos */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[11px]">
                          {res.placaCarro1 ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                {res.placaCarro1}
                              </span>
                              <span className="truncate max-w-[120px] text-slate-600">{res.modeloCarro1}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sem veículo cadastrado</span>
                          )}

                          {res.placaCarro2 && (
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                {res.placaCarro2}
                              </span>
                              <span className="truncate max-w-[120px] text-slate-600">{res.modeloCarro2}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Recepcionista & Locador */}
                      <td className="py-4 px-4 text-[11px]">
                        <div className="space-y-0.5">
                          <div className="text-slate-800">
                            <span className="text-slate-400">Recep:</span>{' '}
                            <span className="font-medium">{res.recepcionista || '-'}</span>
                          </div>
                          <div className="text-slate-700">
                            <span className="text-slate-400">Locador:</span>{' '}
                            <span className="font-medium truncate max-w-[140px] inline-block align-bottom" title={res.locador}>
                              {res.locador || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* AÇÕES COM BOTÃO EDITAR EM DESTAQUE */}
                      <td className="py-4 px-4 whitespace-nowrap text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* BOTÃO EDITAR (Requisito explícito: "coloque a função de editar nos historicos de reservas") */}
                          <button
                            type="button"
                            id={`btn-edit-${res.id}`}
                            onClick={() => onEditReservation(res)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Editar todos os dados da reserva"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* Visualizar Ficha / Imprimir */}
                          <button
                            type="button"
                            id={`btn-voucher-${res.id}`}
                            onClick={() => onViewVoucher(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                            title="Visualizar ficha de hóspede e veículos"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Ficha</span>
                          </button>

                          {/* Excluir Reserva */}
                          <button
                            type="button"
                            id={`btn-delete-${res.id}`}
                            onClick={() => {
                              if (window.confirm(`Deseja realmente excluir a reserva de ${res.nomeResponsavel} (Apto ${res.apto})?`)) {
                                onDeleteReservation(res.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Excluir reserva do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Report Footer (Visible only when printing) */}
      <div className="print-only mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-600 flex justify-between items-center">
        <div>
          <span>Relatório extraído do Sistema de Controle de Reservas de Hóspedes</span>
        </div>
        <div className="flex gap-8">
          <div>Assinatura Recepcionista: __________________________</div>
          <div>Visto Administração: __________________________</div>
        </div>
      </div>

      {/* Modal de Pré-visualização para Confirmação de Impressão */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        reservations={filteredReservations}
        statusFilter={statusFilter}
        dateStart={dateStart}
        dateEnd={dateEnd}
        searchTerm={searchTerm}
      />
    </div>
  );
};

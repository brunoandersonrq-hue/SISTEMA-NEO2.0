import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  Car,
  LogIn,
  Search,
  CheckCircle2,
  Building2,
  Info,
  Layers,
  Sparkles,
  Phone
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types.ts';
import { formatDateBR, calculateNights, getBrasiliaTodayDate } from '../utils/formatters.ts';

interface OccupancyBoardProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
  onEditReservation: (reservation: Reservation) => void;
  onStatusChange: (id: string, newStatus: ReservationStatus) => void;
  onNewReservation: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const OccupancyBoard: React.FC<OccupancyBoardProps> = ({
  reservations,
  onSelectReservation,
  onEditReservation,
  onStatusChange,
  onNewReservation
}) => {
  // Padrão: Setembro de 2026 (mês de referência do sistema)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 21));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('todos');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date(2026, 8, 21));
  };

  // Número de dias no mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Array de dias do mês (linha superior)
  const monthDays = useMemo(() => {
    const todayStr = getBrasiliaTodayDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push({
        dayNumber: day,
        dayOfWeekName: WEEKDAY_NAMES[dayOfWeek],
        dateStr,
        isToday,
        isWeekend
      });
    }
    return days;
  }, [year, month, daysInMonth]);

  const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // REGRA CRÍTICA DO USUÁRIO:
  // "mostrar uma barra cronograma nos apartamentos que estão ocupados desde o check-in até o check-out.
  // quando confirmado o status de check-out, remover o apartamento desse quadro de visualização"
  // Portanto:
  // 1. Filtrar apenas reservas que se sobrepõem ao mês selecionado
  // 2. EXCLUIR estritamente reservas com status 'concluida' (check-out realizado)
  // 3. EXCLUIR reservas canceladas
  const activeOccupancy = useMemo(() => {
    return reservations.filter((r) => {
      // Exclui canceladas
      if (r.status === 'cancelada') return false;

      // EXCLUI CHECK-OUT CONFIRMADO (REMOVER DO QUADRO CONFORME SOLICITADO)
      if (r.status === 'concluida') return false;

      // Verifica se a reserva tem intersecção com o mês selecionado
      const startsBeforeMonthEnd = r.entrada <= monthEndStr;
      const endsAfterMonthStart = r.saida >= monthStartStr;
      return startsBeforeMonthEnd && endsAfterMonthStart;
    });
  }, [reservations, monthStartStr, monthEndStr]);

  // Agrupar reservas ativas por apartamento
  const apartmentsWithOccupancy = useMemo(() => {
    const map = new Map<string, Reservation[]>();

    activeOccupancy.forEach((res) => {
      const aptoKey = res.apto.trim();
      if (!map.has(aptoKey)) {
        map.set(aptoKey, []);
      }
      map.get(aptoKey)!.push(res);
    });

    // Converter para array e ordenar numericamente os apartamentos (ex: 101, 102, 201...)
    let aptosList = Array.from(map.entries()).map(([apto, resList]) => ({
      apto,
      floor: apto.length >= 3 ? `${apto.charAt(0)}º Andar` : 'Térreo',
      floorNum: apto.charAt(0),
      reservations: resList.sort((a, b) => a.entrada.localeCompare(b.entrada))
    }));

    // Ordenação numérica dos apartamentos
    aptosList.sort((a, b) => {
      const numA = parseInt(a.apto, 10);
      const numB = parseInt(b.apto, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.apto.localeCompare(b.apto);
    });

    // Filtro por andar
    if (selectedFloor !== 'todos') {
      aptosList = aptosList.filter((item) => item.floorNum === selectedFloor);
    }

    // Filtro por termo de busca (apto ou hóspede)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      aptosList = aptosList.filter(
        (item) =>
          item.apto.toLowerCase().includes(term) ||
          item.reservations.some(
            (r) =>
              r.nomeResponsavel.toLowerCase().includes(term) ||
              r.telefone.includes(term) ||
              r.placaCarro1.toLowerCase().includes(term)
          )
      );
    }

    return aptosList;
  }, [activeOccupancy, selectedFloor, searchTerm]);

  // Calcular posição e largura da barra cronograma no grid de dias do mês
  const calculateBarPosition = (res: Reservation) => {
    // Data de início da barra (check-in efetivo ou data de entrada)
    const startDateStr = res.dataHoraCheckIn ? res.dataHoraCheckIn.split('T')[0] : res.entrada;
    // Data de término da barra (check-out ou data de saída prevista)
    const endDateStr = res.dataHoraCheckOut ? res.dataHoraCheckOut.split('T')[0] : res.saida;

    const [sYear, sMonth, sDay] = startDateStr.split('-').map(Number);
    const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);

    // Determinar início dentro deste mês
    let startDay = 1;
    if (sYear === year && sMonth === month + 1) {
      startDay = Math.max(1, sDay);
    } else if (startDateStr > monthStartStr) {
      startDay = 1;
    }

    // Determinar término dentro deste mês
    let endDay = daysInMonth;
    if (eYear === year && eMonth === month + 1) {
      endDay = Math.min(daysInMonth, eDay);
    } else if (endDateStr < monthEndStr) {
      endDay = daysInMonth;
    }

    // A barra ocupa do dia startDay até o dia endDay
    // Grid columns: 1 a daysInMonth (cada dia é 1 coluna de 40px)
    const colStart = Math.max(1, Math.min(daysInMonth, startDay));
    const colEnd = Math.max(colStart, Math.min(daysInMonth, endDay));
    const span = Math.max(1, colEnd - colStart + 1);

    return {
      colStart,
      colEnd,
      span,
      originalStart: startDateStr,
      originalEnd: endDateStr,
      startsBeforeMonth: startDateStr < monthStartStr,
      endsAfterMonth: endDateStr > monthEndStr
    };
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Mês Navegação */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                id="btn-prev-month-occ"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-blue-900 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-current-month-occ"
                onClick={handleCurrentMonth}
                className="px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-white text-slate-700 hover:text-blue-900 transition-colors cursor-pointer"
              >
                Hoje (Set/2026)
              </button>
              <button
                type="button"
                id="btn-next-month-occ"
                onClick={handleNextMonth}
                className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-blue-900 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {MONTH_NAMES[month]} de {year}
              </h2>
            </div>
          </div>

          {/* Filtros e Notificação de Regra */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Busca */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-occupancy-apto"
                placeholder="Buscar apto ou hóspede..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Filtro por Andar */}
            <select
              id="filter-occupancy-floor"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium text-slate-700"
            >
              <option value="todos">Todos os Andares</option>
              <option value="1">1º Andar</option>
              <option value="2">2º Andar</option>
              <option value="3">3º Andar</option>
              <option value="4">4º Andar</option>
              <option value="5">5º Andar</option>
              <option value="6">6º Andar</option>
              <option value="7">7º Andar</option>
              <option value="8">8º Andar</option>
            </select>
          </div>
        </div>

        {/* Banner Informativo da Regra de Check-out */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Regra de Check-out Ativa:</strong> Quando o check-out é confirmado, o apartamento é removido automaticamente deste quadro.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span>
              <span>Check-in Realizado (Em Estadia)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
              <span>Confirmada (Aguardando)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Occupancy Matrix Table */}
      {apartmentsWithOccupancy.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Nenhum apartamento ocupado no momento para {MONTH_NAMES[month]} de {year}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Todos os check-outs foram concluídos ou não há reservas com estadia ativa no período selecionado.
          </p>
          <button
            type="button"
            onClick={onNewReservation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-800 hover:bg-blue-900 text-white transition-colors cursor-pointer"
          >
            Cadastrar Nova Reserva
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Container com scroll horizontal fluido */}
          <div className="overflow-x-auto">
            <div
              className="min-w-max"
              style={{
                display: 'grid',
                gridTemplateColumns: `240px repeat(${daysInMonth}, minmax(38px, 1fr))`
              }}
            >
              {/* Top-Left Corner Header Cell */}
              <div className="sticky left-0 z-30 bg-slate-100 border-b border-r border-slate-200 px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <Building2 className="w-3.5 h-3.5 text-blue-800" />
                  <span>APARTAMENTO</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {apartmentsWithOccupancy.length} ocupados
                </span>
              </div>

              {/* Top Row: Dias do Mês Selecionado (Linha Superior) */}
              {monthDays.map((day) => (
                <div
                  key={day.dateStr}
                  className={`border-b border-r border-slate-200 px-1 py-1.5 text-center select-none transition-colors ${
                    day.isToday
                      ? 'bg-blue-100/90 text-blue-950 font-bold ring-1 ring-inset ring-blue-400'
                      : day.isWeekend
                      ? 'bg-slate-50/80 text-slate-600'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-[10px] uppercase font-semibold leading-tight text-slate-500">
                    {day.dayOfWeekName}
                  </span>
                  <span
                    className={`inline-block text-xs font-bold mt-0.5 ${
                      day.isToday
                        ? 'w-5 h-5 leading-5 rounded-full bg-blue-700 text-white mx-auto shadow-xs'
                        : ''
                    }`}
                  >
                    {String(day.dayNumber).padStart(2, '0')}
                  </span>
                </div>
              ))}

              {/* Rows for each occupied apartment */}
              {apartmentsWithOccupancy.map(({ apto, floor, reservations: aptoReservations }) => (
                <React.Fragment key={`row-apto-${apto}`}>
                  {/* Sticky Apartment Identification Column */}
                  <div className="sticky left-0 z-20 bg-white border-b border-r border-slate-200 px-3 py-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {apto}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]" title={aptoReservations[0]?.nomeResponsavel}>
                          {aptoReservations[0]?.nomeResponsavel}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        aptoReservations[0]?.status === 'ativa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {aptoReservations[0]?.status === 'ativa' ? 'Check-in OK' : 'Confirmado'}
                    </span>
                  </div>

                  {/* Day Grid Cells & Chronogram Timeline Bar */}
                  <div
                    className="relative border-b border-slate-200 bg-white"
                    style={{
                      gridColumn: `2 / span ${daysInMonth}`,
                      display: 'grid',
                      gridTemplateColumns: `repeat(${daysInMonth}, minmax(38px, 1fr))`,
                      minHeight: '62px'
                    }}
                  >
                    {/* Background Day Cell Grid Guidelines */}
                    {monthDays.map((d) => (
                      <div
                        key={`cell-${apto}-${d.dateStr}`}
                        className={`border-r border-slate-100 h-full ${
                          d.isToday ? 'bg-blue-50/20' : d.isWeekend ? 'bg-slate-50/40' : ''
                        }`}
                      />
                    ))}

                    {/* Timeline Bars for this Apartment */}
                    {aptoReservations.map((res) => {
                      const pos = calculateBarPosition(res);
                      const isCheckedIn = res.status === 'ativa';
                      const nights = calculateNights(res.entrada, res.saida);

                      return (
                        <div
                          key={`bar-${res.id}`}
                          id={`timeline-bar-${res.id}`}
                          style={{
                            gridColumnStart: pos.colStart,
                            gridColumnEnd: `span ${pos.span}`,
                            zIndex: 10
                          }}
                          className="my-1.5 mx-0.5 self-center group relative cursor-pointer"
                          onClick={() => onSelectReservation(res)}
                        >
                          {/* Visual Cronograma Bar */}
                          <div
                            className={`h-10 rounded-lg p-1.5 flex items-center justify-between text-white shadow-xs transition-all duration-150 group-hover:shadow-md group-hover:scale-[1.01] ${
                              isCheckedIn
                                ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 ring-1 ring-emerald-500/50'
                                : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 ring-1 ring-blue-500/50'
                            }`}
                          >
                            {/* Left: Guest Name & Times */}
                            <div className="flex items-center gap-1.5 min-w-0 pr-1">
                              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                {isCheckedIn ? (
                                  <LogIn className="w-3 h-3 text-white" />
                                ) : (
                                  <User className="w-3 h-3 text-white" />
                                )}
                              </div>

                              <div className="truncate">
                                <div className="text-[11px] font-bold leading-tight truncate">
                                  {res.nomeResponsavel}
                                </div>
                                <div className="text-[9px] text-white/80 font-medium flex items-center gap-1">
                                  <span>{formatDateBR(res.entrada)} a {formatDateBR(res.saida)}</span>
                                  <span>({nights}d)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

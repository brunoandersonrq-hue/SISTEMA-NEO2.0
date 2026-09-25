import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  LogIn,
  LogOut,
  User,
  Clock,
  Eye,
  Edit
} from 'lucide-react';
import { Reservation } from '../types.ts';
import { formatDateBR, getBrasiliaTodayDate } from '../utils/formatters.ts';

interface MonthlyCalendarProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
  onEditReservation: (reservation: Reservation) => void;
  onNewReservationOnDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  reservations,
  onSelectReservation,
  onEditReservation,
  onNewReservationOnDate
}) => {
  // Default to September 2026 matching current reference context
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 21)); // 8 is September (0-indexed)
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 21));
  };

  // Generate days for the monthly view
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = getBrasiliaTodayDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month filler days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarDays.push({
      dayNumber: day,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      dateStr: dStr,
      isCurrentMonth: true,
      isToday: dStr === todayStr
    });
  }

  // Next month filler days to complete 35 or 42 grid cells
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    calendarDays.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr
    });
  }

  // Filter reservations in this month
  const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const monthReservations = reservations.filter((r) => {
    return r.entrada <= monthEndStr && r.saida >= monthStartStr;
  });

  const checkInsThisMonth = monthReservations.filter((r) => r.entrada.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const checkOutsThisMonth = monthReservations.filter((r) => r.saida.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const activeNow = reservations.filter((r) => r.status === 'ativa').length;

  const getReservationsForDate = (dateStr: string) => {
    return reservations.filter((r) => {
      // Reservation occupies the day if dateStr is between entrada and saida
      return dateStr >= r.entrada && dateStr <= r.saida;
    });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100';
      case 'confirmada':
        return 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100';
      case 'concluida':
        return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      case 'cancelada':
        return 'bg-red-50 text-red-700 border-red-200 line-through opacity-70';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const selectedDayReservations = selectedDayDetail ? getReservationsForDate(selectedDayDetail) : [];

  return (
    <div className="space-y-5">
      {/* Month Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reservas no Mês</div>
          <div className="text-xl font-black text-blue-950 mt-1">{monthReservations.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{MONTH_NAMES[month]} / {year}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check-ins Previstos</div>
          <div className="text-xl font-black text-blue-800 mt-1">{checkInsThisMonth.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">entradas programadas</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Check-outs Previstos</div>
          <div className="text-xl font-black text-slate-800 mt-1">{checkOutsThisMonth.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">saídas programadas</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hóspedes Ativos Hoje</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{activeNow}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">em estadia confirmada</div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Calendar Top Navigation Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {MONTH_NAMES[month]} <span className="font-semibold text-slate-500">{year}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Visão mensal de ocupação de apartamentos e estadias
              </p>
            </div>
          </div>

          {/* Month Controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="btn-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-today"
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hoje
            </button>

            <button
              type="button"
              id="btn-next-month"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
          {WEEKDAY_NAMES.map((name, idx) => (
            <div
              key={name}
              className={`py-2.5 text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-blue-900' : 'text-slate-600'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* 7-column Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarDays.map((calDay) => {
            const dayReservations = getReservationsForDate(calDay.dateStr);
            const hasCheckIn = dayReservations.some((r) => r.entrada === calDay.dateStr);
            const hasCheckOut = dayReservations.some((r) => r.saida === calDay.dateStr);

            return (
              <div
                key={calDay.dateStr}
                onClick={() => setSelectedDayDetail(calDay.dateStr)}
                className={`min-h-[112px] p-2 flex flex-col justify-between transition-colors relative cursor-pointer group ${
                  calDay.isCurrentMonth ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/60 text-slate-400'
                } ${calDay.isToday ? 'ring-2 ring-blue-700 ring-inset bg-blue-50/20' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        calDay.isToday
                          ? 'bg-blue-800 text-white'
                          : calDay.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {calDay.dayNumber}
                    </span>
                    {calDay.isToday && (
                      <span className="hidden xl:inline-block text-[9px] font-bold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-sm">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Flow Icons (Check-in / Check-out badges) */}
                  <div className="flex items-center gap-1">
                    {hasCheckIn && (
                      <span title="Entrada / Check-in neste dia" className="text-blue-700">
                        <LogIn className="w-3 h-3" />
                      </span>
                    )}
                    {hasCheckOut && (
                      <span title="Saída / Check-out neste dia" className="text-amber-600">
                        <LogOut className="w-3 h-3" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewReservationOnDate(calDay.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-700 p-0.5 rounded transition-opacity"
                      title={`Nova reserva para ${formatDateBR(calDay.dateStr)}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Day Bookings Chips */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayReservations.slice(0, 3).map((res) => {
                    const isArrival = res.entrada === calDay.dateStr;
                    const isDeparture = res.saida === calDay.dateStr;

                    return (
                      <div
                        key={res.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(res);
                        }}
                        className={`text-[10px] px-1.5 py-0.8 rounded-md border flex items-center justify-between font-medium truncate transition-all shadow-2xs ${getStatusColorClass(
                          res.status
                        )}`}
                        title={`Apto ${res.apto} - ${res.nomeResponsavel} (${formatDateBR(res.entrada)} a ${formatDateBR(res.saida)})`}
                      >
                        <span className="truncate font-bold text-[10px]">
                          {res.apto} <span className="font-normal opacity-90">• {res.nomeResponsavel.split(' ')[0]}</span>
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0 ml-1">
                          {isArrival && <span className="text-[8px] font-bold text-blue-700">ENT</span>}
                          {isDeparture && <span className="text-[8px] font-bold text-amber-700">SAI</span>}
                        </div>
                      </div>
                    );
                  })}

                  {dayReservations.length > 3 && (
                    <div className="text-[9px] font-semibold text-blue-700 text-center py-0.5 bg-blue-50/70 rounded border border-blue-200">
                      +{dayReservations.length - 3} hóspedes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Footer Legend */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-slate-700">Legenda de Status:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Confirmada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Ativa (Check-in)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span>Concluída (Check-out)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Cancelada</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <LogIn className="w-3 h-3 text-blue-700" /> Entrada
            </span>
            <span className="inline-flex items-center gap-1">
              <LogOut className="w-3 h-3 text-amber-600" /> Saída
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day Quick Details Drawer/Modal */}
      {selectedDayDetail && (
        <div className="bg-white rounded-2xl border border-blue-900/30 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-800" />
                <span>Ocupação em {formatDateBR(selectedDayDetail)}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedDayReservations.length === 0
                  ? 'Nenhuma reserva ativa nesta data.'
                  : `${selectedDayReservations.length} apartamento(s) ocupado(s) neste dia`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onNewReservationOnDate(selectedDayDetail)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Reserva para {formatDateBR(selectedDayDetail)}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded"
              >
                Fechar
              </button>
            </div>
          </div>

          {selectedDayReservations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDayReservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-blue-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Apto {res.apto}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          res.status === 'ativa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'confirmada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{res.nomeResponsavel}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Estadia: {formatDateBR(res.entrada)} a {formatDateBR(res.saida)}
                    </div>
                    {res.placaCarro1 && (
                      <div className="text-[11px] text-slate-600 font-mono mt-1">
                        Veículo: {res.modeloCarro1} ({res.placaCarro1})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => onSelectReservation(res)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditReservation(res)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

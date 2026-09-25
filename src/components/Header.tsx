import React from 'react';
import { Calendar, History, PlusCircle, BarChart3, Percent, Menu } from 'lucide-react';

export type ViewMode = 'calendar' | 'occupancy' | 'history';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewReservation: () => void;
  occupiedCount: number;
  totalBuildingAptos?: number;
  occupancyRate: string | number;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onNewReservation,
  occupiedCount,
  totalBuildingAptos = 124,
  occupancyRate,
  onToggleMobileSidebar
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3.5">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Controle de Reservas
            </h1>
          </div>

          {/* Taxa de Ocupação Geral & Quantidade de Aptos Ocupados */}
          <div
            id="header-occupancy-stats"
            className="hidden md:flex items-center space-x-4 text-xs bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            {/* Quantidade de Aptos Ocupados */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-slate-900 text-sm">{occupiedCount}</span>
                <span className="text-slate-500 text-xs font-medium">/{totalBuildingAptos}</span>
              </div>
              <span className="text-slate-600 font-medium">aptos ocupados</span>
            </div>

            <span className="text-slate-300">|</span>

            {/* Taxa de Ocupação Geral */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Percent className="w-3.5 h-3.5 text-blue-700" />
                <span>Taxa de Ocupação Geral:</span>
              </div>
              <span className="font-bold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md text-xs">
                {occupancyRate}%
              </span>
            </div>
          </div>

          {/* View Switcher & Action Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* View Selector Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                id="btn-view-calendar"
                onClick={() => onViewChange('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  currentView === 'calendar'
                    ? 'bg-white text-blue-950 font-bold shadow-xs ring-1 ring-blue-950/10'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${currentView === 'calendar' ? 'text-blue-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>Visualização Mensal</span>
              </button>

              <button
                type="button"
                id="btn-view-occupancy"
                onClick={() => onViewChange('occupancy')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  currentView === 'occupancy'
                    ? 'bg-white text-blue-950 font-bold shadow-xs ring-1 ring-blue-950/10'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${currentView === 'occupancy' ? 'text-blue-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>Quadro de Ocupação</span>
              </button>

              <button
                type="button"
                id="btn-view-history"
                onClick={() => onViewChange('history')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  currentView === 'history'
                    ? 'bg-white text-blue-950 font-bold shadow-xs ring-1 ring-blue-950/10'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className={`w-3.5 h-3.5 ${currentView === 'history' ? 'text-blue-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>Histórico de Reservas</span>
              </button>
            </div>

            {/* New Reservation Button */}
            <button
              type="button"
              id="btn-new-reservation"
              onClick={onNewReservation}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-800 hover:bg-blue-900 text-white shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Reserva</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

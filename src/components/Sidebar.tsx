import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Sparkles,
  Gamepad2,
  Dumbbell,
  Flame,
  Package,
  BookOpen,
  Users,
  X,
  Building2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { SystemModule } from '../types.ts';

interface SidebarProps {
  activeModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeGuestsCount: number;
  pendingPackagesCount: number;
  pendingIncidentsCount: number;
  totalBuildingAptos?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  activeGuestsCount,
  pendingPackagesCount,
  pendingIncidentsCount,
  totalBuildingAptos = 124
}) => {
  const menuItems: {
    id: SystemModule;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: { text: string; color: string };
  }[] = [
    {
      id: 'inicio',
      label: 'Início',
      description: 'Painel Geral & Visão Executiva',
      icon: LayoutDashboard
    },
    {
      id: 'hospedagem',
      label: 'Controle de Hospedagem',
      description: 'Calendário, Mapa & Reservas',
      icon: BedDouble,
      badge: activeGuestsCount > 0 ? { text: `${activeGuestsCount} ativo${activeGuestsCount > 1 ? 's' : ''}`, color: 'bg-emerald-500 text-white' } : undefined
    },
    {
      id: 'camareiras',
      label: 'Controle de Camareiras',
      description: 'Escala Semanal & 3 Camareiras',
      icon: Sparkles,
      badge: { text: '3 Camareiras', color: 'bg-amber-400 text-slate-900 font-bold' }
    },
    {
      id: 'jogos',
      label: 'Sala de Jogos',
      description: 'Agendamentos e Normas',
      icon: Gamepad2
    },
    {
      id: 'academia',
      label: 'Sala Academia',
      description: 'Lotação e Acesso',
      icon: Dumbbell
    },
    {
      id: 'churrasqueira',
      label: 'Salão & Churrasqueira',
      description: 'Reserva de Espaços Comuns',
      icon: Flame
    },
    {
      id: 'encomendas',
      label: 'Controle de Encomendas',
      description: 'Portaria & Entregas',
      icon: Package,
      badge: pendingPackagesCount > 0 ? { text: `${pendingPackagesCount} pendente${pendingPackagesCount > 1 ? 's' : ''}`, color: 'bg-amber-500 text-slate-950 font-bold' } : undefined
    },
    {
      id: 'ocorrencias',
      label: 'Livro de Ocorrências',
      description: 'Registros da Portaria',
      icon: BookOpen,
      badge: pendingIncidentsCount > 0 ? { text: `${pendingIncidentsCount}`, color: 'bg-rose-500 text-white' } : undefined
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      description: 'Aptos, Moradores & Veículos',
      icon: Users
    }
  ];

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-xl lg:shadow-none shrink-0 select-none`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Branding Section with Uploaded Image (NEO 2.0) */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between">
              {/* Image in attachment placed in the top left */}
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-700 flex items-center justify-center">
                  <img
                    id="sidebar-neo-logo"
                    src="/neo_logo.svg"
                    alt="NEO 2.0"
                    className="h-9 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>NEO 2.0</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Gestão Condominial</p>
                </div>
              </div>

              {/* Close Button on Mobile */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{totalBuildingAptos} Apartamentos</span>
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sistema Online</span>
              </span>
            </div>
          </div>

          {/* Navigation Buttons List */}
          <nav className="p-3 space-y-1.5 flex-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Módulos do Sistema
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 shrink-0 ${item.badge.color}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

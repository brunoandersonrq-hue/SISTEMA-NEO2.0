import React from 'react';
import {
  BedDouble,
  Sparkles,
  Gamepad2,
  Dumbbell,
  Flame,
  Package,
  BookOpen,
  Users,
  ArrowRight,
  Percent
} from 'lucide-react';
import { SystemModule, Reservation, PackageDelivery, IncidentRecord, AmenityReservation } from '../types.ts';

interface HomeDashboardProps {
  onNavigate: (module: SystemModule) => void;
  reservations: Reservation[];
  packages: PackageDelivery[];
  incidents: IncidentRecord[];
  amenities: AmenityReservation[];
  totalBuildingAptos: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  reservations,
  packages,
  incidents,
  amenities,
  totalBuildingAptos
}) => {
  // Calculations
  const activeReservations = reservations.filter((r) => r.status === 'ativa');
  const activeApartmentsCount = new Set(activeReservations.map((r) => r.apto.trim())).size;
  const occupancyPercentage =
    totalBuildingAptos > 0
      ? ((activeApartmentsCount / totalBuildingAptos) * 100).toFixed(1).replace('.', ',')
      : '0,0';

  const pendingPackages = packages.filter((p) => p.status === 'aguardando');
  const pendingIncidents = incidents.filter((i) => i.status !== 'resolvida');
  const upcomingAmenities = amenities.filter((a) => a.status === 'confirmada');

  const modules = [
    {
      id: 'hospedagem' as SystemModule,
      title: 'Controle de Hospedagem',
      description: `Calendário mensal de entradas e saídas, mapa visual dos ${totalBuildingAptos} apartamentos e ficha cadastral completa com veículos e acompanhantes.`,
      icon: BedDouble,
      badge: `${activeApartmentsCount} ocupados (${occupancyPercentage}%)`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      actionText: 'Acessar Reservas & Mapa',
      featured: true
    },
    {
      id: 'camareiras' as SystemModule,
      title: 'Controle de Camareiras',
      description: 'Escala semanal de limpeza dos apartamentos com Helena, Joseane e Josi. 1 hora por apartamento, encaixes e registro de recusas.',
      icon: Sparkles,
      badge: '3 Camareiras • 1h/apto',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      actionText: 'Acessar Escala de Limpeza'
    },
    {
      id: 'jogos' as SystemModule,
      title: 'Sala de Jogos',
      description: 'Gestão de mesas de sinuca, pebolim e ping-pong, normas de uso, agendamento de turnos e controle de equipamentos.',
      icon: Gamepad2,
      badge: 'Funcionamento: 08h às 22h',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      actionText: 'Ver Espaço de Jogos'
    },
    {
      id: 'academia' as SystemModule,
      title: 'Sala Academia',
      description: 'Capacidade em tempo real, horários de 07h às 22h, esteira, bikes, elíptico, estação multifuncional, supino e halteres.',
      icon: Dumbbell,
      badge: '07h às 22h • Máx 15 pessoas',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      actionText: 'Acessar Academia'
    },
    {
      id: 'churrasqueira' as SystemModule,
      title: 'Reserva de Espaços Comuns',
      description: 'Salão de Festas (08h às 00h) e Churrasqueiras 01 e 02 (08h às 18h), consulta de datas disponíveis e regras de uso.',
      icon: Flame,
      badge: `${upcomingAmenities.length} eventos agendados`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      actionText: 'Ver Reservas de Espaços'
    },
    {
      id: 'encomendas' as SystemModule,
      title: 'Controle de Encomendas',
      description: 'Registro de correspondências e mercadorias recebidas na portaria, baixa de retiradas com assinatura e aviso por interfone.',
      icon: Package,
      badge: `${pendingPackages.length} aguardando retirada`,
      badgeColor: pendingPackages.length > 0 ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold' : 'bg-slate-100 text-slate-700',
      actionText: 'Gerenciar Encomendas'
    },
    {
      id: 'ocorrencias' as SystemModule,
      title: 'Livro de Ocorrências',
      description: 'Livro digital de registros de portaria, notificações de barulho, reparos urgentes em áreas comuns e despachos do síndico.',
      icon: BookOpen,
      badge: `${pendingIncidents.length} pendência${pendingIncidents.length !== 1 ? 's' : ''}`,
      badgeColor: pendingIncidents.length > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800',
      actionText: 'Consultar Ocorrências'
    },
    {
      id: 'cadastros' as SystemModule,
      title: 'Cadastros Gerais',
      description: 'Catálogo de apartamentos, proprietários, telefones de contato, lista de veículos com placas cadastradas e porteiros autorizados.',
      icon: Users,
      badge: `${totalBuildingAptos} apartamentos cadastrados`,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      actionText: 'Ver Diretório Predial'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Quick KPI Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Taxa de Ocupação</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{occupancyPercentage}%</span>
            <span className="text-xs text-slate-500">geral</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {activeApartmentsCount} de {totalBuildingAptos} aptos ativos
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Encomendas Portaria</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{pendingPackages.length}</span>
            <span className="text-xs text-slate-500">volumes</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Aguardando retirada
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Espaços Reservados</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{upcomingAmenities.length}</span>
            <span className="text-xs text-slate-500">eventos</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Salão & Churrasqueira
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ocorrências Ativas</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{pendingIncidents.length}</span>
            <span className="text-xs text-slate-500">em aberto</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Acompanhamento síndico
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Módulos & Áreas do Condomínio
          </h3>
          <span className="text-xs text-slate-500">Clique para acessar qualquer módulo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                id={`card-module-${mod.id}`}
                onClick={() => onNavigate(mod.id)}
                className={`group bg-white rounded-xl border p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  mod.featured
                    ? 'border-blue-300 ring-1 ring-blue-100 hover:border-blue-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          mod.featured ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600'
                        } transition-colors`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {mod.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
                  <span>{mod.actionText}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

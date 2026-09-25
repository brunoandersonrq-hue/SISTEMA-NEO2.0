import React, { useState, useEffect } from 'react';
import { Header, ViewMode } from './components/Header.tsx';
import { MonthlyCalendar } from './components/MonthlyCalendar.tsx';
import { OccupancyBoard } from './components/OccupancyBoard.tsx';
import { ReservationHistory } from './components/ReservationHistory.tsx';
import { ReservationModal } from './components/ReservationModal.tsx';
import { GuestVoucherModal } from './components/GuestVoucherModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HomeDashboard } from './components/HomeDashboard.tsx';
import { GamesRoomView } from './components/GamesRoomView.tsx';
import { GymView } from './components/GymView.tsx';
import { PartyHallView } from './components/PartyHallView.tsx';
import { PackagesView } from './components/PackagesView.tsx';
import { IncidentLogView } from './components/IncidentLogView.tsx';
import { DirectoryView } from './components/DirectoryView.tsx';
import { HousekeepingView } from './components/HousekeepingView.tsx';

import {
  Reservation,
  ReservationStatus,
  SystemModule,
  PackageDelivery,
  IncidentRecord,
  AmenityReservation,
  AmenityStatus,
  ApartmentProfile
} from './types.ts';
import { INITIAL_RESERVATIONS, BUILDING_APARTMENTS } from './data/mockReservations.ts';
import { INITIAL_APARTMENT_PROFILES } from './data/apartmentProfiles.ts';
import {
  INITIAL_PACKAGES,
  INITIAL_INCIDENTS,
  INITIAL_AMENITY_RESERVATIONS
} from './data/condoMockData.ts';
import { getBrasiliaCurrentDateTime, getBrasiliaTodayDate } from './utils/formatters.ts';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Building2,
  Menu,
  BedDouble
} from 'lucide-react';

const STORAGE_KEY = 'controle_reservas_hospedes_v1';
const PACKAGES_KEY = 'controle_encomendas_v1';
const INCIDENTS_KEY = 'controle_ocorrencias_v1';
const AMENITIES_KEY = 'controle_amenities_v1';
const APARTMENTS_KEY = 'controle_apartamentos_cadastros_v1';

export default function App() {
  // Navigation Module: default to 'inicio' (Tela inicial)
  const [activeModule, setActiveModule] = useState<SystemModule>('inicio');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load reservations from localStorage with fallback to INITIAL_RESERVATIONS
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }
    return INITIAL_RESERVATIONS;
  });

  // Packages state
  const [packages, setPackages] = useState<PackageDelivery[]>(() => {
    try {
      const saved = localStorage.getItem(PACKAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar encomendas:', e);
    }
    return INITIAL_PACKAGES;
  });

  // Incidents state
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(INCIDENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar ocorrências:', e);
    }
    return INITIAL_INCIDENTS;
  });

  // Amenities state
  const [amenities, setAmenities] = useState<AmenityReservation[]>(() => {
    try {
      const saved = localStorage.getItem(AMENITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar reservas de espaços:', e);
    }
    return INITIAL_AMENITY_RESERVATIONS;
  });

  // Apartments Profiles State (124 units registry)
  const [apartments, setApartments] = useState<ApartmentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(APARTMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar cadastro de apartamentos:', e);
    }
    return INITIAL_APARTMENT_PROFILES;
  });

  const handleUpdateApartment = (updated: ApartmentProfile) => {
    setApartments((prev) =>
      prev.map((a) => (a.apto === updated.apto ? updated : a))
    );
    showToast(`Cadastro do apto ${updated.apto} atualizado!`, 'success');
  };

  const handleAddApartment = (newApto: ApartmentProfile) => {
    setApartments((prev) => {
      const idx = prev.findIndex((a) => a.apto.toLowerCase() === newApto.apto.toLowerCase());
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = newApto;
        return copy;
      }
      return [newApto, ...prev];
    });
    showToast(`Apartamento ${newApto.apto} cadastrado com sucesso!`, 'success');
  };

  // Active view inside 'hospedagem' module: 'calendar' | 'occupancy' | 'history'
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [voucherReservation, setVoucherReservation] = useState<Reservation | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.error('Falha ao salvar reservas no localStorage:', e);
    }
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    } catch (e) {
      console.error('Falha ao salvar encomendas no localStorage:', e);
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Falha ao salvar ocorrências no localStorage:', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(AMENITIES_KEY, JSON.stringify(amenities));
    } catch (e) {
      console.error('Falha ao salvar reservas no localStorage:', e);
    }
  }, [amenities]);

  useEffect(() => {
    try {
      localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
    } catch (e) {
      console.error('Falha ao salvar apartamentos no localStorage:', e);
    }
  }, [apartments]);

  // Reservation Handlers
  const handleSaveReservation = (savedRes: Reservation) => {
    setReservations((prev) => {
      const exists = prev.some((r) => r.id === savedRes.id);
      if (exists) {
        showToast(`Reserva do apto ${savedRes.apto} atualizada com sucesso!`, 'success');
        return prev.map((r) => (r.id === savedRes.id ? savedRes : r));
      } else {
        showToast(`Nova reserva do apto ${savedRes.apto} cadastrada com sucesso!`, 'success');
        return [savedRes, ...prev];
      }
    });
    setIsModalOpen(false);
    setEditingReservation(null);
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    showToast('Reserva removida do histórico.', 'info');
  };

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated: Reservation = {
            ...r,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
          if (newStatus === 'ativa' && !r.dataHoraCheckIn) {
            updated.dataHoraCheckIn = getBrasiliaCurrentDateTime();
          }
          if (newStatus === 'concluida') {
            const checkOutVal = r.dataHoraCheckOut || getBrasiliaCurrentDateTime();
            updated.dataHoraCheckOut = checkOutVal;
            const datePart = checkOutVal.split('T')[0];
            if (datePart) {
              updated.saida = datePart;
            }
          }
          return updated;
        }
        return r;
      })
    );
    const label =
      newStatus === 'ativa'
        ? 'Check-in realizado (Horário de Brasília)'
        : newStatus === 'concluida'
        ? 'Check-out realizado (Horário de Brasília)'
        : newStatus;
    showToast(`Status atualizado para: ${label}`, 'success');
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleViewVoucher = (reservation: Reservation) => {
    setVoucherReservation(reservation);
    setIsVoucherOpen(true);
  };

  const handleNewReservation = () => {
    setEditingReservation(null);
    setModalDefaultDate(getBrasiliaTodayDate());
    setIsModalOpen(true);
  };

  const handleNewReservationOnDate = (dateStr: string) => {
    setEditingReservation(null);
    setModalDefaultDate(dateStr);
    setIsModalOpen(true);
  };

  // Package Handlers
  const handleAddPackage = (pkg: PackageDelivery) => {
    setPackages((prev) => [pkg, ...prev]);
    showToast(`Encomenda do apto ${pkg.apto} registrada com sucesso!`, 'success');
  };

  const handleDeliverPackage = (id: string, retiradoPor: string, dataRetirada?: string) => {
    const dateStr = dataRetirada || getBrasiliaCurrentDateTime();

    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'retirado', retiradoPor, dataRetirada: dateStr }
          : p
      )
    );
    showToast(`Baixa confirmada! Pacote entregue a ${retiradoPor}.`, 'success');
  };

  const handleUpdatePackage = (updatedPkg: PackageDelivery) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
    showToast(`Encomenda do apto ${updatedPkg.apto} atualizada com sucesso!`, 'success');
  };

  // Incident Handlers
  const handleAddIncident = (incident: IncidentRecord) => {
    setIncidents((prev) => [incident, ...prev]);
    showToast('Ocorrência registrada no livro digital!', 'success');
  };

  const handleResolveIncident = (id: string, observacao: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? { ...inc, status: 'resolvida', observacaoSindico: observacao }
          : inc
      )
    );
    showToast('Ocorrência marcada como resolvida!', 'success');
  };

  // Amenity Handlers
  const handleAddAmenity = (reservation: AmenityReservation) => {
    const isCanceled = (s: string) => s === 'cancelada' || s === 'cancelado';
    const hasConflict = amenities.some((item) => {
      if (isCanceled(item.status)) return false;
      const itemEspaco = item.espaco === 'churrasqueira' ? 'churrasqueira_01' : item.espaco;
      const resEspaco = reservation.espaco === 'churrasqueira' ? 'churrasqueira_01' : reservation.espaco;
      if (itemEspaco !== resEspaco) return false;
      if (item.data !== reservation.data) return false;
      if (item.periodo === 'dia_todo' || reservation.periodo === 'dia_todo') return true;
      return item.periodo === reservation.periodo;
    });

    if (hasConflict) {
      showToast('Não permitido: Já existe reserva ativa para esta data e período!', 'error');
      return;
    }

    setAmenities((prev) => [reservation, ...prev]);
    showToast(`Reserva confirmada para o apto ${reservation.apto}!`, 'success');
  };

  const handleUpdateAmenityStatus = (id: string, newStatus: AmenityStatus) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    const labelMap: Record<string, string> = {
      reservado: 'RESERVADO',
      cancelado: 'CANCELADO',
      realizado: 'REALIZADO',
      confirmada: 'RESERVADO'
    };
    showToast(`Status da reserva alterado para: ${labelMap[newStatus] || newStatus}`, 'success');
  };

  // Restore sample demo data
  const handleResetSampleData = () => {
    if (window.confirm('Deseja recarregar os dados de exemplo padrão de todas as áreas?')) {
      setReservations(INITIAL_RESERVATIONS);
      setPackages(INITIAL_PACKAGES);
      setIncidents(INITIAL_INCIDENTS);
      setAmenities(INITIAL_AMENITY_RESERVATIONS);
      showToast('Dados de demonstração restaurados com sucesso.', 'info');
    }
  };

  // Calculations for quick KPIs: occupied apartments and overall occupancy rate
  const totalBuildingAptos = BUILDING_APARTMENTS.length; // 124 apartamentos
  const occupiedApartments = new Set(
    reservations.filter((r) => r.status === 'ativa').map((r) => r.apto.trim())
  );
  const occupiedCount = occupiedApartments.size;
  const occupancyRate =
    totalBuildingAptos > 0
      ? ((occupiedCount / totalBuildingAptos) * 100).toFixed(1).replace('.', ',')
      : '0,0';

  const pendingPackagesCount = packages.filter((p) => p.status === 'aguardando').length;
  const pendingIncidentsCount = incidents.filter((i) => i.status !== 'resolvida').length;

  const moduleTitles: Record<SystemModule, string> = {
    inicio: 'Painel Geral • Tela Inicial',
    hospedagem: 'Controle de Hospedagem & Reservas',
    camareiras: 'Controle de Camareiras • Escala Semanal',
    jogos: 'Sala de Jogos',
    academia: 'Sala Academia',
    churrasqueira: 'Reserva Salão & Churrasqueira',
    encomendas: 'Controle de Encomendas',
    ocorrencias: 'Livro de Ocorrências',
    cadastros: 'Cadastros & Diretório Predial'
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col lg:flex-row font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in max-w-sm">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Persistent Left Sidebar with Uploaded Logo at top left */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeGuestsCount={occupiedCount}
        pendingPackagesCount={pendingPackagesCount}
        pendingIncidentsCount={pendingIncidentsCount}
        totalBuildingAptos={totalBuildingAptos}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Module Header */}
        {activeModule === 'hospedagem' ? (
          <Header
            currentView={currentView}
            onViewChange={setCurrentView}
            onNewReservation={handleNewReservation}
            occupiedCount={occupiedCount}
            totalBuildingAptos={totalBuildingAptos}
            occupancyRate={occupancyRate}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        ) : (
          <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Abrir Menu Lateral"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {moduleTitles[activeModule]}
                </h1>
              </div>

              {/* Quick action button to go directly to Controle de Hospedagem */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="topbar-btn-hospedagem"
                  onClick={() => setActiveModule('hospedagem')}
                  className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <BedDouble className="w-4 h-4" />
                  <span className="hidden sm:inline">Controle de Hospedagem</span>
                  <span className="sm:hidden">Hospedagem</span>
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Main Body Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeModule === 'inicio' && (
            <HomeDashboard
              onNavigate={(mod) => setActiveModule(mod)}
              reservations={reservations}
              packages={packages}
              incidents={incidents}
              amenities={amenities}
              totalBuildingAptos={totalBuildingAptos}
            />
          )}

          {activeModule === 'hospedagem' && (
            <>
              {currentView === 'calendar' ? (
                <MonthlyCalendar
                  reservations={reservations}
                  onSelectReservation={handleViewVoucher}
                  onEditReservation={handleEditReservation}
                  onNewReservationOnDate={handleNewReservationOnDate}
                />
              ) : currentView === 'occupancy' ? (
                <OccupancyBoard
                  reservations={reservations}
                  onSelectReservation={handleViewVoucher}
                  onEditReservation={handleEditReservation}
                  onStatusChange={handleStatusChange}
                  onNewReservation={handleNewReservation}
                />
              ) : (
                <ReservationHistory
                  reservations={reservations}
                  onEditReservation={handleEditReservation}
                  onViewVoucher={handleViewVoucher}
                  onDeleteReservation={handleDeleteReservation}
                  onStatusChange={handleStatusChange}
                  onNewReservation={handleNewReservation}
                />
              )}
            </>
          )}

          {activeModule === 'camareiras' && (
            <HousekeepingView
              apartments={apartments}
              onOpenApartmentsModal={() => setActiveModule('cadastros')}
            />
          )}

          {activeModule === 'jogos' && <GamesRoomView />}

          {activeModule === 'academia' && <GymView />}

          {activeModule === 'churrasqueira' && (
            <PartyHallView
              amenities={amenities}
              onAddAmenity={handleAddAmenity}
              onUpdateAmenityStatus={handleUpdateAmenityStatus}
            />
          )}

          {activeModule === 'encomendas' && (
            <PackagesView
              packages={packages}
              onAddPackage={handleAddPackage}
              onDeliverPackage={handleDeliverPackage}
              onUpdatePackage={handleUpdatePackage}
              apartments={apartments}
              onUpdateApartment={handleUpdateApartment}
              onAddApartment={handleAddApartment}
            />
          )}

          {activeModule === 'ocorrencias' && (
            <IncidentLogView
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onResolveIncident={handleResolveIncident}
            />
          )}

          {activeModule === 'cadastros' && (
            <DirectoryView
              reservations={reservations}
              apartments={apartments}
              onUpdateApartment={handleUpdateApartment}
              onAddApartment={handleAddApartment}
            />
          )}
        </main>

        {/* Modals for Reservation creation/editing & Guest Voucher */}
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReservation(null);
          }}
          onSave={handleSaveReservation}
          reservationToEdit={editingReservation}
          defaultDate={modalDefaultDate}
        />

        <GuestVoucherModal
          isOpen={isVoucherOpen}
          onClose={() => {
            setIsVoucherOpen(false);
            setVoucherReservation(null);
          }}
          reservation={voucherReservation}
          onEdit={handleEditReservation}
        />

        {/* Universal Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-800" />
              <span className="font-semibold text-slate-700">Edifício NEO 2.0</span>
              <span>•</span>
              <span>Sistema Integrado de Gestão Predial & Recepção</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleResetSampleData}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-900 transition-colors cursor-pointer"
                title="Restaurar dados de exemplo originais de todos os módulos"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar dados de exemplo</span>
              </button>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                v2.0
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

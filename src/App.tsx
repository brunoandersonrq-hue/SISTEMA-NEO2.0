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
import { DataManagementModal } from './components/DataManagementModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { UserManagementModal } from './components/UserManagementModal.tsx';
import { KeyControlView } from './components/KeyControlView.tsx';
import { WhatsAppImportModal } from './components/WhatsAppImportModal.tsx';

import {
  Reservation,
  ReservationStatus,
  SystemModule,
  PackageDelivery,
  IncidentRecord,
  AmenityReservation,
  AmenityStatus,
  ApartmentProfile,
  UserAccount,
  GameTurn,
  GymKeyTurn,
  KeyControlRecord
} from './types.ts';
import { INITIAL_RESERVATIONS, BUILDING_APARTMENTS } from './data/mockReservations.ts';
import { INITIAL_APARTMENT_PROFILES, OFFICIAL_APARTMENTS_MAP } from './data/apartmentProfiles.ts';
import { INITIAL_KEY_RECORDS } from './data/mockKeyControl.ts';
import {
  INITIAL_PACKAGES,
  INITIAL_INCIDENTS,
  INITIAL_AMENITY_RESERVATIONS,
  INITIAL_GAMES_TURNS,
  INITIAL_GYM_TURNS
} from './data/condoMockData.ts';
import { getBrasiliaCurrentDateTime, getBrasiliaTodayDate } from './utils/formatters.ts';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Building2,
  Menu,
  BedDouble,
  Database
} from 'lucide-react';

const STORAGE_KEY = 'controle_reservas_hospedes_v1';
const PACKAGES_KEY = 'controle_encomendas_v1';
const INCIDENTS_KEY = 'controle_ocorrencias_v1';
const AMENITIES_KEY = 'controle_amenities_v1';
const APARTMENTS_KEY = 'controle_apartamentos_cadastros_v4';
const GAMES_ROOM_KEY = 'controle_sala_jogos_v1';
const GYM_KEY = 'controle_sala_academia_v1';
const KEY_CONTROL_KEY = 'controle_chaves_portaria_v1';
const USERS_KEY = 'controle_usuarios_operadores_v1';
const CURRENT_USER_KEY = 'controle_usuario_logado_v1';

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user_admin',
    username: 'admin',
    nome: 'Administrador Síndico',
    cargo: 'Administração Predial',
    role: 'admin',
    senhaHash: '123321',
    criadoEm: '2026-01-01'
  },
  {
    id: 'user_portaria',
    username: 'portaria',
    nome: 'Operador de Portaria',
    cargo: 'Recepção / Controle de Acesso',
    role: 'portaria',
    senhaHash: '1234',
    criadoEm: '2026-01-01'
  }
];

export default function App() {
  // Authentication & Users State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários:', e);
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão do usuário:', e);
    }
    return null;
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Bem-vindo, ${user.nome || user.username}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsUserModalOpen(false);
    showToast('Você saiu do sistema. Até logo!', 'info');
  };

  const handleUpdatePassword = (userId: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, senhaHash: newPass } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, senhaHash: newPass } : null));
    }
  };

  const handleCreateUser = (newUser: Omit<UserAccount, 'id' | 'criadoEm'>) => {
    const created: UserAccount = {
      ...newUser,
      id: `user_${Date.now()}`,
      status: newUser.status || 'ativo',
      criadoEm: getBrasiliaTodayDate()
    };
    setUsers((prev) => [...prev, created]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'inativo' ? 'ativo' : 'inativo';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        return { ...prev, status: prev.status === 'inativo' ? 'ativo' : 'inativo' };
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Navigation Module: default to 'inicio' (Tela inicial)
  const [activeModule, setActiveModule] = useState<SystemModule>('inicio');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [housekeepingVersion, setHousekeepingVersion] = useState(0);

  // Load reservations from localStorage with fallback to INITIAL_RESERVATIONS
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // Helper to ensure all 124 units + Condomínio exist with official data
  const buildMergedApartmentProfiles = (existing?: ApartmentProfile[]): ApartmentProfile[] => {
    const existingMap = new Map<string, ApartmentProfile>();
    if (Array.isArray(existing)) {
      existing.forEach((item) => {
        if (item && item.apto) {
          existingMap.set(item.apto.trim().toLowerCase(), item);
        }
      });
    }

    const profiles: ApartmentProfile[] = BUILDING_APARTMENTS.map((apto) => {
      const key = apto.toLowerCase();
      const stored = existingMap.get(key);
      const official = OFFICIAL_APARTMENTS_MAP[apto];

      if (official) {
        // If stored has a customized non-dummy name and phone, preserve it; otherwise apply official data
        const isDummy = !stored?.proprietario || stored.proprietario.startsWith('Morador Apto') || stored.proprietario.includes('Carlos Eduardo Silva');
        if (stored && !isDummy && stored.celular) {
          return {
            ...stored,
            apto,
            tipoApto: stored.tipoApto || official.tipoApto
          };
        }
        return {
          apto,
          proprietario: official.proprietario,
          celular: official.celular,
          email: official.email,
          tipoApto: official.tipoApto,
          observacoes: official.observacoes || 'Cadastro oficial verificado'
        };
      }

      if (stored) {
        return stored;
      }

      const num = parseInt(apto, 10);
      const isCobertura = num >= 801;

      return {
        apto,
        proprietario: isCobertura ? `Morador Cobertura ${apto}` : `Morador Apto ${apto}`,
        celular: '',
        email: '',
        tipoApto: 'morador' as const,
        observacoes: 'Aguardando complemento cadastral'
      };
    });

    const condoStored = existingMap.get('condomínio') || existingMap.get('condominio');
    profiles.push(
      condoStored || {
        apto: 'Condomínio',
        proprietario: 'Administração Predial / Síndico',
        celular: '(82) 98000-0000',
        email: 'administracao@condominio.com.br',
        tipoApto: 'morador' as const,
        observacoes: 'Unidade administrativa, zeladoria e áreas comuns do condomínio'
      }
    );

    return profiles;
  };

  // Apartments Profiles State (125 units registry: 124 apartments + Condomínio)
  const [apartments, setApartments] = useState<ApartmentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(APARTMENTS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return buildMergedApartmentProfiles(parsed);
        }
      }
      // Check legacy keys to migrate user data while ensuring official records
      const legacy = localStorage.getItem('controle_apartamentos_cadastros_v2') || localStorage.getItem('controle_apartamentos_cadastros_v1');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const merged = buildMergedApartmentProfiles(parsedLegacy);
          localStorage.setItem(APARTMENTS_KEY, JSON.stringify(merged));
          return merged;
        }
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

  const handleSyncOfficialApartments = () => {
    const fresh = buildMergedApartmentProfiles();
    setApartments(fresh);
    try {
      localStorage.setItem(APARTMENTS_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.error(e);
    }
    showToast('Cadastros sincronizados com a base oficial do condomínio (124 apartamentos + administração)!', 'success');
  };

  // Games Room Turns State
  const [gamesTurns, setGamesTurns] = useState<GameTurn[]>(() => {
    try {
      const saved = localStorage.getItem(GAMES_ROOM_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar jogos:', e);
    }
    return INITIAL_GAMES_TURNS;
  });

  // Gym Key Turns State
  const [gymTurns, setGymTurns] = useState<GymKeyTurn[]>(() => {
    try {
      const saved = localStorage.getItem(GYM_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar academia:', e);
    }
    return INITIAL_GYM_TURNS;
  });

  // Games Room Handlers
  const handleAddGameTurn = (turn: GameTurn) => {
    setGamesTurns((prev) => [...prev, turn]);
    showToast(`Empréstimo registrado para o apto ${turn.apto}!`, 'success');
  };

  const handleUpdateGameTurn = (updated: GameTurn) => {
    setGamesTurns((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Devolução confirmada na Sala de Jogos!', 'success');
  };

  // Gym Room Handlers
  const handleAddGymTurn = (turn: GymKeyTurn) => {
    setGymTurns((prev) => [...prev, turn]);
    showToast(`Chave/tag da academia retirada pelo apto ${turn.apto}!`, 'success');
  };

  const handleUpdateGymTurn = (updated: GymKeyTurn) => {
    setGymTurns((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Devolução confirmada na Sala Academia!', 'success');
  };

  // Key Control State & Handlers
  const [keyRecords, setKeyRecords] = useState<KeyControlRecord[]>(() => {
    try {
      const saved = localStorage.getItem(KEY_CONTROL_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar controle de chaves:', e);
    }
    return INITIAL_KEY_RECORDS;
  });

  const handleAddKeyRecord = (record: Omit<KeyControlRecord, 'id' | 'criadoEm'>) => {
    const newRecord: KeyControlRecord = {
      ...record,
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      criadoEm: new Date().toISOString()
    };
    setKeyRecords((prev) => [newRecord, ...prev]);
    showToast(`Retirada da chave do apto/local ${newRecord.apto} registrada com sucesso!`, 'success');
  };

  const handleUpdateKeyRecord = (id: string, updates: Partial<KeyControlRecord>) => {
    const existing = keyRecords.find((k) => k.id === id);
    if (existing?.devolucao && !isAdmin) {
      showToast('Apenas o Administrador pode editar registros com devolução concluída.', 'error');
      return;
    }
    setKeyRecords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updates, atualizadoEm: new Date().toISOString() } : k))
    );
    showToast('Registro de controle de chave atualizado!', 'success');
  };

  const handleDeleteKeyRecord = (id: string) => {
    if (!isAdmin) {
      showToast('Apenas o usuário Administrador pode excluir registros de controle de chaves.', 'error');
      return;
    }
    setKeyRecords((prev) => prev.filter((k) => k.id !== id));
    showToast('Registro de chave removido.', 'info');
  };

  // Data management cleanup handlers
  const handleClearReservations = () => {
    setReservations([]);
    showToast('Reservas de exemplo removidas. Sistema pronto para novos cadastros.', 'success');
  };

  const handleClearPackages = () => {
    setPackages([]);
    showToast('Encomendas de exemplo removidas.', 'success');
  };

  const handleClearIncidents = () => {
    setIncidents([]);
    showToast('Ocorrências de exemplo removidas.', 'success');
  };

  const handleClearAmenities = () => {
    setAmenities([]);
    showToast('Reservas de espaços removidas.', 'success');
  };

  const handleClearHousekeeping = () => {
    try {
      localStorage.setItem('controle_camareiras_slots_v1', JSON.stringify([]));
      localStorage.removeItem('controle_camareiras_observacoes_notas_v1');
    } catch (e) {
      console.error(e);
    }
    setHousekeepingVersion((v) => v + 1);
    showToast('Escala de camareiras zerada com sucesso.', 'success');
  };

  const handleClearGamesRoom = () => {
    setGamesTurns([]);
    try {
      localStorage.setItem(GAMES_ROOM_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('Registros da Sala de Jogos limpos com sucesso.', 'success');
  };

  const handleClearGym = () => {
    setGymTurns([]);
    try {
      localStorage.setItem(GYM_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    showToast('Registros da Sala Academia limpos com sucesso.', 'success');
  };

  const handleClearAllDemoData = () => {
    setReservations([]);
    setPackages([]);
    setIncidents([]);
    setAmenities([]);
    setGamesTurns([]);
    setGymTurns([]);
    setKeyRecords([]);
    try {
      localStorage.setItem('controle_camareiras_slots_v1', JSON.stringify([]));
      localStorage.removeItem('controle_camareiras_observacoes_notas_v1');
      localStorage.setItem(GAMES_ROOM_KEY, JSON.stringify([]));
      localStorage.setItem(GYM_KEY, JSON.stringify([]));
      localStorage.setItem(KEY_CONTROL_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    setHousekeepingVersion((v) => v + 1);
    showToast('Todos os dados de exemplo foram removidos! Condomínio pronto para uso real.', 'success');
  };

  const handleRestoreDemoData = () => {
    setReservations(INITIAL_RESERVATIONS);
    setPackages(INITIAL_PACKAGES);
    setIncidents(INITIAL_INCIDENTS);
    setAmenities(INITIAL_AMENITY_RESERVATIONS);
    setApartments(INITIAL_APARTMENT_PROFILES);
    setGamesTurns(INITIAL_GAMES_TURNS);
    setGymTurns(INITIAL_GYM_TURNS);
    setKeyRecords(INITIAL_KEY_RECORDS);
    try {
      localStorage.setItem(APARTMENTS_KEY, JSON.stringify(INITIAL_APARTMENT_PROFILES));
      localStorage.setItem(GAMES_ROOM_KEY, JSON.stringify(INITIAL_GAMES_TURNS));
      localStorage.setItem(GYM_KEY, JSON.stringify(INITIAL_GYM_TURNS));
      localStorage.setItem(KEY_CONTROL_KEY, JSON.stringify(INITIAL_KEY_RECORDS));
      localStorage.removeItem('controle_camareiras_slots_v1');
      localStorage.removeItem('controle_camareiras_observacoes_notas_v1');
    } catch (e) {
      console.error(e);
    }
    setHousekeepingVersion((v) => v + 1);
    showToast('Dados de demonstração restaurados com sucesso!', 'success');
  };

  // Active view inside 'hospedagem' module: 'calendar' | 'occupancy' | 'history'
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [voucherReservation, setVoucherReservation] = useState<Reservation | null>(null);
  const [isWhatsAppDirectModalOpen, setIsWhatsAppDirectModalOpen] = useState(false);

  const handleApplyWhatsAppDirect = (parsedData: Partial<Reservation>) => {
    setEditingReservation({
      id: `res-${Date.now()}`,
      apto: parsedData.apto || '',
      entrada: parsedData.entrada || '',
      saida: parsedData.saida || '',
      nomeResponsavel: parsedData.nomeResponsavel || '',
      email: parsedData.email || '',
      cpf: parsedData.cpf || '',
      telefone: parsedData.telefone || '',
      endereco: parsedData.endereco || '',
      cep: parsedData.cep || '',
      cidade: parsedData.cidade || '',
      estado: parsedData.estado || 'SP',
      pais: parsedData.pais || 'Brasil',
      acompanhantes: parsedData.acompanhantes || '',
      modeloCarro1: parsedData.modeloCarro1 || '',
      placaCarro1: parsedData.placaCarro1 || '',
      corCarro1: parsedData.corCarro1 || '',
      modeloCarro2: parsedData.modeloCarro2 || '',
      placaCarro2: parsedData.placaCarro2 || '',
      corCarro2: parsedData.corCarro2 || '',
      recepcionista: currentUser?.nome || 'Recepção',
      locador: 'Locação Direta',
      status: 'confirmada',
      observacoes: parsedData.observacoes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
    showToast('Ficha de hóspede reconhecida com sucesso do WhatsApp!', 'success');
  };

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

  useEffect(() => {
    try {
      localStorage.setItem(GAMES_ROOM_KEY, JSON.stringify(gamesTurns));
    } catch (e) {
      console.error('Falha ao salvar jogos no localStorage:', e);
    }
  }, [gamesTurns]);

  useEffect(() => {
    try {
      localStorage.setItem(GYM_KEY, JSON.stringify(gymTurns));
    } catch (e) {
      console.error('Falha ao salvar academia no localStorage:', e);
    }
  }, [gymTurns]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_CONTROL_KEY, JSON.stringify(keyRecords));
    } catch (e) {
      console.error('Falha ao salvar controle de chaves no localStorage:', e);
    }
  }, [keyRecords]);

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

  const handleDeliverPackage = (id: string, retiradoPor: string, dataRetirada?: string, assinatura?: string) => {
    const dateStr = dataRetirada || getBrasiliaCurrentDateTime();

    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'retirado',
              retiradoPor,
              dataRetirada: dateStr,
              ...(assinatura ? { assinatura } : {})
            }
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
  const totalBuildingAptos = apartments.length || BUILDING_APARTMENTS.length;
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
  const pendingKeysCount = keyRecords.filter((k) => !k.devolucao).length;

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username?.toLowerCase() === 'admin';

  const moduleTitles: Record<SystemModule, string> = {
    inicio: 'Painel Geral • Tela Inicial',
    hospedagem: 'Controle de Hospedagem & Reservas',
    camareiras: 'Controle de Camareiras • Escala Semanal',
    jogos: 'Sala de Jogos',
    academia: 'Sala Academia',
    churrasqueira: 'Reserva de Espaços Comuns (Salão, Cyber Café & Churrasqueiras)',
    encomendas: 'Controle de Encomendas',
    chaves: 'Controle de Chaves • Portaria & Recepção',
    ocorrencias: 'Livro de Ocorrências',
    cadastros: 'Cadastros & Diretório Predial'
  };

  // Authentication Barrier: If user is not logged in, render LoginScreen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} users={users} />;
  }

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
        pendingKeysCount={pendingKeysCount}
        totalBuildingAptos={totalBuildingAptos}
        onOpenDataManagement={
          isAdmin
            ? () => {
                setIsDataModalOpen(true);
                setIsMobileSidebarOpen(false);
              }
            : undefined
        }
        currentUser={currentUser}
        onOpenUserModal={() => {
          setIsUserModalOpen(true);
          setIsMobileSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Module Header */}
        {activeModule === 'hospedagem' ? (
          <Header
            currentView={currentView}
            onViewChange={setCurrentView}
            onNewReservation={handleNewReservation}
            onImportWhatsApp={() => setIsWhatsAppDirectModalOpen(true)}
            occupiedCount={occupiedCount}
            totalBuildingAptos={totalBuildingAptos}
            occupancyRate={occupancyRate}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenDataManagement={isAdmin ? () => setIsDataModalOpen(true) : undefined}
            currentUser={currentUser}
            onOpenUserModal={() => setIsUserModalOpen(true)}
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

              {/* Top actions */}
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsDataModalOpen(true)}
                    title="Gerenciar Dados e Limpar Exemplos (Administrador)"
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Gerenciar Dados</span>
                  </button>
                )}

                {/* Operator user avatar pill */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(true)}
                    title={`Operador logado: ${currentUser.nome} (${currentUser.cargo}) - Clique para alterar senha ou perfil`}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">
                      {currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[100px] truncate hidden md:inline font-bold">
                      {currentUser.nome || currentUser.username}
                    </span>
                  </button>
                )}

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
              keyRecords={keyRecords}
              totalBuildingAptos={totalBuildingAptos}
              onOpenDataManagement={isAdmin ? () => setIsDataModalOpen(true) : undefined}
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
              key={housekeepingVersion}
              apartments={apartments}
              onOpenApartmentsModal={() => setActiveModule('cadastros')}
            />
          )}

          {activeModule === 'jogos' && (
            <GamesRoomView
              turns={gamesTurns}
              onAddTurn={handleAddGameTurn}
              onUpdateTurn={handleUpdateGameTurn}
              isAdmin={isAdmin}
              onClearModule={handleClearGamesRoom}
            />
          )}

          {activeModule === 'academia' && (
            <GymView
              turns={gymTurns}
              onAddTurn={handleAddGymTurn}
              onUpdateTurn={handleUpdateGymTurn}
              isAdmin={isAdmin}
              onClearModule={handleClearGym}
            />
          )}

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

          {activeModule === 'chaves' && (
            <KeyControlView
              keyRecords={keyRecords}
              onAddKeyRecord={handleAddKeyRecord}
              onUpdateKeyRecord={handleUpdateKeyRecord}
              onDeleteKeyRecord={handleDeleteKeyRecord}
              apartments={apartments}
              currentUserName={currentUser?.nome || currentUser?.username}
              isAdmin={isAdmin}
              currentUserRole={currentUser?.role}
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
              onSyncOfficialApartments={handleSyncOfficialApartments}
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

        {/* Direct WhatsApp Import Modal */}
        <WhatsAppImportModal
          isOpen={isWhatsAppDirectModalOpen}
          onClose={() => setIsWhatsAppDirectModalOpen(false)}
          onApplyData={handleApplyWhatsAppDirect}
        />

        {/* Data Management & Clear Mock Modal */}
        <DataManagementModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          counts={{
            reservations: reservations.length,
            packages: packages.length,
            incidents: incidents.length,
            amenities: amenities.length,
            apartments: apartments.length,
            gamesRoom: gamesTurns.length,
            gym: gymTurns.length
          }}
          onClearReservations={handleClearReservations}
          onClearPackages={handleClearPackages}
          onClearIncidents={handleClearIncidents}
          onClearAmenities={handleClearAmenities}
          onClearHousekeeping={handleClearHousekeeping}
          onClearGamesRoom={handleClearGamesRoom}
          onClearGym={handleClearGym}
          onClearAllDemoData={handleClearAllDemoData}
          onRestoreDemoData={handleRestoreDemoData}
        />

        {/* User Account & Operator Management Modal */}
        {currentUser && (
          <UserManagementModal
            isOpen={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            currentUser={currentUser}
            users={users}
            onUpdatePassword={handleUpdatePassword}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onLogout={handleLogout}
          />
        )}

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
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-900 transition-colors cursor-pointer"
                  title="Restaurar dados de exemplo originais de todos os módulos (Administrador)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar dados de exemplo</span>
                </button>
              )}
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

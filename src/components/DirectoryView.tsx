import React, { useState } from 'react';
import {
  Users,
  Search,
  Building2,
  Car,
  Phone,
  Mail,
  User,
  Home,
  Clock,
  Edit2,
  Filter,
  CheckCircle2,
  MessageSquare,
  LayoutGrid,
  List,
  Plus,
  X,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';
import { INITIAL_APARTMENT_PROFILES } from '../data/apartmentProfiles.ts';
import { Reservation, ApartmentProfile, ApartmentType } from '../types.ts';
import { formatPhone } from '../utils/formatters.ts';
import { ApartmentsRegistryModal } from './ApartmentsRegistryModal.tsx';

/**
 * Gera mensagem formatada pronta para enviar via WhatsApp ao morador
 * solicitando preenchimento ou confirmação dos dados cadastrais oficiais
 */
export const generateWhatsAppCadastroRequest = (item: ApartmentProfile) => {
  const saudacaoNome =
    item.proprietario && !item.proprietario.toLowerCase().startsWith('morador')
      ? item.proprietario
      : 'Morador(a)';

  return `🏢 *ATUALIZAÇÃO CADASTRAL DO CONDOMÍNIO*

Olá, ${saudacaoNome}!
Estamos atualizando a ficha cadastral predial oficial da unidade *Apto ${item.apto}*.

Por gentileza, confirme ou preencha as informações abaixo para mantermos o sistema da portaria, avisos de encomendas e segurança atualizados:

1. *Nome Completo do Morador/Proprietário:* ${item.proprietario && !item.proprietario.toLowerCase().startsWith('morador') ? item.proprietario : ''}
2. *Celular / WhatsApp para contato:* ${item.celular || ''}
3. *E-mail:* ${item.email || ''}
4. *Tipo de Ocupação:* ${item.tipoApto === 'morador' ? 'Morador' : item.tipoApto === 'inquilino' ? 'Inquilino' : item.tipoApto === 'temporada' ? 'Temporada' : '( ) Morador ( ) Inquilino ( ) Temporada'}
5. *Placa e Modelo do Veículo (se houver vaga):*
6. *Observações / Ramal do Interfone:*

Basta responder a esta mensagem com as informações preenchidas.
Agradecemos muito pela colaboração!
— Administração Predial / Portaria`;
};

interface DirectoryViewProps {
  reservations: Reservation[];
  apartments?: ApartmentProfile[];
  onUpdateApartment?: (updated: ApartmentProfile) => void;
  onAddApartment?: (created: ApartmentProfile) => void;
  onSyncOfficialApartments?: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  reservations,
  apartments: propApartments,
  onUpdateApartment: propOnUpdateApartment,
  onAddApartment: propOnAddApartment,
  onSyncOfficialApartments
}) => {
  const [localApartments, setLocalApartments] = useState<ApartmentProfile[]>(INITIAL_APARTMENT_PROFILES);
  const apartments = propApartments || localApartments;

  const handleUpdate = (updated: ApartmentProfile) => {
    if (propOnUpdateApartment) {
      propOnUpdateApartment(updated);
    } else {
      setLocalApartments((prev) => prev.map((a) => (a.apto === updated.apto ? updated : a)));
    }
  };

  const [activeTab, setActiveTab] = useState<'cadastro' | 'ocupacao'>('cadastro');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ApartmentType | 'todos' | 'pendentes'>('todos');
  const [filterFloor, setFilterFloor] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApto, setEditingApto] = useState<ApartmentProfile | null>(null);

  // WhatsApp Request Modal State
  const [whatsAppModalApto, setWhatsAppModalApto] = useState<ApartmentProfile | null>(null);
  const [targetPhoneInput, setTargetPhoneInput] = useState('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Apartment Registration State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newAptoData, setNewAptoData] = useState<ApartmentProfile>({
    apto: '',
    proprietario: '',
    celular: '',
    email: '',
    tipoApto: 'morador',
    observacoes: ''
  });

  const handleAddNewApartment = (created: ApartmentProfile) => {
    if (propOnAddApartment) {
      propOnAddApartment(created);
    } else {
      setLocalApartments((prev) => {
        const idx = prev.findIndex((a) => a.apto.toLowerCase() === created.apto.toLowerCase());
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = created;
          return copy;
        }
        return [created, ...prev];
      });
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptoData.apto.trim() || !newAptoData.proprietario.trim()) return;

    handleAddNewApartment(newAptoData);

    setIsCreatingNew(false);
    setNewAptoData({
      apto: '',
      proprietario: '',
      celular: '',
      email: '',
      tipoApto: 'morador',
      observacoes: ''
    });
  };

  // Map apartment to dynamic reservation state
  const getApartmentReservationData = (apto: string) => {
    const active = reservations.find((r) => r.apto === apto && r.status === 'ativa');
    if (active) {
      return {
        status: 'Ocupado' as const,
        hospede: active.nomeResponsavel,
        telefone: active.telefone,
        veiculo: active.placaCarro1 ? `${active.modeloCarro1 || 'Carro'} (${active.placaCarro1})` : 'Nenhum',
        tipo: 'Hospedagem Ativa'
      };
    }
    const confirmed = reservations.find((r) => r.apto === apto && r.status === 'confirmada');
    if (confirmed) {
      return {
        status: 'Reserva Confirmada' as const,
        hospede: confirmed.nomeResponsavel,
        telefone: confirmed.telefone,
        veiculo: confirmed.placaCarro1 ? `${confirmed.modeloCarro1 || 'Carro'} (${confirmed.placaCarro1})` : 'Nenhum',
        tipo: 'Check-in Futuro'
      };
    }
    return {
      status: 'Disponível' as const,
      hospede: 'Unidade Desocupada',
      telefone: '—',
      veiculo: 'Nenhum',
      tipo: 'Vago'
    };
  };

  // Filtered apartments list
  const filteredApartments = apartments.filter((item) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.apto.toLowerCase().includes(query) ||
      item.proprietario.toLowerCase().includes(query) ||
      item.celular.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query);

    const isPendente =
      !item.celular ||
      item.celular.trim() === '' ||
      item.proprietario.toLowerCase().startsWith('morador') ||
      (item.observacoes && item.observacoes.toLowerCase().includes('aguardando'));

    const matchesType =
      filterType === 'todos'
        ? true
        : filterType === 'pendentes'
        ? isPendente
        : item.tipoApto === filterType;

    const floorNumber = item.apto.length === 3 ? item.apto[0] : item.apto.substring(0, 1);
    const matchesFloor = filterFloor === 'todos' || floorNumber === filterFloor;

    return matchesSearch && matchesType && matchesFloor;
  });

  const countMorador = apartments.filter((a) => a.tipoApto === 'morador').length;
  const countInquilino = apartments.filter((a) => a.tipoApto === 'inquilino').length;
  const countTemporada = apartments.filter((a) => a.tipoApto === 'temporada').length;
  const countPendentes = apartments.filter(
    (a) =>
      !a.celular ||
      a.celular.trim() === '' ||
      a.proprietario.toLowerCase().startsWith('morador') ||
      (a.observacoes && a.observacoes.toLowerCase().includes('aguardando'))
  ).length;

  const handleOpenWhatsAppModal = (apto: ApartmentProfile) => {
    setWhatsAppModalApto(apto);
    setTargetPhoneInput(apto.celular ? getCleanPhoneForWhatsApp(apto.celular) : '');
    setCopiedFeedback(false);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setToastMessage('Ficha cadastral copiada! Cole no WhatsApp para enviar ao morador.');
    setTimeout(() => {
      setCopiedFeedback(false);
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyBlankTemplate = () => {
    const blankTemplate = `🏢 *ATUALIZAÇÃO CADASTRAL DO CONDOMÍNIO*

Olá, morador(a)!
Estamos atualizando a ficha cadastral predial oficial do nosso condomínio.

Por gentileza, preencha as informações abaixo para mantermos o sistema da portaria, avisos de encomendas e segurança atualizados:

1. *Número do Apartamento:* 
2. *Nome Completo do Proprietário / Morador:* 
3. *Celular / WhatsApp para contato:* 
4. *E-mail:* 
5. *Tipo de Ocupação:* ( ) Morador ( ) Inquilino ( ) Temporada
6. *Placa e Modelo do Veículo (se houver vaga):* 
7. *Observações / Ramal do Interfone:* 

Basta responder a esta mensagem com as informações preenchidas.
Agradecemos muito pela colaboração!
— Administração Predial / Portaria`;
    handleCopyMessage(blankTemplate);
  };

  const handleSendWhatsAppUrl = (apto: ApartmentProfile, phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const msg = generateWhatsAppCadastroRequest(apto);
    const url = clean
      ? `https://wa.me/55${clean}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApto) return;
    handleUpdate(editingApto);
    setEditingApto(null);
  };

  const getCleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getTypeBadge = (tipo: ApartmentType) => {
    switch (tipo) {
      case 'morador':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Home className="w-3 h-3 text-blue-600" />
            Morador
          </span>
        );
      case 'inquilino':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <User className="w-3 h-3 text-purple-600" />
            Inquilino
          </span>
        );
      case 'temporada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            Temporada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cadastros dos Apartamentos</h2>
            <p className="text-xs text-slate-500">
              Registro completo dos {apartments.length} cadastros de apartamentos com proprietário, celular, e-mail e tipo de ocupação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onSyncOfficialApartments && (
            <button
              type="button"
              onClick={onSyncOfficialApartments}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Sincronizar todos os 124 apartamentos com a base oficial real"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar Base Oficial</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyBlankTemplate}
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Copiar modelo de ficha cadastral para colar no WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Modelo WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Cadastrar Novo Apartamento"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cadastro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Lista Completa</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cadastro')}
            className={`pb-3 px-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'cadastro'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Cadastro Geral dos Apartamentos ({apartments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ocupacao')}
            className={`pb-3 px-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'ocupacao'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Mapa de Ocupação & Veículos em Tempo Real</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cadastro dos Apartamentos */}
      {activeTab === 'cadastro' && (
        <div className="space-y-4">
          {/* Quick Counter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => setFilterType('todos')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterType === 'todos'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[11px] opacity-75 font-medium">Total Geral</div>
              <div className="text-lg font-bold mt-0.5">{apartments.length} aptos</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('morador')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterType === 'morador'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-white hover:bg-blue-50/50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="text-[11px] opacity-75 font-medium flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-blue-600" />
                Moradores
              </div>
              <div className="text-lg font-bold mt-0.5">{countMorador} aptos</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('inquilino')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterType === 'inquilino'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-white hover:bg-purple-50/50 border-purple-200 text-purple-900'
              }`}
            >
              <div className="text-[11px] opacity-75 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Inquilinos
              </div>
              <div className="text-lg font-bold mt-0.5">{countInquilino} aptos</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('temporada')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterType === 'temporada'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-amber-50/50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="text-[11px] opacity-75 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Temporada
              </div>
              <div className="text-lg font-bold mt-0.5">{countTemporada} aptos</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('pendentes')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterType === 'pendentes'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-white hover:bg-rose-50/50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="text-[11px] opacity-75 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                A Preencher / Sem Tel.
              </div>
              <div className="text-lg font-bold mt-0.5">{countPendentes} aptos</div>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por apto, nome do proprietário, celular, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 text-[11px] font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Andar:
                </span>
                {['todos', '1', '2', '3', '4', '5', '6', '7', '8'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterFloor(f)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      filterFloor === f
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'todos' ? 'Todos' : `${f}º`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                title="Cadastrar Novo Apartamento"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Cadastro</span>
              </button>
            </div>
          </div>

          {/* Complete Apartments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-24">Apto</th>
                    <th className="py-3 px-4">Proprietário</th>
                    <th className="py-3 px-4">Celular / WhatsApp</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4">Tipo Apto</th>
                    <th className="py-3 px-4 text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredApartments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Nenhum apartamento encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredApartments.map((item) => (
                      <tr key={item.apto} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md text-xs font-mono inline-block">
                            {item.apto}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.proprietario}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {item.celular ? (
                              <>
                                <span className="font-medium text-slate-700">{item.celular}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsAppModal(item)}
                                  className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                  title="Enviar / Solicitar Ficha de Cadastro via WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenWhatsAppModal(item)}
                                className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded cursor-pointer transition-colors font-medium"
                                title="Solicitar dados cadastrais via WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 text-amber-600" />
                                <span>Solicitar Tel.</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.email ? (
                            <a
                              href={`mailto:${item.email}`}
                              className="hover:text-blue-700 hover:underline flex items-center gap-1 truncate max-w-xs"
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getTypeBadge(item.tipoApto)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsAppModal(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                              title="Solicitar / Atualizar Cadastro via WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingApto(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>
                Exibindo <strong className="text-slate-800">{filteredApartments.length}</strong> de{' '}
                <strong className="text-slate-800">{apartments.length}</strong> unidades
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mapa de Ocupação & Veículos */}
      {activeTab === 'ocupacao' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredApartments.map((item) => {
              const apto = item.apto;
              const info = getApartmentReservationData(apto);
              return (
                <div
                  key={apto}
                  className={`bg-white rounded-xl border p-4 shadow-2xs space-y-2.5 transition-all ${
                    info.status === 'Ocupado'
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : info.status === 'Reserva Confirmada'
                      ? 'border-blue-300 ring-1 ring-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                        {apto}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {apto[0]}º Andar
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        info.status === 'Ocupado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : info.status === 'Reserva Confirmada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {info.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="font-semibold text-slate-900 truncate" title={info.hospede}>
                      {info.hospede}
                    </div>
                    <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{info.telefone}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1 text-[11px] truncate">
                      <Car className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{info.veiculo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Lista de Cadastro dos Apartamentos */}
      <ApartmentsRegistryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apartments={apartments}
        onUpdateApartment={handleUpdate}
        onAddApartment={propOnAddApartment || handleAddNewApartment}
      />

      {/* Edit Single Apartment Modal */}
      {editingApto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl p-5 shadow-2xl max-w-md w-full space-y-4 border border-slate-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Editar Cadastro • Apto {editingApto.apto}
              </h3>
              <button
                type="button"
                onClick={() => setEditingApto(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome do Proprietário
                </label>
                <input
                  type="text"
                  value={editingApto.proprietario}
                  onChange={(e) =>
                    setEditingApto({ ...editingApto, proprietario: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Celular / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingApto.celular}
                    onChange={(e) =>
                      setEditingApto({ ...editingApto, celular: formatPhone(e.target.value) })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipo do Apartamento
                  </label>
                  <select
                    value={editingApto.tipoApto}
                    onChange={(e) =>
                      setEditingApto({
                        ...editingApto,
                        tipoApto: e.target.value as ApartmentType
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
                  >
                    <option value="morador">Morador</option>
                    <option value="inquilino">Inquilino</option>
                    <option value="temporada">Temporada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  E-mail de Contato <span className="text-slate-400 font-normal text-[11px]">(Opcional)</span>
                </label>
                <input
                  type="email"
                  value={editingApto.email}
                  placeholder="email@exemplo.com (opcional)"
                  onChange={(e) => setEditingApto({ ...editingApto, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observações Internas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={editingApto.observacoes || ''}
                  onChange={(e) =>
                    setEditingApto({ ...editingApto, observacoes: e.target.value })
                  }
                  placeholder="Ex: Contrato até dez/2026, imobiliária parceira, vaga de garagem extra..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingApto(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Novo Cadastro de Apartamento */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddNew}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full space-y-4 border border-slate-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Novo Cadastro de Apartamento
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira as informações do novo apartamento e proprietário
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Número do Apartamento (Apto) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 101, 805, Cob 01"
                    value={newAptoData.apto}
                    onChange={(e) =>
                      setNewAptoData({ ...newAptoData, apto: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipo do Apartamento *
                  </label>
                  <select
                    value={newAptoData.tipoApto}
                    onChange={(e) =>
                      setNewAptoData({
                        ...newAptoData,
                        tipoApto: e.target.value as ApartmentType
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
                  >
                    <option value="morador">🏠 Morador (Proprietário)</option>
                    <option value="inquilino">👤 Inquilino (Locação Fixa)</option>
                    <option value="temporada">⏱️ Temporada (Short Stay)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome do Proprietário / Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do proprietário ou locador"
                  value={newAptoData.proprietario}
                  onChange={(e) =>
                    setNewAptoData({ ...newAptoData, proprietario: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Celular / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    value={newAptoData.celular}
                    onChange={(e) =>
                      setNewAptoData({
                        ...newAptoData,
                        celular: formatPhone(e.target.value)
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    E-mail de Contato <span className="text-slate-400 font-normal text-[11px]">(Opcional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com (opcional)"
                    value={newAptoData.email}
                    onChange={(e) =>
                      setNewAptoData({ ...newAptoData, email: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observações Internas (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, vagas de garagem vinculadas, administradora..."
                  value={newAptoData.observacoes || ''}
                  onChange={(e) =>
                    setNewAptoData({ ...newAptoData, observacoes: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Novo Cadastro</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Solicitação de Cadastro via WhatsApp */}
      {whatsAppModalApto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full space-y-4 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Solicitar Cadastro via WhatsApp • Apto {whatsAppModalApto.apto}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {whatsAppModalApto.proprietario || 'Morador a contatar'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalApto(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Phone field */}
            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 space-y-2">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Número de Celular / WhatsApp de Destino (com DDD):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="(82) 99999-9999"
                  value={targetPhoneInput}
                  onChange={(e) => setTargetPhoneInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppUrl(whatsAppModalApto, targetPhoneInput)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Mensagem Pronta para Envio:</span>
                <span className="text-[11px] text-slate-400">Padrão Oficial Condomínio</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed select-all">
                {generateWhatsAppCadastroRequest(whatsAppModalApto)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => handleCopyMessage(generateWhatsAppCadastroRequest(whatsAppModalApto))}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {copiedFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setWhatsAppModalApto(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-70 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

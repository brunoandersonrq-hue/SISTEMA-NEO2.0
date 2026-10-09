import React, { useState, useMemo } from 'react';
import { Flame, Utensils, Calendar, Plus, CheckCircle2, Clock, Search, X, CheckCheck, Ban, AlertCircle, Coffee } from 'lucide-react';
import { AmenityReservation, AmenitySpace, AmenityStatus } from '../types.ts';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';

interface PartyHallViewProps {
  amenities: AmenityReservation[];
  onAddAmenity: (reservation: AmenityReservation) => void;
  onUpdateAmenityStatus?: (id: string, newStatus: AmenityStatus) => void;
}

export const PartyHallView: React.FC<PartyHallViewProps> = ({
  amenities,
  onAddAmenity,
  onUpdateAmenityStatus
}) => {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'reservado' | 'cancelado' | 'realizado'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<{
    espaco: AmenitySpace;
    apto: string;
    responsavel: string;
    data: string;
    periodo: AmenityReservation['periodo'];
    observacoes: string;
  }>({
    espaco: 'salao',
    apto: '',
    responsavel: '',
    data: '2026-09-26',
    periodo: 'almoco',
    observacoes: ''
  });

  const getEspacoInfo = (espaco: string) => {
    switch (espaco) {
      case 'salao':
        return {
          label: 'Salão de Festas',
          iconBg: 'bg-purple-100 text-purple-700',
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
          horario: '08h00 às 00h00',
          icon: Utensils
        };
      case 'cyber_cafe':
        return {
          label: 'Cyber Café',
          iconBg: 'bg-cyan-100 text-cyan-800',
          badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          horario: '07h00 às 22h00',
          icon: Coffee
        };
      case 'churrasqueira_02':
        return {
          label: 'Churrasqueira 02',
          iconBg: 'bg-orange-100 text-orange-700',
          badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
          horario: '08h00 às 18h00',
          icon: Flame
        };
      case 'churrasqueira_01':
      case 'churrasqueira':
      default:
        return {
          label: 'Churrasqueira 01',
          iconBg: 'bg-amber-100 text-amber-700',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          horario: '08h00 às 18h00',
          icon: Flame
        };
    }
  };

  const normalizeStatus = (status: string): 'reservado' | 'cancelado' | 'realizado' => {
    if (status === 'cancelada' || status === 'cancelado') return 'cancelado';
    if (status === 'realizado') return 'realizado';
    return 'reservado';
  };

  const getStatusBadge = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'realizado':
        return {
          label: 'REALIZADO',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: CheckCheck
        };
      case 'cancelado':
        return {
          label: 'CANCELADO',
          className: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: Ban
        };
      case 'reservado':
      default:
        return {
          label: 'RESERVADO',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2
        };
    }
  };

  const counts = useMemo(() => {
    const all = amenities.length;
    const reservado = amenities.filter(a => normalizeStatus(a.status) === 'reservado').length;
    const realizado = amenities.filter(a => normalizeStatus(a.status) === 'realizado').length;
    const cancelado = amenities.filter(a => normalizeStatus(a.status) === 'cancelado').length;
    return { all, reservado, realizado, cancelado };
  }, [amenities]);

  const filteredAmenities = useMemo(() => {
    return amenities.filter(a => {
      // Status filter
      const itemNormStatus = normalizeStatus(a.status);
      if (statusFilter !== 'todos' && itemNormStatus !== statusFilter) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const espacoLabel = getEspacoInfo(a.espaco).label.toLowerCase();
        const matchApto = a.apto.toLowerCase().includes(q);
        const matchResp = a.responsavel.toLowerCase().includes(q);
        const matchData = a.data.includes(q) || a.data.split('-').reverse().join('/').includes(q);
        const matchEspaco = espacoLabel.includes(q);
        const matchStatus = itemNormStatus.includes(q);
        const matchPeriodo = a.periodo.toLowerCase().includes(q);
        const matchObs = a.observacoes ? a.observacoes.toLowerCase().includes(q) : false;

        if (!matchApto && !matchResp && !matchData && !matchEspaco && !matchStatus && !matchPeriodo && !matchObs) {
          return false;
        }
      }

      return true;
    });
  }, [amenities, statusFilter, searchQuery]);

  // Check if current form data conflicts with any existing active reservation
  const conflict = useMemo(() => {
    if (!formData.data || !formData.espaco || !formData.periodo) return null;

    return amenities.find((item) => {
      // Ignore cancelled bookings
      if (normalizeStatus(item.status) === 'cancelado') return false;

      // Space check (treating 'churrasqueira' same as 'churrasqueira_01')
      const itemEspaco = item.espaco === 'churrasqueira' ? 'churrasqueira_01' : item.espaco;
      const curEspaco = formData.espaco;
      if (itemEspaco !== curEspaco) return false;

      // Date check
      if (item.data !== formData.data) return false;

      // Period overlap check
      if (item.periodo === 'dia_todo' || formData.periodo === 'dia_todo') {
        return true;
      }
      return item.periodo === formData.periodo;
    }) || null;
  }, [formData.espaco, formData.data, formData.periodo, amenities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apto || !formData.responsavel || !formData.data) return;
    if (conflict) return;

    onAddAmenity({
      id: `amen-${Date.now()}`,
      espaco: formData.espaco,
      apto: formData.apto,
      responsavel: formData.responsavel,
      data: formData.data,
      periodo: formData.periodo,
      observacoes: formData.observacoes.trim() || undefined,
      status: 'reservado'
    });

    setShowForm(false);
    setFormData({
      espaco: 'salao',
      apto: '',
      responsavel: '',
      data: '2026-09-26',
      periodo: 'almoco',
      observacoes: ''
    });
  };

  const handleStatusChange = (id: string, newStatus: AmenityStatus) => {
    if (onUpdateAmenityStatus) {
      onUpdateAmenityStatus(id, newStatus);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reserva de Espaços Comuns</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Salão: 08h00 às 00h00</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Coffee className="w-3.5 h-3.5 text-cyan-600" />
            <span>Cyber Café: 07h00 às 22h00</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Churrasqueiras: 08h00 às 18h00</span>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Fechar Formulário' : 'Nova Reserva'}</span>
          </button>
        </div>
      </div>

      {/* Reservation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border-2 border-amber-500/40 shadow-xs space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cadastrar Reserva de Área Comum
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Horário do espaço selecionado:{' '}
              <strong className="text-slate-800">{getEspacoInfo(formData.espaco).horario}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Espaço</label>
              <select
                value={formData.espaco}
                onChange={(e) => setFormData({ ...formData, espaco: e.target.value as AmenitySpace })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
              >
                <option value="salao">Salão de Festas (08h00 às 00h00)</option>
                <option value="cyber_cafe">Cyber Café (07h00 às 22h00)</option>
                <option value="churrasqueira_01">Churrasqueira 01 (08h00 às 18h00)</option>
                <option value="churrasqueira_02">Churrasqueira 02 (08h00 às 18h00)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Apto Solicitante</label>
              <select
                value={formData.apto}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    apto: val,
                    responsavel:
                      val === 'Condomínio' && (!prev.responsavel || prev.responsavel.trim() === '')
                        ? 'Administração / Condomínio'
                        : prev.responsavel
                  }));
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium bg-white"
                required
              >
                <option value="">Selecione o Apto / Condomínio...</option>
                <option value="Condomínio" className="font-bold text-amber-900 bg-amber-50">
                  🏢 Condomínio (Administração)
                </option>
                <optgroup label="1º Andar (101 a 116)">
                  {BUILDING_APARTMENTS.slice(0, 16).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="2º Andar (201 a 216)">
                  {BUILDING_APARTMENTS.slice(16, 32).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="3º Andar (301 a 316)">
                  {BUILDING_APARTMENTS.slice(32, 48).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="4º Andar (401 a 416)">
                  {BUILDING_APARTMENTS.slice(48, 64).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="5º Andar (501 a 516)">
                  {BUILDING_APARTMENTS.slice(64, 80).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="6º Andar (601 a 616)">
                  {BUILDING_APARTMENTS.slice(80, 96).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="7º Andar (701 a 724)">
                  {BUILDING_APARTMENTS.slice(96, 120).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="8º Andar (801 a 804)">
                  {BUILDING_APARTMENTS.slice(120, 124).map((ap) => (
                    <option key={ap} value={ap}>
                      Apto {ap}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Responsável / Morador</label>
              <input
                type="text"
                placeholder="Nome do condômino"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Data do Evento</label>
                {conflict && (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" />
                    Indisponível
                  </span>
                )}
              </div>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                  conflict
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500 font-medium'
                    : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Conflict Warning Alert */}
          {conflict && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-900 text-xs">
                  Reserva Não Permitida: Data e Horário já Ocupados!
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  O <strong>{getEspacoInfo(conflict.espaco).label}</strong> já possui uma reserva ativa para{' '}
                  <strong>{conflict.data.split('-').reverse().join('/')}</strong> no período{' '}
                  <strong>
                    {conflict.periodo === 'dia_todo'
                      ? 'Dia Todo'
                      : conflict.periodo === 'almoco'
                      ? 'Almoço'
                      : 'Jantar'}
                  </strong>{' '}
                  (Apto <strong>{conflict.apto}</strong> • {conflict.responsavel}).
                </p>
                <p className="text-[10px] text-rose-600 font-medium">
                  Por favor, escolha outra data ou selecione um período vago para poder salvar.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Período de Utilização</label>
              <select
                value={formData.periodo}
                onChange={(e) => setFormData({ ...formData, periodo: e.target.value as AmenityReservation['periodo'] })}
                className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                  conflict
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                }`}
              >
                {formData.espaco === 'salao' ? (
                  <>
                    <option value="almoco">Almoço (08:00 às 15:30)</option>
                    <option value="jantar">Jantar / Noite (16:00 às 00:00)</option>
                    <option value="dia_todo">Dia Todo (08:00 às 00:00)</option>
                  </>
                ) : formData.espaco === 'cyber_cafe' ? (
                  <>
                    <option value="almoco">Manhã (07:00 às 12:00)</option>
                    <option value="jantar">Tarde / Noite (13:00 às 22:00)</option>
                    <option value="dia_todo">Dia Todo (07:00 às 22:00)</option>
                  </>
                ) : (
                  <>
                    <option value="almoco">Manhã / Almoço (08:00 às 13:00)</option>
                    <option value="jantar">Tarde (13:00 às 18:00)</option>
                    <option value="dia_todo">Dia Todo (08:00 às 18:00)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Observações
              </label>
              <input
                type="text"
                placeholder="Ex: Aniversário, convidados externos, som, etc."
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!conflict}
              className={`font-semibold text-xs px-5 py-2 rounded-lg transition-colors shadow-xs ${
                conflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
                  : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
              }`}
              title={conflict ? 'Não é possível gravar: data e horário já reservados' : 'Gravar Reserva'}
            >
              {conflict ? 'Horário Já Reservado' : 'Gravar Reserva'}
            </button>
          </div>
        </form>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header with Title and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Agenda Oficial de Eventos e Reservas
              </h3>
              <p className="text-[11px] text-slate-500">
                {filteredAmenities.length} de {amenities.length} agendamentos exibidos
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por apto, morador, espaço, data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
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
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 mr-0.5">Filtrar por Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('reservado')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'reservado'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Reservado ({counts.reservado})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('realizado')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'realizado'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <CheckCheck className="w-3 h-3" />
                <span>Realizado ({counts.realizado})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('cancelado')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'cancelado'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <Ban className="w-3 h-3" />
                <span>Cancelado ({counts.cancelado})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="divide-y divide-slate-100">
          {filteredAmenities.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">Nenhum agendamento encontrado</p>
              <p className="text-[11px] text-slate-400">
                {searchQuery
                  ? `Não encontramos resultados para "${searchQuery}". Tente outro termo.`
                  : 'Nenhuma reserva cadastrada para os filtros selecionados.'}
              </p>
              {(searchQuery || statusFilter !== 'todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('todos');
                  }}
                  className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          ) : (
            filteredAmenities.map((item) => {
              const info = getEspacoInfo(item.espaco);
              const SpaceIcon = info.icon;
              const statusInfo = getStatusBadge(item.status);
              const StatusIcon = statusInfo.icon;
              const currentNormStatus = normalizeStatus(item.status);

              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${info.iconBg}`}>
                      <SpaceIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {info.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {item.apto.toLowerCase().includes('condom') ? 'Condomínio' : `Apto ${item.apto}`}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          • {info.horario}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Responsável: <strong className="text-slate-800">{item.responsavel}</strong>
                      </p>
                      {item.observacoes && (
                        <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 mt-1 inline-block max-w-md">
                          <span className="font-semibold text-amber-950">Obs:</span> {item.observacoes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5 self-end md:self-auto">
                    {/* Date and Period */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-blue-700" />
                        <span>{item.data.split('-').reverse().join('/')}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 capitalize">
                        Período: {item.periodo === 'dia_todo' ? 'Dia Todo' : item.periodo}
                      </span>
                    </div>

                    {/* Status Badge & Status Selector */}
                    <div className="flex flex-col items-end gap-1.5 min-w-[150px]">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </span>

                      {/* Status Change Selector */}
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 pl-1">Status:</span>
                        <select
                          value={currentNormStatus}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as AmenityStatus)}
                          className="text-[11px] font-bold py-0.5 px-2 bg-white rounded border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
                          title="Alterar status desta reserva"
                        >
                          <option value="reservado">RESERVADO</option>
                          <option value="realizado">REALIZADO</option>
                          <option value="cancelado">CANCELADO</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

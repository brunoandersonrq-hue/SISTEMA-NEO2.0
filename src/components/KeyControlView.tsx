import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Building2,
  User,
  Calendar,
  AlertCircle,
  Printer,
  RotateCcw,
  Check,
  FileText,
  Filter,
  ShieldCheck,
  ArrowUpDown,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { KeyControlRecord, ApartmentProfile } from '../types.ts';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';
import { getBrasiliaCurrentDateTime, formatBrasiliaDateTime } from '../utils/formatters.ts';

interface KeyControlViewProps {
  keyRecords: KeyControlRecord[];
  onAddKeyRecord: (record: Omit<KeyControlRecord, 'id' | 'criadoEm'>) => void;
  onUpdateKeyRecord: (id: string, updates: Partial<KeyControlRecord>) => void;
  onDeleteKeyRecord: (id: string) => void;
  apartments?: ApartmentProfile[];
  currentUserName?: string;
  isAdmin?: boolean;
  currentUserRole?: string;
}

const COMMON_AREAS = [
  'Salão de Festas',
  'Sala de Jogos',
  'Sala Academia',
  'Cyber Café',
  'Churrasqueira 01',
  'Churrasqueira 02',
  'Casa de Máquinas',
  'Portão / Garagem',
  'DML / Almoxarifado',
  'Guarita / Portaria',
  'Condomínio Geral'
];

export const KeyControlView: React.FC<KeyControlViewProps> = ({
  keyRecords,
  onAddKeyRecord,
  onUpdateKeyRecord,
  onDeleteKeyRecord,
  apartments = [],
  currentUserName = 'Operador de Portaria',
  isAdmin = false,
  currentUserRole = 'portaria'
}) => {
  // Determine if active user has administrator privileges
  const effectiveIsAdmin = useMemo(() => {
    if (isAdmin) return true;
    if (currentUserRole === 'admin') return true;
    try {
      const saved = localStorage.getItem('neo_condo_current_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' || parsed.username?.toLowerCase() === 'admin') {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, [isAdmin, currentUserRole]);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendentes' | 'devolvidas'>('todos');
  const [aptoFilter, setAptoFilter] = useState('todos');
  const [sortBy, setSortBy] = useState<'recente' | 'antigo' | 'apto'>('recente');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeyControlRecord | null>(null);

  // Restricted Access Dialog Notice
  const [restrictedNotice, setRestrictedNotice] = useState<{
    title: string;
    message: string;
    type?: 'edit' | 'delete';
  } | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    apto: '',
    chaveIdentificacao: 'Chave Principal',
    quemRetirou: '',
    dataHoraRetirada: getBrasiliaCurrentDateTime(),
    devolucao: false,
    quemDevolveu: '',
    dataHoraDevolucao: '',
    observacoes: ''
  });

  // Quick Return Modal State
  const [quickReturnRecord, setQuickReturnRecord] = useState<KeyControlRecord | null>(null);
  const [quickReturnTime, setQuickReturnTime] = useState(getBrasiliaCurrentDateTime());
  const [quickReturnPerson, setQuickReturnPerson] = useState('');
  const [quickReturnNotes, setQuickReturnNotes] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      apto: '',
      chaveIdentificacao: 'Chave Principal',
      quemRetirou: '',
      dataHoraRetirada: getBrasiliaCurrentDateTime(),
      devolucao: false,
      quemDevolveu: '',
      dataHoraDevolucao: '',
      observacoes: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal - with permission check
  const handleOpenEditModal = (rec: KeyControlRecord) => {
    // Regra: Após registrada devolução, só quem pode editar é o usuário administrador
    if (rec.devolucao && !effectiveIsAdmin) {
      setRestrictedNotice({
        title: 'Edição Bloqueada (Somente Administrador)',
        message: 'Após a devolução da chave ter sido registrada, somente o usuário Administrador tem permissão para editar os dados deste registro.',
        type: 'edit'
      });
      return;
    }

    setEditingRecord(rec);
    setFormData({
      apto: rec.apto,
      chaveIdentificacao: rec.chaveIdentificacao || 'Chave Principal',
      quemRetirou: rec.quemRetirou,
      dataHoraRetirada: rec.dataHoraRetirada || getBrasiliaCurrentDateTime(),
      devolucao: !!rec.devolucao,
      quemDevolveu: rec.quemDevolveu || '',
      dataHoraDevolucao: rec.dataHoraDevolucao || (rec.devolucao ? getBrasiliaCurrentDateTime() : ''),
      observacoes: rec.observacoes || ''
    });
    setIsModalOpen(true);
  };

  // Request Delete - with permission check
  const handleRequestDelete = (rec: KeyControlRecord) => {
    // Regra: Só quem pode excluir registro é o usuário administrador
    if (!effectiveIsAdmin) {
      setRestrictedNotice({
        title: 'Exclusão Bloqueada (Somente Administrador)',
        message: 'Somente o usuário Administrador possui permissão para excluir registros do histórico de controle de chaves.',
        type: 'delete'
      });
      return;
    }
    setDeleteConfirmId(rec.id);
  };

  // Open Quick Return Modal (operators can log returns for pending keys)
  const handleOpenQuickReturn = (rec: KeyControlRecord) => {
    setQuickReturnRecord(rec);
    setQuickReturnTime(getBrasiliaCurrentDateTime());
    setQuickReturnPerson(rec.quemRetirou);
    setQuickReturnNotes(rec.observacoes ? `${rec.observacoes} | Devolvida em ordem.` : 'Devolvida sem avarias.');
  };

  // Confirm Quick Return
  const handleConfirmQuickReturn = () => {
    if (!quickReturnRecord) return;
    onUpdateKeyRecord(quickReturnRecord.id, {
      devolucao: true,
      dataHoraDevolucao: quickReturnTime || getBrasiliaCurrentDateTime(),
      quemDevolveu: quickReturnPerson || quickReturnRecord.quemRetirou,
      observacoes: quickReturnNotes,
      porteiroDevolucao: currentUserName,
      atualizadoEm: new Date().toISOString()
    });
    setQuickReturnRecord(null);
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apto.trim()) {
      alert('Por favor, informe ou selecione o apartamento/local.');
      return;
    }
    if (!formData.quemRetirou.trim()) {
      alert('Por favor, informe quem retirou a chave.');
      return;
    }

    if (editingRecord) {
      // Security guard: If record was returned and user is not admin, disallow saving
      if (editingRecord.devolucao && !effectiveIsAdmin) {
        setRestrictedNotice({
          title: 'Permissão Negada',
          message: 'Após a devolução registrada, somente o usuário Administrador pode alterar este registro.',
          type: 'edit'
        });
        return;
      }

      onUpdateKeyRecord(editingRecord.id, {
        apto: formData.apto.trim(),
        chaveIdentificacao: formData.chaveIdentificacao.trim() || 'Chave Principal',
        quemRetirou: formData.quemRetirou.trim(),
        dataHoraRetirada: formData.dataHoraRetirada,
        devolucao: formData.devolucao,
        quemDevolveu: formData.devolucao ? formData.quemDevolveu.trim() || formData.quemRetirou.trim() : '',
        dataHoraDevolucao: formData.devolucao ? (formData.dataHoraDevolucao || getBrasiliaCurrentDateTime()) : '',
        observacoes: formData.observacoes.trim(),
        porteiroDevolucao: formData.devolucao ? (editingRecord.porteiroDevolucao || currentUserName) : undefined,
        atualizadoEm: new Date().toISOString()
      });
    } else {
      onAddKeyRecord({
        apto: formData.apto.trim(),
        chaveIdentificacao: formData.chaveIdentificacao.trim() || 'Chave Principal',
        quemRetirou: formData.quemRetirou.trim(),
        dataHoraRetirada: formData.dataHoraRetirada,
        devolucao: formData.devolucao,
        quemDevolveu: formData.devolucao ? formData.quemDevolveu.trim() || formData.quemRetirou.trim() : '',
        dataHoraDevolucao: formData.devolucao ? (formData.dataHoraDevolucao || getBrasiliaCurrentDateTime()) : '',
        observacoes: formData.observacoes.trim(),
        porteiroRetirada: currentUserName,
        porteiroDevolucao: formData.devolucao ? currentUserName : undefined
      });
    }

    setIsModalOpen(false);
  };

  // KPIs
  const totalKeys = keyRecords.length;
  const pendingKeys = useMemo(() => keyRecords.filter((k) => !k.devolucao), [keyRecords]);
  const returnedKeys = useMemo(() => keyRecords.filter((k) => !!k.devolucao), [keyRecords]);

  // Today activity
  const todayStr = useMemo(() => getBrasiliaCurrentDateTime().slice(0, 10), []);
  const todayActivityCount = useMemo(() => {
    return keyRecords.filter((k) => {
      const retiradaToday = k.dataHoraRetirada?.startsWith(todayStr);
      const devolucaoToday = k.dataHoraDevolucao?.startsWith(todayStr);
      return retiradaToday || devolucaoToday;
    }).length;
  }, [keyRecords, todayStr]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return keyRecords
      .filter((rec) => {
        // Status filter
        if (statusFilter === 'pendentes' && rec.devolucao) return false;
        if (statusFilter === 'devolvidas' && !rec.devolucao) return false;

        // Apto filter
        if (aptoFilter !== 'todos' && rec.apto.toLowerCase() !== aptoFilter.toLowerCase()) return false;

        // Search text
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchApto = rec.apto.toLowerCase().includes(term);
          const matchQuem = rec.quemRetirou.toLowerCase().includes(term);
          const matchChave = (rec.chaveIdentificacao || '').toLowerCase().includes(term);
          const matchObs = (rec.observacoes || '').toLowerCase().includes(term);
          const matchQuemDevolveu = (rec.quemDevolveu || '').toLowerCase().includes(term);
          if (!matchApto && !matchQuem && !matchChave && !matchObs && !matchQuemDevolveu) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'apto') {
          return a.apto.localeCompare(b.apto, undefined, { numeric: true });
        }
        if (sortBy === 'antigo') {
          return (a.dataHoraRetirada || '').localeCompare(b.dataHoraRetirada || '');
        }
        // default: recente
        return (b.dataHoraRetirada || '').localeCompare(a.dataHoraRetirada || '');
      });
  }, [keyRecords, statusFilter, aptoFilter, searchTerm, sortBy]);

  // Available unique apartments in building for suggestions
  const apartmentSuggestions = useMemo(() => {
    const list = [...BUILDING_APARTMENTS];
    return list;
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-600/30 border border-blue-500/40 rounded-2xl text-blue-300 shadow-inner shrink-0">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Controle de Chaves
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Portaria & Recepção
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Gestão rigorosa de retiradas e devoluções de chaves da portaria com controle de apartamento,
                responsável pela retirada, datas e horas totalmente editáveis e observações.
              </p>

              {/* Permission & Role Banner */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
                {effectiveIsAdmin ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Usuário Administrador ({currentUserName}) &bull; Permissão total: edição pós-devolução e exclusão liberadas</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Operador de Portaria ({currentUserName}) &bull; Retiradas e devoluções liberadas. Edição pós-devolução e exclusão restritas ao Administrador</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-xs"
              title="Imprimir relatório de controle de chaves"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-nova-retirada-chave"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Retirada de Chave</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Registros</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalKeys}</span>
            <span className="text-xs text-slate-500">movimentações</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Histórico completo da portaria</p>
        </div>

        {/* Em Uso / Pendentes */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-2xs relative overflow-hidden bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Em Uso / Não Devolvidas</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingKeys.length}</span>
            <span className="text-xs text-amber-700 font-medium">chaves fora</span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {pendingKeys.length > 0 ? 'Aguardando devolução na guarita' : 'Nenhuma chave em posse externa'}
          </p>
        </div>

        {/* Devolvidas */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Devolvidas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{returnedKeys.length}</span>
            <span className="text-xs text-emerald-700 font-medium">no claviculário</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Baixa realizada com sucesso</p>
        </div>

        {/* Movimentações Hoje */}
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-2xs bg-gradient-to-br from-blue-50/40 to-white">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">Movimentações Hoje</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700">{todayActivityCount}</span>
            <span className="text-xs text-blue-600 font-medium">hoje</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Retiradas ou devoluções na data</p>
        </div>
      </div>

      {/* Search, Status Tabs and Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({totalKeys})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pendentes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'pendentes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Em Uso / Pendentes ({pendingKeys.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('devolvidas')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'devolvidas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Devolvidas ({returnedKeys.length})</span>
            </button>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Ordenar:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="recente">Mais Recente Primeiro</option>
                <option value="antigo">Mais Antigo Primeiro</option>
                <option value="apto">Apartamento / Local</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search input and Apartment dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por apartamento, quem retirou, documento ou observação..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={aptoFilter}
              onChange={(e) => setAptoFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="todos">Todos os Apartamentos / Locais</option>
              <optgroup label="Áreas Comuns">
                {COMMON_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Apartamentos (101 ao 804)">
                {apartmentSuggestions.map((ap) => (
                  <option key={ap} value={ap}>
                    Apto {ap}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum registro de chave encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'todos' || aptoFilter !== 'todos'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros ou a busca.'
                : 'Ainda não há chaves cadastradas no sistema. Clique no botão abaixo para registrar uma nova retirada.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Retirada de Chave</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Apto / Local</th>
                  <th className="py-3 px-4">Quem Retirou</th>
                  <th className="py-3 px-4">Data e Hora (Retirada)</th>
                  <th className="py-3 px-4">Devolução</th>
                  <th className="py-3 px-4">Data e Hora (Devolução)</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-right">
                    <span
                      className="inline-flex items-center gap-1 justify-end cursor-help"
                      title="Acesso controlado por perfil: exclusão e edição pós-devolução exclusivas para Administrador"
                    >
                      <span>Ações</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRecords.map((rec) => {
                  const isPending = !rec.devolucao;
                  const canEdit = !rec.devolucao || effectiveIsAdmin;
                  const canDelete = effectiveIsAdmin;

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Apto */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            <span>{rec.apto}</span>
                          </span>
                        </div>
                        {rec.chaveIdentificacao && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 ml-0.5">
                            {rec.chaveIdentificacao}
                          </div>
                        )}
                      </td>

                      {/* Quem Retirou */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{rec.quemRetirou}</span>
                            {rec.porteiroRetirada && (
                              <span className="text-[10px] text-slate-500">
                                Portaria: {rec.porteiroRetirada}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Data e Hora Retirada (Editável) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatBrasiliaDateTime(rec.dataHoraRetirada, false)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Data e hora editável
                        </span>
                      </td>

                      {/* Status Devolução */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.devolucao ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Devolvida</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Em Uso (Pendente)</span>
                          </span>
                        )}
                      </td>

                      {/* Data e Hora Devolução (Editável) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.devolucao ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{formatBrasiliaDateTime(rec.dataHoraDevolucao, false)}</span>
                            </div>
                            {rec.quemDevolveu && (
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                Entregue por: {rec.quemDevolveu}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[11px] text-amber-700 font-medium block">
                              Aguardando devolução
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickReturn(rec)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Registrar devolução agora com data e hora editável"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Registrar Devolução</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Observações */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {rec.observacoes ? (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-snug" title={rec.observacoes}>
                            {rec.observacoes}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sem observações</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edição: Só quem pode editar após devolução registrada é o administrador */}
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(rec)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                rec.devolucao
                                  ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title={
                                rec.devolucao
                                  ? 'Editar registro pós-devolução (Autorizado: Administrador)'
                                  : 'Editar registro de chave em andamento'
                              }
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setRestrictedNotice({
                                  title: 'Edição Bloqueada (Somente Administrador)',
                                  message:
                                    'Após a devolução da chave ter sido registrada, somente o usuário Administrador tem permissão para editar os dados deste registro.',
                                  type: 'edit'
                                })
                              }
                              className="p-1.5 text-amber-600/80 hover:text-amber-800 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                              title="Edição bloqueada: Chave já devolvida. Somente Administrador pode editar."
                            >
                              <Lock className="w-4 h-4 text-amber-600" />
                            </button>
                          )}

                          {/* Exclusão: Só quem pode excluir registro é o usuário administrador */}
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(rec)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir este registro (Autorizado: Administrador)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setRestrictedNotice({
                                  title: 'Exclusão Bloqueada (Somente Administrador)',
                                  message:
                                    'Somente o usuário Administrador possui permissão para excluir registros do histórico de controle de chaves.',
                                  type: 'delete'
                                })
                              }
                              className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                              title="Exclusão bloqueada: Apenas Administrador pode excluir registros."
                            >
                              <Trash2 className="w-4 h-4 text-slate-300" />
                            </button>
                          )}
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

      {/* Modal Principal: Nova Retirada ou Edição Completa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-scale-up my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRecord ? 'Editar Controle de Chave' : 'Registrar Retirada de Chave'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Apto, quem retirou, data/hora editável, devolução e observações
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Special Admin banner when editing an already returned record */}
              {editingRecord && editingRecord.devolucao && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Edição com Privilégios de Administrador</span>
                    <span className="text-[11px] text-indigo-700 leading-tight block">
                      Esta chave já possui devolução registrada. Você está alterando este histórico com permissão autorizada de Administrador.
                    </span>
                  </div>
                </div>
              )}

              {/* Row 1: Apto e Identificação da Chave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Apartamento / Local *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="apartment-options-list"
                      required
                      value={formData.apto}
                      onChange={(e) => setFormData({ ...formData, apto: e.target.value })}
                      placeholder="Ex: 101, 302, Salão de Festas..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    <datalist id="apartment-options-list">
                      {COMMON_AREAS.map((a) => (
                        <option key={a} value={a} />
                      ))}
                      {apartmentSuggestions.map((a) => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>
                  <span className="text-[10px] text-slate-500">Selecione ou digite o número</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Identificação da Chave
                  </label>
                  <input
                    type="text"
                    value={formData.chaveIdentificacao}
                    onChange={(e) => setFormData({ ...formData, chaveIdentificacao: e.target.value })}
                    placeholder="Ex: Chave Principal, Cópia, Tag..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Opcional (padrão: Chave Principal)</span>
                </div>
              </div>

              {/* Row 2: Quem Retirou */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quem Retirou *
                </label>
                <input
                  type="text"
                  required
                  value={formData.quemRetirou}
                  onChange={(e) => setFormData({ ...formData, quemRetirou: e.target.value })}
                  placeholder="Nome completo de quem retirou (morador, hóspede, prestador, corretor...)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-500">
                  Responsável físico pela retirada na guarita
                </span>
              </div>

              {/* Row 3: Data e Hora de Retirada (EDITÁVEL) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Data e Hora da Retirada (Editável) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, dataHoraRetirada: getBrasiliaCurrentDateTime() })}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Agora (Horário Atual)
                  </button>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={formData.dataHoraRetirada}
                  onChange={(e) => setFormData({ ...formData, dataHoraRetirada: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Você pode alterar livremente para registrar retiradas passadas ou horários exatos.
                </span>
              </div>

              {/* Row 4: Status Devolução Switch */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Status da Devolução</span>
                    <span className="text-[11px] text-slate-500">
                      {formData.devolucao
                        ? 'Chave já foi devolvida e está no claviculário'
                        : 'Chave ainda em uso / pendente de devolução'}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.devolucao}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          devolucao: checked,
                          dataHoraDevolucao: checked ? (formData.dataHoraDevolucao || getBrasiliaCurrentDateTime()) : '',
                          quemDevolveu: checked ? (formData.quemDevolveu || formData.quemRetirou) : ''
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Row 5: Se Devolvida -> Data e Hora da Devolução (EDITÁVEL) e Quem Devolveu */}
              {formData.devolucao && (
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Data e Hora (Devolução) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, dataHoraDevolucao: getBrasiliaCurrentDateTime() })}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          Agora
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        required={formData.devolucao}
                        value={formData.dataHoraDevolucao}
                        onChange={(e) => setFormData({ ...formData, dataHoraDevolucao: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-emerald-800">Totalmente editável</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                        Quem Devolveu / Entregou
                      </label>
                      <input
                        type="text"
                        value={formData.quemDevolveu}
                        onChange={(e) => setFormData({ ...formData, quemDevolveu: e.target.value })}
                        placeholder="Nome de quem devolveu"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-emerald-800">
                        Padrão: {formData.quemRetirou || 'mesma pessoa'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 6: Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Motivo da retirada, autorização pelo morador, vistoria com corretor, reparo autorizado..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecord ? 'Salvar Alterações' : 'Confirmar Retirada'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido: Baixa / Registro de Devolução */}
      {quickReturnRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-emerald-300">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registrar Devolução de Chave</h3>
                  <p className="text-xs text-emerald-200">
                    Apto {quickReturnRecord.apto} • {quickReturnRecord.quemRetirou}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickReturnRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Apartamento:</span>
                  <span className="font-bold text-slate-800">{quickReturnRecord.apto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retirada por:</span>
                  <span className="font-bold text-slate-800">{quickReturnRecord.quemRetirou}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data/Hora da Retirada:</span>
                  <span className="font-semibold text-slate-800">
                    {formatBrasiliaDateTime(quickReturnRecord.dataHoraRetirada, false)}
                  </span>
                </div>
              </div>

              {/* Data e hora devolução (EDITÁVEL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Data e Hora da Devolução (Editável) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setQuickReturnTime(getBrasiliaCurrentDateTime())}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    Agora (Horário Atual)
                  </button>
                </div>
                <input
                  type="datetime-local"
                  required
                  value={quickReturnTime}
                  onChange={(e) => setQuickReturnTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Quem Devolveu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quem Devolveu na Guarita
                </label>
                <input
                  type="text"
                  value={quickReturnPerson}
                  onChange={(e) => setQuickReturnPerson(e.target.value)}
                  placeholder="Nome de quem devolveu"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Observações da Devolução */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações da Devolução
                </label>
                <textarea
                  rows={2}
                  value={quickReturnNotes}
                  onChange={(e) => setQuickReturnNotes(e.target.value)}
                  placeholder="Ex: Devolvida sem avarias, testada na portaria..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickReturnRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQuickReturn}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Devolução</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Excluir Registro?</h4>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza de que deseja remover este registro do histórico de controle de chaves?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    if (!effectiveIsAdmin) {
                      setDeleteConfirmId(null);
                      setRestrictedNotice({
                        title: 'Exclusão Bloqueada (Somente Administrador)',
                        message: 'Somente o usuário Administrador possui permissão para excluir registros de controle de chaves.',
                        type: 'delete'
                      });
                      return;
                    }
                    onDeleteKeyRecord(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restricted Access Information Modal */}
      {restrictedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-sm w-full p-5 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">{restrictedNotice.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {restrictedNotice.message}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Controle de Acesso & Segurança:</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                {restrictedNotice.type === 'edit'
                  ? 'Registros com devolução concluída tornam-se imutáveis para operadores de portaria, garantindo a integridade dos acessos ao condomínio.'
                  : 'A exclusão de registros do histórico da portaria é uma ação restrita unicamente a administradores.'}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setRestrictedNotice(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

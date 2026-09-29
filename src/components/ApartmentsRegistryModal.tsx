import React, { useState } from 'react';
import {
  Building2,
  Search,
  X,
  Phone,
  Mail,
  User,
  Home,
  Clock,
  Edit2,
  Check,
  Filter,
  Download,
  MessageSquare,
  Plus
} from 'lucide-react';
import { ApartmentProfile, ApartmentType } from '../types.ts';
import { formatPhone } from '../utils/formatters.ts';

interface ApartmentsRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartments: ApartmentProfile[];
  onUpdateApartment: (updated: ApartmentProfile) => void;
  onAddApartment?: (created: ApartmentProfile) => void;
}

export const ApartmentsRegistryModal: React.FC<ApartmentsRegistryModalProps> = ({
  isOpen,
  onClose,
  apartments,
  onUpdateApartment,
  onAddApartment
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ApartmentType | 'todos'>('todos');
  const [filterFloor, setFilterFloor] = useState<string>('todos');
  const [editingApto, setEditingApto] = useState<ApartmentProfile | null>(null);

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

  if (!isOpen) return null;

  // Filter logic
  const filtered = apartments.filter((item) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.apto.toLowerCase().includes(query) ||
      item.proprietario.toLowerCase().includes(query) ||
      item.celular.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query);

    const matchesType = filterType === 'todos' || item.tipoApto === filterType;
    const floor = item.apto.length === 3 ? item.apto[0] : item.apto.substring(0, 1);
    const matchesFloor = filterFloor === 'todos' || floor === filterFloor;

    return matchesSearch && matchesType && matchesFloor;
  });

  // Counters
  const countMorador = apartments.filter((a) => a.tipoApto === 'morador').length;
  const countInquilino = apartments.filter((a) => a.tipoApto === 'inquilino').length;
  const countTemporada = apartments.filter((a) => a.tipoApto === 'temporada').length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApto) return;
    onUpdateApartment(editingApto);
    setEditingApto(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptoData.apto.trim() || !newAptoData.proprietario.trim()) return;

    if (onAddApartment) {
      onAddApartment(newAptoData);
    } else {
      onUpdateApartment(newAptoData);
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 animate-scaleUp overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Lista de Cadastro dos Apartamentos
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  {apartments.length} Unidades
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Diretório completo de proprietários, contatos de celular, e-mail e classificação da ocupação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
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
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-white border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filterType === 'todos'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-[11px] opacity-80 font-medium">Total de Unidades</div>
            <div className="text-base font-bold">{apartments.length} aptos</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('morador')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filterType === 'morador'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-blue-50/60 hover:bg-blue-100/60 border-blue-200 text-blue-900'
            }`}
          >
            <div className="text-[11px] opacity-80 font-medium">Moradores (Proprietários)</div>
            <div className="text-base font-bold">{countMorador} aptos</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('inquilino')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filterType === 'inquilino'
                ? 'bg-purple-700 text-white border-purple-700 shadow-2xs'
                : 'bg-purple-50/60 hover:bg-purple-100/60 border-purple-200 text-purple-900'
            }`}
          >
            <div className="text-[11px] opacity-80 font-medium">Inquilinos (Locação Fixa)</div>
            <div className="text-base font-bold">{countInquilino} aptos</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('temporada')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filterType === 'temporada'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-300 text-amber-900'
            }`}
          >
            <div className="text-[11px] opacity-80 font-medium">Temporada (Short Stay)</div>
            <div className="text-base font-bold">{countTemporada} aptos</div>
          </button>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por apto, nome do proprietário, celular, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nenhum apartamento encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3.5 w-24">Apto</th>
                    <th className="py-2.5 px-3.5">Proprietário</th>
                    <th className="py-2.5 px-3.5">Celular / WhatsApp</th>
                    <th className="py-2.5 px-3.5">E-mail</th>
                    <th className="py-2.5 px-3.5">Tipo Apto</th>
                    <th className="py-2.5 px-3.5 text-center w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((item) => (
                    <tr key={item.apto} className="hover:bg-slate-50/80 transition-colors">
                      {/* Apto */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md font-mono inline-block">
                          {item.apto}
                        </span>
                      </td>

                      {/* Proprietário */}
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.proprietario}</span>
                        </div>
                      </td>

                      {/* Celular */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{item.celular}</span>
                          {item.celular && (
                            <a
                              href={`https://wa.me/55${getCleanPhoneForWhatsApp(item.celular)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {item.email ? (
                          <a
                            href={`mailto:${item.email}`}
                            className="hover:text-blue-700 hover:underline flex items-center gap-1 truncate max-w-xs"
                            title={item.email}
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Tipo Apto */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {getTypeBadge(item.tipoApto)}
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingApto(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
                          title="Editar cadastro do apartamento"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> de{' '}
            <span className="font-bold text-slate-800">{apartments.length}</span> apartamentos
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
          >
            Fechar Lista
          </button>
        </div>
      </div>

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
                className="text-slate-400 hover:text-slate-600 font-bold"
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
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
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
            onSubmit={handleSaveNew}
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
    </div>
  );
};

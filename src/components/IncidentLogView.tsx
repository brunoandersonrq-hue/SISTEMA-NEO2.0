import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Filter,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { IncidentRecord } from '../types.ts';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';
import { getBrasiliaCurrentDateTime } from '../utils/formatters.ts';

interface IncidentLogViewProps {
  incidents: IncidentRecord[];
  onAddIncident: (incident: IncidentRecord) => void;
  onResolveIncident: (id: string, observacao: string) => void;
}

export const IncidentLogView: React.FC<IncidentLogViewProps> = ({
  incidents,
  onAddIncident,
  onResolveIncident
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [despacho, setDespacho] = useState('');

  const [formData, setFormData] = useState({
    dataHora: getBrasiliaCurrentDateTime(),
    autor: 'Portaria Diurna',
    apto: '',
    titulo: '',
    descricao: '',
    gravidade: 'media' as IncidentRecord['gravidade']
  });

  const handleToggleAddForm = () => {
    if (!showAddForm) {
      setFormData((prev) => ({
        ...prev,
        dataHora: getBrasiliaCurrentDateTime()
      }));
    }
    setShowAddForm(!showAddForm);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descricao) return;

    const formattedDataHora = formData.dataHora
      ? formData.dataHora.replace('T', ' ')
      : getBrasiliaCurrentDateTime().replace('T', ' ');

    onAddIncident({
      id: `inc-${Date.now()}`,
      dataHora: formattedDataHora,
      apto: formData.apto.trim() || 'Área Comum',
      autor: formData.autor.trim() || 'Portaria Diurna',
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      gravidade: formData.gravidade,
      status: 'pendente'
    });

    setShowAddForm(false);
    setFormData({
      dataHora: getBrasiliaCurrentDateTime(),
      autor: 'Portaria Diurna',
      apto: '',
      titulo: '',
      descricao: '',
      gravidade: 'media'
    });
  };

  const handleConfirmResolve = (id: string) => {
    onResolveIncident(id, despacho.trim() || 'Verificado e resolvido pela portaria/síndico.');
    setResolvingId(null);
    setDespacho('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Livro de Ocorrências</h2>
            <p className="text-xs text-slate-500">
              Registro formal e seguro de ocorrências, manutenções e avisos da portaria e moradores
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAddForm}
          className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Fechar Registro' : 'Registrar Nova Ocorrência'}</span>
        </button>
      </div>

      {/* New Incident Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-purple-500/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <span>Nova Ocorrência no Livro Digital</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Registro oficial da portaria & recepção
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Campo de Data e Hora */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Data e Hora do Fato *</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dataHora}
                onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white font-medium"
                required
              />
            </div>

            {/* Campo de Recepcionista */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Recepcionista / Atendente *</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Portaria Diurna / Seu Nome"
                value={formData.autor}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                list="incident-receptionist-list"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                required
              />
              <datalist id="incident-receptionist-list">
                <option value="Portaria Diurna" />
                <option value="Portaria Noturna / Vigia" />
                <option value="Recepção Central" />
                <option value="Zelador" />
                <option value="Síndico / Administração" />
              </datalist>
            </div>

            {/* Apartamento / Local */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Apartamento / Local</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 402 ou 'Área Comum'"
                value={formData.apto}
                onChange={(e) => setFormData({ ...formData, apto: e.target.value })}
                list="incident-aptos-list"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              />
              <datalist id="incident-aptos-list">
                <option value="Área Comum" />
                <option value="Garagem G1" />
                <option value="Garagem G2" />
                <option value="Hall de Entrada" />
                <option value="Piscina" />
                <option value="Elevador Social" />
                <option value="Elevador Serviço" />
                {BUILDING_APARTMENTS.map((ap) => (
                  <option key={ap} value={`Apto ${ap}`} />
                ))}
              </datalist>
            </div>

            {/* Gravidade */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                <span>Gravidade *</span>
              </label>
              <select
                value={formData.gravidade}
                onChange={(e) => setFormData({ ...formData, gravidade: e.target.value as IncidentRecord['gravidade'] })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white font-medium"
              >
                <option value="baixa">Baixa (Informativa / Manutenção)</option>
                <option value="media">Média (Reclamação / Alerta)</option>
                <option value="alta">Alta (Emergência / Notificação)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Título da Ocorrência *
            </label>
            <input
              type="text"
              placeholder="Ex: Barulho excessivo, Vazamento, Portão eletrônico, Encomenda retida..."
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Relato Detalhado dos Fatos *
            </label>
            <textarea
              rows={3}
              placeholder="Descreva com precisão o ocorrido, horários e providências tomadas inicialmente pela recepção/portaria..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-none font-normal"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg"
            >
              Gravar no Livro de Ocorrências
            </button>
          </div>
        </form>
      )}

      {/* Incidents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {incidents.map((inc) => (
          <div key={inc.id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    inc.gravidade === 'alta'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : inc.gravidade === 'media'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  Gravidade {inc.gravidade}
                </span>

                <span className="font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                  {inc.apto}
                </span>

                <h4 className="text-sm font-bold text-slate-900">{inc.titulo}</h4>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{inc.dataHora}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {inc.descricao}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-slate-500">
                Registrado por: <strong>{inc.autor}</strong>
                {inc.observacaoSindico && (
                  <span className="block sm:inline sm:ml-2 text-emerald-800 font-medium">
                    • Despacho: {inc.observacaoSindico}
                  </span>
                )}
              </div>

              <div className="self-end sm:self-auto">
                {inc.status === 'resolvida' ? (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Resolvida</span>
                  </span>
                ) : resolvingId === inc.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Parecer do síndico / solução"
                      value={despacho}
                      onChange={(e) => setDespacho(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleConfirmResolve(inc.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Concluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolvingId(null)}
                      className="text-slate-500 text-xs px-1 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResolvingId(inc.id)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    Dar Parecer / Baixar Ocorrência
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

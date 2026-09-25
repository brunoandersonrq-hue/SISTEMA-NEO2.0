import React, { useState, useEffect } from 'react';
import { X, Users, Car, UserCheck, AlertCircle, Calendar, Sparkles, Check, Clock, LogIn, LogOut, Lock, Unlock } from 'lucide-react';
import { Reservation, ReservationStatus } from '../types.ts';
import {
  formatCPF,
  formatCEP,
  formatPhone,
  formatPlate,
  formatDateBR,
  calculateNights,
  getBrasiliaCurrentDateTime,
  formatBrasiliaDateTime,
  getBrasiliaCurrentTimeDisplay,
  getBrasiliaTodayDate,
  getBrasiliaFutureDate
} from '../utils/formatters.ts';
import { RECEPTIONISTS, COMMON_APARTMENTS, BUILDING_APARTMENTS } from '../data/mockReservations.ts';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Reservation) => void;
  reservationToEdit?: Reservation | null;
  defaultDate?: string;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'Outro'
];

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reservationToEdit,
  defaultDate
}) => {
  const [formData, setFormData] = useState<Partial<Reservation>>({
    apto: '',
    entrada: defaultDate || new Date().toISOString().split('T')[0],
    saida: '',
    nomeResponsavel: '',
    email: '',
    cpf: '',
    telefone: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: 'SP',
    pais: 'Brasil',
    acompanhantes: '',
    modeloCarro1: '',
    placaCarro1: '',
    corCarro1: '',
    modeloCarro2: '',
    placaCarro2: '',
    corCarro2: '',
    recepcionista: RECEPTIONISTS[0],
    locador: 'Locação Direta',
    status: 'confirmada',
    dataHoraCheckIn: '',
    dataHoraCheckOut: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [brasiliaClock, setBrasiliaClock] = useState<string>(getBrasiliaCurrentTimeDisplay());
  const [allowEditCheckIn, setAllowEditCheckIn] = useState<boolean>(false);

  // Relógio ao vivo no Horário de Brasília para conferência da recepção
  useEffect(() => {
    const timer = setInterval(() => {
      setBrasiliaClock(getBrasiliaCurrentTimeDisplay());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setAllowEditCheckIn(false);
    if (reservationToEdit) {
      setFormData({
        ...reservationToEdit,
        dataHoraCheckIn: reservationToEdit.dataHoraCheckIn || '',
        dataHoraCheckOut: reservationToEdit.dataHoraCheckOut || ''
      });
    } else {
      setFormData({
        apto: '',
        entrada: defaultDate || getBrasiliaTodayDate(),
        saida: defaultDate ? getNextDay(defaultDate) : getBrasiliaFutureDate(5),
        nomeResponsavel: '',
        email: '',
        cpf: '',
        telefone: '',
        endereco: '',
        cep: '',
        cidade: '',
        estado: 'SP',
        pais: 'Brasil',
        acompanhantes: '',
        modeloCarro1: '',
        placaCarro1: '',
        corCarro1: '',
        modeloCarro2: '',
        placaCarro2: '',
        corCarro2: '',
        recepcionista: RECEPTIONISTS[0],
        locador: 'Locação Direta',
        status: 'confirmada',
        dataHoraCheckIn: '',
        dataHoraCheckOut: '',
        observacoes: ''
      });
    }
    setErrors({});
  }, [reservationToEdit, defaultDate, isOpen]);

  function getNextDay(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }

  if (!isOpen) return null;

  const handleChange = (field: keyof Reservation, value: string) => {
    let formattedValue = value;
    if (field === 'cpf') formattedValue = formatCPF(value);
    if (field === 'cep') formattedValue = formatCEP(value);
    if (field === 'telefone') formattedValue = formatPhone(value);
    if (field === 'placaCarro1' || field === 'placaCarro2') formattedValue = formatPlate(value);

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleStatusChange = (newStatus: ReservationStatus) => {
    setFormData((prev) => {
      const updated = { ...prev, status: newStatus };
      // Caso o status esteja em ativa (check-in Realizado), NÃO altera o horário de check-in.
      // Se selecionou 'ativa' pela primeira vez (e não tinha horário), registra o horário de Brasília.
      if (newStatus === 'ativa' && !prev.dataHoraCheckIn) {
        updated.dataHoraCheckIn = getBrasiliaCurrentDateTime();
      }
      // Ao alterar o status para concluída (check-out):
      // Apenas registra o horário de check-out e automaticamente define a data de saída como a data do check-out realizado
      // O horário de check-in permanece rigorosamente inalterado.
      if (newStatus === 'concluida') {
        const checkOutVal = prev.dataHoraCheckOut || getBrasiliaCurrentDateTime();
        updated.dataHoraCheckOut = checkOutVal;
        const datePart = checkOutVal.split('T')[0];
        if (datePart) {
          updated.saida = datePart;
        }
      }
      return updated;
    });
  };

  const handleRegisterCheckInNow = () => {
    const now = getBrasiliaCurrentDateTime();
    setFormData((prev) => ({
      ...prev,
      dataHoraCheckIn: now,
      status: 'ativa'
    }));
  };

  const handleRegisterCheckOutNow = () => {
    const now = getBrasiliaCurrentDateTime();
    const checkOutDate = now.split('T')[0];
    setFormData((prev) => ({
      ...prev,
      dataHoraCheckOut: now,
      status: 'concluida',
      saida: checkOutDate
    }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.saida;
      return updated;
    });
  };

  const handleCheckOutDateTimeChange = (val: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        dataHoraCheckOut: val
      };
      if (val) {
        // Ao preencher/alterar data e hora do check-out, o status automaticamente é 'concluida'
        // e a data de saída automaticamente recebe a mesma data do check-out realizado
        updated.status = 'concluida';
        const datePart = val.split('T')[0];
        if (datePart) {
          updated.saida = datePart;
        }
      }
      return updated;
    });
    if (val) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.saida;
        return updated;
      });
    }
  };

  const handleClearCheckIn = () => {
    setFormData((prev) => ({
      ...prev,
      dataHoraCheckIn: ''
    }));
  };

  const handleClearCheckOut = () => {
    setFormData((prev) => ({
      ...prev,
      dataHoraCheckOut: ''
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.apto?.trim()) newErrors.apto = 'Informe o número/identificação do apartamento';
    if (!formData.entrada) newErrors.entrada = 'Data de entrada é obrigatória';
    if (!formData.saida) newErrors.saida = 'Data de saída é obrigatória';
    if (formData.entrada && formData.saida && formData.saida < formData.entrada) {
      newErrors.saida = 'Data de saída deve ser igual ou posterior à entrada';
    }
    if (!formData.nomeResponsavel?.trim()) newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const reservationToSave: Reservation = {
      id: reservationToEdit?.id || `res-${Date.now()}`,
      apto: formData.apto || '',
      entrada: formData.entrada || '',
      saida: formData.saida || '',
      nomeResponsavel: formData.nomeResponsavel || '',
      email: formData.email || '',
      cpf: formData.cpf || '',
      telefone: formData.telefone || '',
      endereco: formData.endereco || '',
      cep: formData.cep || '',
      cidade: formData.cidade || '',
      estado: formData.estado || 'SP',
      pais: formData.pais || 'Brasil',
      acompanhantes: formData.acompanhantes || '',
      modeloCarro1: formData.modeloCarro1 || '',
      placaCarro1: formData.placaCarro1 || '',
      corCarro1: formData.corCarro1 || '',
      modeloCarro2: formData.modeloCarro2 || '',
      placaCarro2: formData.placaCarro2 || '',
      corCarro2: formData.corCarro2 || '',
      recepcionista: formData.recepcionista || RECEPTIONISTS[0],
      locador: formData.locador || 'Locação Direta',
      status: (formData.status as ReservationStatus) || 'confirmada',
      dataHoraCheckIn: formData.dataHoraCheckIn || undefined,
      dataHoraCheckOut: formData.dataHoraCheckOut || undefined,
      observacoes: formData.observacoes || '',
      createdAt: reservationToEdit?.createdAt || now,
      updatedAt: now
    };

    onSave(reservationToSave);
  };

  const nights = calculateNights(formData.entrada || '', formData.saida || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-800 rounded-lg">
              {reservationToEdit ? <UserCheck className="w-5 h-5 text-blue-200" /> : <Users className="w-5 h-5 text-blue-200" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {reservationToEdit ? 'Editar Reserva de Hóspede' : 'Nova Reserva de Hóspede'}
              </h2>
              <p className="text-xs text-blue-200">
                {reservationToEdit
                  ? `Atualizando registro de ${reservationToEdit.nomeResponsavel || 'Hóspede'} (${reservationToEdit.apto})`
                  : 'Preencha os dados do hóspede, veículos e estadia conforme a ficha padrão'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Status & Stay Summary Ribbon */}
          <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase text-slate-600 tracking-wider">
                Status da Reserva:
              </label>
              <select
                id="modal-select-status"
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value as ReservationStatus)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white shadow-2xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="confirmada">Confirmada</option>
                <option value="ativa">Check-in (Ativa)</option>
                <option value="concluida">Concluída (Check-out)</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Duração calculada:</span>
              <span className="font-bold text-slate-900 bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                {nights} {nights === 1 ? 'diária' : 'diárias'}
              </span>
            </div>
          </div>

          {/* PAINEL DE CONTROLE DE HORÁRIOS DE CHECK-IN E CHECK-OUT (HORÁRIO DE BRASÍLIA) */}
          {formData.status !== 'confirmada' && (
            <div id="panel-checkin-checkout" className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3 border border-slate-800 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  Registro de Horários de Check-in & Check-out
                </span>
                <span className="text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                  Fuso: Horário Oficial de Brasília (UTC-3)
                </span>
              </div>
              <div className="text-[11px] text-amber-300 font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hora Oficial em Brasília: {brasiliaClock}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* BLOCO CHECK-IN */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  formData.status === 'ativa' || formData.dataHoraCheckIn
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Check-in Realizado</span>
                  </div>
                  {formData.status === 'ativa' && formData.dataHoraCheckIn ? (
                    <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" /> Preservado
                    </span>
                  ) : formData.dataHoraCheckIn ? (
                    <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Registrado
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      Pendente
                    </span>
                  )}
                </div>

                {formData.status === 'ativa' && (
                  <div className="text-[11px] bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2 text-emerald-200 flex items-start gap-1.5 mb-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Status em Ativa:</strong> O horário de check-in está preservado e não precisa ser alterado.
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold uppercase text-slate-300">
                        Data e Hora de Check-in (Horário de Brasília)
                      </label>
                      {formData.status === 'ativa' && !allowEditCheckIn && (
                        <button
                          type="button"
                          onClick={() => setAllowEditCheckIn(true)}
                          className="text-[10px] text-slate-400 hover:text-emerald-300 underline cursor-pointer flex items-center gap-1"
                          title="Permitir ajuste manual caso necessário"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Ajustar horário</span>
                        </button>
                      )}
                      {formData.status === 'ativa' && allowEditCheckIn && (
                        <button
                          type="button"
                          onClick={() => setAllowEditCheckIn(false)}
                          className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Bloquear horário</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      id="input-checkin-brasilia"
                      value={formData.dataHoraCheckIn || ''}
                      disabled={formData.status === 'ativa' && !allowEditCheckIn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dataHoraCheckIn: e.target.value }))}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-semibold [color-scheme:light] focus:outline-none transition-colors ${
                        formData.status === 'ativa' && !allowEditCheckIn
                          ? 'bg-slate-200 border-slate-300 text-blue-900 cursor-not-allowed opacity-90'
                          : 'bg-slate-100 border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {formData.status !== 'ativa' && !formData.dataHoraCheckIn && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        id="btn-register-checkin-now"
                        onClick={handleRegisterCheckInNow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors cursor-pointer"
                        title="Registrar agora com o horário atual de Brasília"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Registrar Check-in Agora</span>
                      </button>
                    </div>
                  )}

                  {formData.dataHoraCheckIn && (
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-emerald-300 font-medium">
                      <span className="flex items-center gap-1">
                        ✓ {formData.status === 'ativa' ? 'Check-in ativo em:' : 'Registrado em:'}{' '}
                        {formatBrasiliaDateTime(formData.dataHoraCheckIn, true)}
                      </span>
                      {allowEditCheckIn && (
                        <button
                          type="button"
                          onClick={handleClearCheckIn}
                          className="text-[10px] text-rose-300 hover:text-rose-200 hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO CHECK-OUT */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  formData.status === 'concluida' || formData.dataHoraCheckOut
                    ? 'bg-amber-950/40 border-amber-500/50'
                    : formData.status === 'ativa'
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {formData.status === 'concluida' ? 'Check-out Realizado' : 'Check-out (Saída)'}
                    </span>
                  </div>
                  {formData.dataHoraCheckOut ? (
                    <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Registrado
                    </span>
                  ) : formData.status === 'ativa' ? (
                    <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full animate-pulse">
                      Aguardando Saída
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      Pendente
                    </span>
                  )}
                </div>

                {formData.status === 'ativa' && !formData.dataHoraCheckOut && (
                  <div className="text-[11px] bg-amber-950/60 border border-amber-500/30 rounded-lg p-2 text-amber-200 flex items-start gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Conclusão de Estadia:</strong> Ao registrar o check-out ou alterar para Concluída, apenas o horário de saída é gravado, preservando o check-in.
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-300 mb-1">
                      Data e Hora de Check-out (Horário de Brasília)
                    </label>
                    <input
                      type="datetime-local"
                      id="input-checkout-brasilia"
                      value={formData.dataHoraCheckOut || ''}
                      onChange={(e) => handleCheckOutDateTimeChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 border border-slate-300 text-blue-700 font-semibold [color-scheme:light] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      id="btn-register-checkout-now"
                      onClick={handleRegisterCheckOutNow}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs ${
                        formData.status === 'ativa'
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                      title="Registrar saída agora com o horário atual de Brasília, alterar status para Concluída e sincronizar data de saída"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Registrar Check-out Agora</span>
                    </button>

                    {formData.dataHoraCheckOut && (
                      <button
                        type="button"
                        onClick={handleClearCheckOut}
                        className="text-[11px] text-rose-300 hover:text-rose-200 hover:underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  {formData.dataHoraCheckOut && (
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 text-[11px] space-y-1 mt-1">
                      <div className="text-amber-300 font-medium">
                        ✓ Registrado em: <strong>{formatBrasiliaDateTime(formData.dataHoraCheckOut, true)}</strong>
                      </div>
                      <div className="text-emerald-300 font-medium flex items-center gap-1 text-[10px]">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Status: <strong>Concluída (Check-out)</strong> | Saída: <strong>{formatDateBR(formData.saida || '')}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SEÇÃO HÓSPEDE (Conforme a imagem anexada) */}
            <div className="lg:col-span-7 bg-white rounded-xl border-2 border-blue-900/40 p-4 relative shadow-xs">
              <div className="flex items-center space-x-2 bg-blue-900 text-white px-3 py-1.5 rounded-lg mb-4">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">HÓSPEDE</h3>
              </div>

              <div className="space-y-3">
                {/* APTO, ENTRADA, SAIDA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="input-apto" className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      APTO *
                    </label>
                    <input
                      type="text"
                      id="input-apto"
                      placeholder="101, 102, 201..."
                      value={formData.apto || ''}
                      onChange={(e) => handleChange('apto', e.target.value)}
                      list="aptos-list"
                      autoComplete="off"
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                        errors.apto ? 'border-red-500 bg-red-50' : 'border-slate-300'
                      } focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium`}
                    />
                    <datalist id="aptos-list">
                      <option value="Condomínio" />
                      {BUILDING_APARTMENTS.map((ap) => (
                        <option key={ap} value={ap} />
                      ))}
                    </datalist>

                    {errors.apto && <p className="text-[10px] text-red-500 mt-0.5">{errors.apto}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      ENTRADA *
                    </label>
                    <input
                      type="date"
                      id="input-entrada"
                      value={formData.entrada || ''}
                      onChange={(e) => handleChange('entrada', e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                        errors.entrada ? 'border-red-500 bg-red-50' : 'border-slate-300'
                      } focus:ring-2 focus:ring-blue-600 focus:outline-none`}
                    />
                    {errors.entrada && <p className="text-[10px] text-red-500 mt-0.5">{errors.entrada}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase text-slate-700">
                        SAÍDA *
                      </label>
                      {formData.status === 'concluida' && formData.dataHoraCheckOut && (
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" /> Sincronizada
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      id="input-saida"
                      value={formData.saida || ''}
                      onChange={(e) => handleChange('saida', e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        errors.saida
                          ? 'border-red-500 bg-red-50'
                          : formData.status === 'concluida' && formData.dataHoraCheckOut
                          ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 font-semibold'
                          : 'border-slate-300'
                      } focus:ring-2 focus:ring-blue-600 focus:outline-none`}
                    />
                    {errors.saida && <p className="text-[10px] text-red-500 mt-0.5">{errors.saida}</p>}
                    {formData.status === 'concluida' && formData.dataHoraCheckOut && (
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Mesma data do check-out realizado ({formatDateBR(formData.saida || '')})
                      </p>
                    )}
                  </div>
                </div>

                {/* NOME RESPONSAVEL */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    NOME RESPONSÁVEL *
                  </label>
                  <input
                    type="text"
                    id="input-nomeResponsavel"
                    placeholder="Nome completo do hóspede titular"
                    value={formData.nomeResponsavel || ''}
                    onChange={(e) => handleChange('nomeResponsavel', e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                      errors.nomeResponsavel ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    } focus:ring-2 focus:ring-blue-600 focus:outline-none`}
                  />
                  {errors.nomeResponsavel && (
                    <p className="text-[10px] text-red-500 mt-0.5">{errors.nomeResponsavel}</p>
                  )}
                </div>

                {/* EMAIL & TELEFONE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      id="input-email"
                      placeholder="hospede@email.com"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      TELEFONE
                    </label>
                    <input
                      type="text"
                      id="input-telefone"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone || ''}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* CPF & CEP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      id="input-cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf || ''}
                      onChange={(e) => handleChange('cpf', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="input-cep"
                      placeholder="00000-000"
                      value={formData.cep || ''}
                      onChange={(e) => handleChange('cep', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ENDEREÇO */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    ENDEREÇO
                  </label>
                  <input
                    type="text"
                    id="input-endereco"
                    placeholder="Rua, Av, Número, Bairro"
                    value={formData.endereco || ''}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                {/* CIDADE, ESTADO, PAIS */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      CIDADE
                    </label>
                    <input
                      type="text"
                      id="input-cidade"
                      placeholder="Cidade"
                      value={formData.cidade || ''}
                      onChange={(e) => handleChange('cidade', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      ESTADO
                    </label>
                    <select
                      id="input-estado"
                      value={formData.estado || 'SP'}
                      onChange={(e) => handleChange('estado', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      {BRAZILIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      PAÍS
                    </label>
                    <input
                      type="text"
                      id="input-pais"
                      placeholder="Brasil"
                      value={formData.pais || 'Brasil'}
                      onChange={(e) => handleChange('pais', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ACOMPANHANTES */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    ACOMPANHANTES
                  </label>
                  <textarea
                    id="input-acompanhantes"
                    rows={2}
                    placeholder="Nomes dos acompanhantes, familiares ou hóspedes adicionais"
                    value={formData.acompanhantes || ''}
                    onChange={(e) => handleChange('acompanhantes', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA: VEÍCULOS + RECEPCIONISTA/LOCADOR */}
            <div className="lg:col-span-5 space-y-6">
              {/* SEÇÃO VEÍCULOS (Conforme a imagem anexada) */}
              <div className="bg-white rounded-xl border-2 border-blue-900/40 p-4 shadow-xs">
                <div className="flex items-center space-x-2 bg-blue-900 text-white px-3 py-1.5 rounded-lg mb-4">
                  <Car className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">VEÍCULOS</h3>
                </div>

                <div className="space-y-4">
                  {/* VEÍCULO 1 */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-blue-900 uppercase">Carro 1</span>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                        MODELO CARRO 1
                      </label>
                      <input
                        type="text"
                        id="input-modeloCarro1"
                        placeholder="Ex: Jeep Compass"
                        value={formData.modeloCarro1 || ''}
                        onChange={(e) => handleChange('modeloCarro1', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                          PLACA CARRO 1
                        </label>
                        <input
                          type="text"
                          id="input-placaCarro1"
                          placeholder="ABC-1234"
                          value={formData.placaCarro1 || ''}
                          onChange={(e) => handleChange('placaCarro1', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                          COR CARRO 1
                        </label>
                        <input
                          type="text"
                          id="input-corCarro1"
                          placeholder="Ex: Preto"
                          value={formData.corCarro1 || ''}
                          onChange={(e) => handleChange('corCarro1', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VEÍCULO 2 */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-blue-900 uppercase">Carro 2 (Opcional)</span>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                        MODELO CARRO 2
                      </label>
                      <input
                        type="text"
                        id="input-modeloCarro2"
                        placeholder="Ex: Honda HR-V"
                        value={formData.modeloCarro2 || ''}
                        onChange={(e) => handleChange('modeloCarro2', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                          PLACA CARRO 2
                        </label>
                        <input
                          type="text"
                          id="input-placaCarro2"
                          placeholder="DEF-5678"
                          value={formData.placaCarro2 || ''}
                          onChange={(e) => handleChange('placaCarro2', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-0.5">
                          COR CARRO 2
                        </label>
                        <input
                          type="text"
                          id="input-corCarro2"
                          placeholder="Ex: Prata"
                          value={formData.corCarro2 || ''}
                          onChange={(e) => handleChange('corCarro2', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO RECEPCIONISTA & LOCADOR (Conforme imagem) */}
              <div className="bg-white rounded-xl border-2 border-blue-900/40 p-4 shadow-xs space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    RECEPCIONISTA (SELEÇÃO)
                  </label>
                  <select
                    id="input-recepcionista"
                    value={formData.recepcionista || ''}
                    onChange={(e) => handleChange('recepcionista', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium uppercase"
                  >
                    {RECEPTIONISTS.map((rec) => (
                      <option key={rec} value={rec}>
                        {rec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    LOCADOR
                  </label>
                  <input
                    type="text"
                    id="input-locador"
                    placeholder="Ex: Imobiliária Solar / Carlos Drummond"
                    value={formData.locador || ''}
                    onChange={(e) => handleChange('locador', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    OBSERVAÇÕES INTERNAS
                  </label>
                  <input
                    type="text"
                    id="input-observacoes"
                    placeholder="Pedidos especiais, horário previsto, etc."
                    value={formData.observacoes || ''}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-reservation"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-blue-800 hover:bg-blue-900 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{reservationToEdit ? 'Salvar Alterações' : 'Criar Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

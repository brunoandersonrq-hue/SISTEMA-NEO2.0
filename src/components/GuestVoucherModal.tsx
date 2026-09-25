import React, { useMemo } from 'react';
import { X, Printer, Edit, Users, Car, CheckCircle2, Phone, Mail, MapPin, Clock, LogIn, LogOut, ExternalLink, Download } from 'lucide-react';
import { Reservation } from '../types.ts';
import { formatDateBR, calculateNights, formatBrasiliaDateTime } from '../utils/formatters.ts';
import { openVoucherPrintWindow, downloadVoucherHtml, buildVoucherHtml } from '../utils/printReport.ts';

interface GuestVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onEdit: (reservation: Reservation) => void;
}

export const GuestVoucherModal: React.FC<GuestVoucherModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onEdit
}) => {
  if (!isOpen || !reservation) return null;

  const nights = calculateNights(reservation.entrada, reservation.saida);

  const voucherBlobUrl = useMemo(() => {
    if (!reservation) return '';
    try {
      const html = buildVoucherHtml(reservation);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      return URL.createObjectURL(blob);
    } catch {
      return '';
    }
  }, [reservation]);

  const handlePrint = () => {
    // 1. Try opening via standalone tab (auto-print)
    const opened = openVoucherPrintWindow(reservation);

    // 2. Also try native window.print()
    try {
      window.print();
    } catch (e) {
      console.warn('window.print error:', e);
    }

    // 3. If popup was blocked
    if (!opened) {
      downloadVoucherHtml(reservation);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Ativa (Check-in)</span>;
      case 'confirmada':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300">Confirmada</span>;
      case 'concluida':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Concluída (Check-out)</span>;
      case 'cancelada':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300">Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Ficha de Hóspede e Veículos</h2>
              <p className="text-xs text-blue-200">
                Apto {reservation.apto} • {reservation.nomeResponsavel}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {voucherBlobUrl && (
              <a
                href={voucherBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-800 hover:bg-blue-700 text-blue-100 hover:text-white transition-colors cursor-pointer"
                title="Abrir ficha em nova aba do navegador para imprimir"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nova Aba</span>
              </a>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(reservation);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content reproducing the visual layout of the user's reference image */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50 printable-content">
          {/* Status & General Details Bar */}
          <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-slate-200 gap-3 shadow-xs">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Apartamento</div>
              <div className="text-xl font-black text-blue-950">{reservation.apto}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Período de Estadia</div>
              <div className="text-sm font-bold text-slate-800">
                {formatDateBR(reservation.entrada)} até {formatDateBR(reservation.saida)}{' '}
                <span className="text-xs font-normal text-slate-500">({nights} noites)</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Status</div>
              {getStatusBadge(reservation.status)}
            </div>
          </div>

          {/* Registro de Horários de Check-in e Check-out (Horário de Brasília) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reservation.dataHoraCheckIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Horário de Check-in (Brasília)
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {reservation.dataHoraCheckIn ? (
                    <span className="text-emerald-700">
                      {formatBrasiliaDateTime(reservation.dataHoraCheckIn, true)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">Pendente / Não registrado</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reservation.dataHoraCheckOut ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Horário de Check-out (Brasília)
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {reservation.dataHoraCheckOut ? (
                    <span className="text-amber-700">
                      {formatBrasiliaDateTime(reservation.dataHoraCheckOut, true)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">Pendente / Não registrado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form visual structure mirroring image.png */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bloco HOSPEDE */}
            <div className="md:col-span-7 bg-white rounded-xl border-2 border-blue-900 overflow-hidden shadow-xs">
              <div className="bg-blue-900 text-white px-4 py-2 flex items-center space-x-2 font-bold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>HOSPEDE</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">APTO</span>
                  <span className="flex-1 font-semibold text-slate-800">{reservation.apto || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">ENTRADA</span>
                  <span className="flex-1 font-medium text-slate-800">{formatDateBR(reservation.entrada)}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">SAIDA</span>
                  <span className="flex-1 font-medium text-slate-800">{formatDateBR(reservation.saida)}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">NOME RESPONSAVEL</span>
                  <span className="flex-1 font-bold text-slate-900">{reservation.nomeResponsavel || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">EMAIL</span>
                  <span className="flex-1 text-slate-800">{reservation.email || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">CPF</span>
                  <span className="flex-1 font-mono text-slate-800">{reservation.cpf || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">TELEFONE</span>
                  <span className="flex-1 text-slate-800">{reservation.telefone || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">ENDEREÇO</span>
                  <span className="flex-1 text-slate-800">{reservation.endereco || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">CEP</span>
                  <span className="flex-1 font-mono text-slate-800">{reservation.cep || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">CIDADE</span>
                  <span className="flex-1 text-slate-800">{reservation.cidade || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">ESTADO</span>
                  <span className="flex-1 text-slate-800">{reservation.estado || '-'}</span>
                </div>
                <div className="flex border-b border-slate-100 py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">PAIS</span>
                  <span className="flex-1 text-slate-800">{reservation.pais || 'Brasil'}</span>
                </div>
                <div className="flex py-1.5">
                  <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">ACOMPANHANTES</span>
                  <span className="flex-1 text-slate-700">{reservation.acompanhantes || 'Nenhum informado'}</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: VEICULOS + RECEPCIONISTA/LOCADOR */}
            <div className="md:col-span-5 space-y-4">
              {/* Bloco VEICULOS */}
              <div className="bg-white rounded-xl border-2 border-blue-900 overflow-hidden shadow-xs">
                <div className="bg-blue-900 text-white px-4 py-2 flex items-center space-x-2 font-bold text-xs uppercase tracking-wider">
                  <Car className="w-4 h-4" />
                  <span>VEICULOS</span>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex border-b border-slate-100 py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">MODELO CARRO 1</span>
                    <span className="flex-1 font-semibold text-slate-800">{reservation.modeloCarro1 || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-100 py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">PLACA CARRO 1</span>
                    <span className="flex-1 font-mono font-bold text-slate-900">{reservation.placaCarro1 || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-100 py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">COR CARRO 1</span>
                    <span className="flex-1 text-slate-800">{reservation.corCarro1 || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-100 py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">MODELO CARRO 2</span>
                    <span className="flex-1 font-semibold text-slate-800">{reservation.modeloCarro2 || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-100 py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">PLACA CARRO 2</span>
                    <span className="flex-1 font-mono font-bold text-slate-900">{reservation.placaCarro2 || '-'}</span>
                  </div>
                  <div className="flex py-1.5">
                    <span className="w-36 font-bold text-blue-950 uppercase text-[11px]">COR CARRO 2</span>
                    <span className="flex-1 text-slate-800">{reservation.corCarro2 || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bloco RECEPCIONISTA & LOCADOR */}
              <div className="bg-white rounded-xl border-2 border-blue-900 overflow-hidden shadow-xs p-4 space-y-2.5 text-xs">
                <div className="flex border-b border-slate-100 pb-2">
                  <span className="w-32 font-bold text-blue-950 uppercase text-[11px]">RECEPCIONISTA</span>
                  <span className="flex-1 font-semibold text-slate-800">{reservation.recepcionista || '-'}</span>
                </div>
                <div className="flex pt-1">
                  <span className="w-32 font-bold text-blue-950 uppercase text-[11px]">LOCADOR</span>
                  <span className="flex-1 font-semibold text-slate-800">{reservation.locador || '-'}</span>
                </div>
              </div>

              {/* Observações */}
              {reservation.observacoes && (
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-xs">
                  <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">
                    Observações Internas:
                  </span>
                  <p className="text-slate-600 italic">{reservation.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Cadastrado em {new Date(reservation.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  X,
  FileCheck,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Car,
  User,
  Info,
  ExternalLink,
  Download,
  Check
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types.ts';
import {
  formatDateBR,
  calculateNights,
  formatBrasiliaDateTime,
  getBrasiliaTodayDateFormatted,
  getBrasiliaCurrentDateTime
} from '../utils/formatters.ts';
import {
  buildPrintableHtml,
  openPrintWindow,
  downloadPrintableHtml,
  getPrintableBlobUrl
} from '../utils/printReport.ts';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  statusFilter: ReservationStatus | 'todos';
  dateStart: string;
  dateEnd: string;
  searchTerm: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  reservations,
  statusFilter,
  dateStart,
  dateEnd,
  searchTerm
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'triggered' | 'downloaded'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Generate Blob URL for native new-tab hyperlink (bypasses popup blockers)
  const blobUrl = useMemo(() => {
    if (!isOpen) return '';
    try {
      return getPrintableBlobUrl(reservations, statusFilter, dateStart, dateEnd, searchTerm);
    } catch {
      return '';
    }
  }, [isOpen, reservations, statusFilter, dateStart, dateEnd, searchTerm]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!isOpen) return null;

  const currentDateTimeFormatted = formatBrasiliaDateTime(getBrasiliaCurrentDateTime());

  const handleExecutePrint = () => {
    setIsPrinting(true);
    setPrintStatus('triggered');
    setStatusMessage(
      'Comando de impressão enviado! Se o navegador bloquear o diálogo no painel embutido, utilize o botão "Abrir em Nova Aba" ou "Baixar Arquivo".'
    );

    // 1. Try opening via openPrintWindow (which opens the tab with auto-print)
    const opened = openPrintWindow(reservations, statusFilter, dateStart, dateEnd, searchTerm);

    // 2. Also try native window.print()
    try {
      window.print();
    } catch (err: any) {
      console.warn('Erro ao chamar window.print():', err);
    }

    // 3. If window.open was blocked by the browser, fallback to triggering download
    if (!opened && !isInIframe) {
      downloadPrintableHtml(reservations, statusFilter, dateStart, dateEnd, searchTerm);
      setStatusMessage('O navegador bloqueou a janela pop-up. O arquivo de impressão foi baixado diretamente para o seu computador.');
    }

    setTimeout(() => {
      setIsPrinting(false);
    }, 1200);
  };

  const handleDownload = () => {
    downloadPrintableHtml(reservations, statusFilter, dateStart, dateEnd, searchTerm);
    setPrintStatus('downloaded');
    setStatusMessage('Arquivo HTML de impressão baixado com sucesso! Você pode abri-lo no seu navegador para imprimir ou salvar em PDF.');
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'ativa':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            Ativa
          </span>
        );
      case 'confirmada':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-300">
            Confirmada
          </span>
        );
      case 'concluida':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-300">
            Concluída
          </span>
        );
      case 'cancelada':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-300">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="modal-print-preview"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full my-4 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>Pré-visualização para Confirmação de Impressão</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-blue-300">
                  {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Confira o conteúdo formatado antes de imprimir ou salvar como PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Open in New Tab Link */}
            {blobUrl && (
              <a
                id="link-open-print-tab"
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white font-medium text-xs transition-colors border border-slate-700 cursor-pointer"
                title="Abrir em nova aba do navegador para imprimir sem restrições"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir em Nova Aba</span>
              </a>
            )}

            {/* Direct Download Anchor */}
            {blobUrl && (
              <a
                id="link-download-print-file"
                href={blobUrl}
                download="relatorio-reservas-neo.html"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors border border-slate-700 cursor-pointer"
                title="Baixar arquivo HTML pronto para impressão"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo</span>
              </a>
            )}

            {/* Confirm Print Button (button:nth-of-type(1)) */}
            <button
              type="button"
              id="btn-confirm-print"
              onClick={handleExecutePrint}
              disabled={isPrinting}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all duration-150 shadow-md shadow-blue-900/30 hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              title="Confirmar e disparar impressão"
            >
              {isPrinting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Confirmar e Imprimir</span>
                </>
              )}
            </button>

            {/* Close button (button:nth-of-type(2)) */}
            <button
              type="button"
              id="btn-close-print-preview"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar pré-visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Status / Notice Bar */}
        {statusMessage ? (
          <div className="p-3 bg-blue-50 border-b border-blue-200 text-xs text-blue-900 flex items-start justify-between gap-2.5 no-print">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{statusMessage}</p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  {blobUrl && (
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-800 underline hover:text-blue-950"
                    >
                      <ExternalLink className="w-3 h-3" /> Clique aqui para abrir a janela de impressão em nova aba
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 font-bold text-slate-700 underline hover:text-slate-900 ml-2"
                  >
                    <Download className="w-3 h-3" /> Baixar arquivo para impressão
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : isInIframe ? (
          <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Atenção:</strong> Como a visualização está embutida no painel (iFrame), se o navegador não abrir o diálogo automaticamente ao clicar em "Confirmar e Imprimir", use <strong>Abrir em Nova Aba</strong> ou <strong>Baixar Arquivo</strong>.
              </span>
            </div>
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-800 underline shrink-0 hover:text-amber-950 inline-flex items-center gap-1"
              >
                Abrir agora <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : null}

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/90">
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-5 sm:p-7 max-w-4xl mx-auto print-document">
            {/* Header of Printable Sheet */}
            <div className="pb-4 border-b-2 border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-900" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Edifício NEO 2.0 • Recepção & Portaria
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Relatório de Histórico de Reservas de Hóspedes
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Controle integrado de ocupação, veículos e locadores autorizados
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded border sm:border-0 border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800">Emissão:</span> {currentDateTimeFormatted}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Registros Listados:</span>{' '}
                  <span className="font-bold text-slate-900">{reservations.length}</span>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex flex-wrap gap-x-6 gap-y-1.5">
              <div>
                <span className="font-semibold text-slate-900">Status Selecionado:</span>{' '}
                <span className="capitalize font-medium">
                  {statusFilter === 'todos' ? 'Todos os Status' : statusFilter}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-900">Período de Estadia:</span>{' '}
                <span className="font-medium">
                  {dateStart ? formatDateBR(dateStart) : 'Início livre'} até{' '}
                  {dateEnd ? formatDateBR(dateEnd) : 'Fim livre'}
                </span>
              </div>
              {searchTerm && (
                <div>
                  <span className="font-semibold text-slate-900">Filtro de Texto:</span>{' '}
                  <span className="font-mono text-blue-900">"{searchTerm}"</span>
                </div>
              )}
            </div>

            {/* Reservations Table */}
            {reservations.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-lg">
                Nenhuma reserva encontrada para os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 text-[11px] font-bold text-slate-800 uppercase">
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Apto</th>
                      <th className="py-2.5 px-3">Hóspede (Responsável)</th>
                      <th className="py-2.5 px-3">Estadia</th>
                      <th className="py-2.5 px-3">Veículo(s) Cadastrado(s)</th>
                      <th className="py-2.5 px-3">Recepcionista / Locador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {reservations.map((res) => {
                      const nights = calculateNights(res.entrada, res.saida);
                      return (
                        <tr key={res.id} className="hover:bg-slate-50/80">
                          {/* Status */}
                          <td className="py-2.5 px-3 whitespace-nowrap align-top">
                            {getStatusBadge(res.status)}
                          </td>

                          {/* Apto */}
                          <td className="py-2.5 px-3 whitespace-nowrap align-top">
                            <span className="font-black text-sm text-blue-950 px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                              {res.apto}
                            </span>
                          </td>

                          {/* Hóspede */}
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-bold text-slate-900">{res.nomeResponsavel}</div>
                            {res.cpf && (
                              <div className="text-[11px] text-slate-500 font-mono">
                                CPF: {res.cpf}
                              </div>
                            )}
                            {res.telefone && (
                              <div className="text-[11px] text-slate-500">
                                Tel: {res.telefone}
                              </div>
                            )}
                            {res.acompanhantes && (
                              <div className="text-[10px] text-slate-600 mt-0.5">
                                <span className="font-semibold">Acomp.:</span> {res.acompanhantes}
                              </div>
                            )}
                          </td>

                          {/* Estadia */}
                          <td className="py-2.5 px-3 whitespace-nowrap align-top">
                            <div className="font-semibold text-slate-900">
                              {formatDateBR(res.entrada)} <span className="text-slate-400">à</span>{' '}
                              {formatDateBR(res.saida)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {nights} {nights === 1 ? 'diária' : 'diárias'}
                            </div>
                          </td>

                          {/* Veículos */}
                          <td className="py-2.5 px-3 align-top">
                            {res.placaCarro1 || res.modeloCarro1 ? (
                              <div className="space-y-1">
                                <div>
                                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded">
                                    {res.placaCarro1 || 'SEM PLACA'}
                                  </span>
                                  {res.modeloCarro1 && (
                                    <span className="ml-1 text-slate-600 text-[11px]">
                                      {res.modeloCarro1} {res.corCarro1 ? `(${res.corCarro1})` : ''}
                                    </span>
                                  )}
                                </div>
                                {(res.placaCarro2 || res.modeloCarro2) && (
                                  <div>
                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded">
                                      {res.placaCarro2}
                                    </span>
                                    {res.modeloCarro2 && (
                                      <span className="ml-1 text-slate-600 text-[11px]">
                                        {res.modeloCarro2} {res.corCarro2 ? `(${res.corCarro2})` : ''}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Nenhum veículo</span>
                            )}
                          </td>

                          {/* Recepcionista / Locador */}
                          <td className="py-2.5 px-3 align-top">
                            <div className="text-slate-700">
                              <span className="font-semibold">Atendente:</span>{' '}
                              {res.recepcionista || '-'}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              <span className="font-semibold">Locador:</span> {res.locador || '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sheet Footer Note */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>Edifício NEO 2.0 • Documento para uso interno da Administração e Portaria</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar Controls (Hidden on print) */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Você pode selecionar <strong>"Salvar como PDF"</strong> na janela de impressão para arquivar o relatório digitalmente.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {blobUrl && (
              <a
                id="link-bottom-open-print-tab"
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir em Nova Aba</span>
              </a>
            )}

            {blobUrl && (
              <a
                id="link-bottom-download-html"
                href={blobUrl}
                download="relatorio-reservas-neo.html"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar HTML</span>
              </a>
            )}

            {/* Cancel / Close button (button:nth-of-type(1)) */}
            <button
              type="button"
              id="btn-cancel-print-preview"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Voltar / Fechar
            </button>

            {/* Bottom Confirm Print button (button:nth-of-type(2)) */}
            <button
              type="button"
              id="btn-bottom-confirm-print"
              onClick={handleExecutePrint}
              disabled={isPrinting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 active:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm transition-all duration-150 shadow-md shadow-blue-900/20 hover:shadow-lg cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              {isPrinting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Confirmar e Imprimir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

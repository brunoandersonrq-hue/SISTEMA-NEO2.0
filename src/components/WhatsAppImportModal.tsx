import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Clipboard,
  Check,
  CheckCheck,
  AlertCircle,
  Copy,
  Send,
  Building2,
  Calendar,
  User,
  Users,
  Car,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Reservation } from '../types.ts';
import {
  parseWhatsAppGuestCard,
  generateStandardWhatsAppCard,
  WhatsAppParseResult
} from '../utils/whatsappParser.ts';

interface WhatsAppImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (parsedData: Partial<Reservation>) => void;
  initialText?: string;
  currentFormData?: Partial<Reservation>;
}

export const SAMPLE_WHATSAPP_TEXT = `📋 FICHA DE PRÉ-CADASTRO DE HÓSPEDE
Olá! Para agilizar seu acesso e cadastro na portaria do condomínio, por favor preencha os dados abaixo e nos envie de volta:

🏢 ESTADIA:
* Apto: 101
* Data de Entrada: 09/10/2026 
* Data de Saída: 13/10/2026

👤 DADOS DO HÓSPEDE TITULAR:
* Nome Completo: BRUNO ANDERSON
* CPF: 07270115451
* Telefone/WhatsApp: 82 99170-6343 
* E-mail: NEO2.0MCZ@GMAIL.COM
* CEP: 57035400
* Endereço: RUA 1
* Cidade: MACEIO
* Estado: AL
* País: Brasil

👥 ACOMPANHANTES:
(Informe o nome completo de todos os acompanhantes ou familiares)
* 1. DEBORAH MOREIRA
* 2. HEITOR
* 3. 

🚗 VEÍCULOS (Estacionamento):
* Carro 1:
  - Modelo: FIAT ARGO
  - Placa: RGQ7E08
  - Cor: PRETO
* Carro 2 (se houver):
  - Modelo: 
  - Placa: 
  - Cor: 

📝 OBSERVAÇÕES:
• 

Muito obrigado! Desejamos uma excelente estadia. 🏨✨`;

export const WhatsAppImportModal: React.FC<WhatsAppImportModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
  initialText = '',
  currentFormData
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [inputText, setInputText] = useState<string>(initialText);
  const [parseResult, setParseResult] = useState<WhatsAppParseResult | null>(null);
  const [isCopiedExport, setIsCopiedExport] = useState<boolean>(false);
  const [exportBlank, setExportBlank] = useState<boolean>(true);
  const [exportText, setExportText] = useState<string>('');
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialText) {
        setInputText(initialText);
        setParseResult(parseWhatsAppGuestCard(initialText));
      } else {
        setInputText('');
        setParseResult(null);
      }
      setClipboardError(null);
      setExportText(generateStandardWhatsAppCard(currentFormData || {}, exportBlank));
    }
  }, [isOpen, initialText, currentFormData]);

  useEffect(() => {
    setExportText(generateStandardWhatsAppCard(currentFormData || {}, exportBlank));
  }, [exportBlank, currentFormData]);

  // Live parsing whenever inputText changes
  useEffect(() => {
    if (inputText.trim()) {
      const res = parseWhatsAppGuestCard(inputText);
      setParseResult(res);
    } else {
      setParseResult(null);
    }
  }, [inputText]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    setClipboardError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputText(text);
        } else {
          setClipboardError('A área de transferência está vazia.');
        }
      } else {
        setClipboardError('Acesso à área de transferência não suportado neste navegador. Use Ctrl+V no campo abaixo.');
      }
    } catch (err) {
      setClipboardError('Não foi possível ler automaticamente a área de transferência. Use Ctrl+V no campo abaixo.');
    }
  };

  const handleClear = () => {
    setInputText('');
    setParseResult(null);
    setClipboardError(null);
  };

  const handleApply = () => {
    if (!parseResult || parseResult.recognizedFields.length === 0) return;
    onApplyData(parseResult.data);
    onClose();
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText);
    setIsCopiedExport(true);
    setTimeout(() => setIsCopiedExport(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(exportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl shadow-xs">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Integração WhatsApp • Ficha de Hóspede</span>
                <span className="text-[10px] font-semibold bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Reconhecimento Automático
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Copie e cole a mensagem do WhatsApp para preencher o formulário do condomínio em 1 segundo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === 'import'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Clipboard className="w-4 h-4 text-emerald-600" />
            <span>📥 Colar e Reconhecer Ficha Recebida</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-t-2 ${
              activeTab === 'export'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Copy className="w-4 h-4 text-emerald-600" />
            <span>📤 Exportar / Copiar Modelo para Enviar</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
          {activeTab === 'import' ? (
            <>
              {/* Quick actions top bar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-2xs cursor-pointer"
                    title="Colar direto do que você acabou de copiar no WhatsApp"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span>Colar da Área de Transferência (1-Clique)</span>
                  </button>
                </div>

                {inputText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {clipboardError && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{clipboardError}</span>
                </div>
              )}

              {/* Text area for pasting */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="whatsapp-import-textarea" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Texto da Mensagem do WhatsApp:</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Copie no WhatsApp e cole aqui com Ctrl+V)
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">
                    {inputText.length} caracteres
                  </span>
                </div>
                <textarea
                  id="whatsapp-import-textarea"
                  rows={8}
                  placeholder={`Cole aqui o texto recebido pelo WhatsApp...\n\nExemplo:\n🏢 ESTADIA:\n* Apto: 101\n* Data de Entrada: 09/10/2026\n* Data de Saída: 13/10/2026\n\n👤 DADOS DO HÓSPEDE TITULAR:\n* Nome Completo: BRUNO ANDERSON\n* CPF: 07270115451\n...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none leading-relaxed transition-colors"
                />
              </div>

              {/* Live Recognition Preview */}
              {parseResult && parseResult.recognizedFields.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-emerald-300/80 p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                        {parseResult.recognizedFields.length} Informações Identificadas com Sucesso:
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      Pronto para Aplicar
                    </span>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    {parseResult.data.apto && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Apto</span>
                          <span className="font-bold text-slate-900">{parseResult.data.apto}</span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.entrada && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Entrada</span>
                          <span className="font-semibold text-slate-900">
                            {parseResult.recognizedFields.find((f) => f.key === 'entrada')?.value || parseResult.data.entrada}
                          </span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.saida && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Saída</span>
                          <span className="font-semibold text-slate-900">
                            {parseResult.recognizedFields.find((f) => f.key === 'saida')?.value || parseResult.data.saida}
                          </span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.nomeResponsavel && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-2">
                        <User className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Titular</span>
                          <span className="font-bold text-slate-900">{parseResult.data.nomeResponsavel}</span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.cpf && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <span className="text-slate-400 font-bold text-[10px] shrink-0">CPF:</span>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Documento</span>
                          <span className="font-semibold text-slate-900">{parseResult.data.cpf}</span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.telefone && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Telefone</span>
                          <span className="font-semibold text-slate-900">{parseResult.data.telefone}</span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.email && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-2">
                        <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">E-mail</span>
                          <span className="font-medium text-slate-900 truncate">{parseResult.data.email}</span>
                        </div>
                      </div>
                    )}

                    {(parseResult.data.endereco || parseResult.data.cidade || parseResult.data.estado) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-3">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Endereço & Localidade</span>
                          <span className="font-medium text-slate-900">
                            {[
                              parseResult.data.endereco,
                              parseResult.data.cidade,
                              parseResult.data.estado,
                              parseResult.data.cep ? `CEP: ${parseResult.data.cep}` : null
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.acompanhantes && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-3">
                        <Users className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Acompanhantes</span>
                          <span className="font-semibold text-slate-900">{parseResult.data.acompanhantes}</span>
                        </div>
                      </div>
                    )}

                    {(parseResult.data.modeloCarro1 || parseResult.data.placaCarro1) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-2">
                        <Car className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Carro 1</span>
                          <span className="font-bold text-slate-900">
                            {[parseResult.data.modeloCarro1, parseResult.data.placaCarro1, parseResult.data.corCarro1]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {(parseResult.data.modeloCarro2 || parseResult.data.placaCarro2) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 sm:col-span-2">
                        <Car className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Carro 2</span>
                          <span className="font-semibold text-slate-900">
                            {[parseResult.data.modeloCarro2, parseResult.data.placaCarro2, parseResult.data.corCarro2]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {parseResult.data.observacoes && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2 sm:col-span-3">
                        <span className="text-slate-400 font-bold text-xs shrink-0 mt-0.5">📝</span>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Observações</span>
                          <span className="text-slate-800">{parseResult.data.observacoes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inputText.trim() && parseResult && parseResult.recognizedFields.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Nenhum campo reconhecido automaticamente.</strong>
                    <span>
                      Verifique se a mensagem contém os rótulos da ficha (ex: &quot;* Apto:&quot;, &quot;* Nome Completo:&quot;, etc.) ou clique em &quot;Carregar Ficha Exemplo&quot; para testar.
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB EXPORT */
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Tipo do Modelo para WhatsApp</span>
                  <span className="text-[11px] text-slate-500">
                    Escolha se deseja enviar o modelo limpo para novos hóspedes ou preenchido com dados existentes
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setExportBlank(true)}
                    className={`text-xs py-1.5 px-3 rounded-md font-bold transition-colors cursor-pointer ${
                      exportBlank ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Modelo em Branco
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportBlank(false)}
                    className={`text-xs py-1.5 px-3 rounded-md font-bold transition-colors cursor-pointer ${
                      !exportBlank ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Com Dados Desta Reserva
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Texto Formatado para o Hóspede Preencher no WhatsApp:
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">{exportText.length} caracteres</span>
                </div>
                <textarea
                  rows={13}
                  value={exportText}
                  onChange={(e) => setExportText(e.target.value)}
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center gap-2">
                <span className="text-base">💡</span>
                <span>
                  O hóspede só precisará responder completando os campos solicitados. Quando ele responder, copie a mensagem dele e use a aba &quot;Colar e Reconhecer Ficha Recebida&quot;.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {activeTab === 'import' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!parseResult || parseResult.recognizedFields.length === 0}
                onClick={handleApply}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm ${
                  parseResult && parseResult.recognizedFields.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/20'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {parseResult && parseResult.recognizedFields.length > 0
                    ? `Confirmar e Preencher Ficha (${parseResult.recognizedFields.length} campos)`
                    : 'Aguardando Texto Válido...'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyExport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-emerald-600 text-emerald-800 hover:bg-emerald-50 bg-white transition-colors cursor-pointer shadow-2xs"
              >
                {isCopiedExport ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-700" />
                    <span>Copiar Modelo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Abrir no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

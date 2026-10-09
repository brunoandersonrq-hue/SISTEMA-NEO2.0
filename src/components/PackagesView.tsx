import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  UserCheck,
  Edit2,
  X,
  Building2,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Phone,
  PenLine,
  RotateCcw,
  FileSignature
} from 'lucide-react';
import { PackageDelivery, ApartmentProfile } from '../types.ts';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';
import { INITIAL_APARTMENT_PROFILES } from '../data/apartmentProfiles.ts';
import { getBrasiliaCurrentDateTime, formatBrasiliaDateTime } from '../utils/formatters.ts';
import { ApartmentsRegistryModal } from './ApartmentsRegistryModal.tsx';

const getCleanPhone = (phone?: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
};

const generateWhatsAppPackageMessage = (
  pkg: { apto: string; destinatario: string; transportadora: string; dataChegada: string; observacoes?: string },
  profile?: ApartmentProfile
) => {
  const nomeMorador = profile?.proprietario ? profile.proprietario : pkg.destinatario;
  const dataFormatada = formatBrasiliaDateTime(pkg.dataChegada, false);
  const obsLine = pkg.observacoes ? `\n• *Observações:* ${pkg.observacoes}` : '';

  return `Olá, *${nomeMorador}* (Apto *${pkg.apto}*)! 📦\n\nInformamos que chegou uma encomenda para você na Recepção / Portaria do Condomínio.\n\n• *Destinatário:* ${pkg.destinatario}\n• *Transportadora:* ${pkg.transportadora}\n• *Data/Hora de Chegada:* ${dataFormatada}${obsLine}\n\nPor favor, compareça à recepção para retirada portando documento de identificação.\n\nAtenciosamente,\n*Portaria & Recepção do Condomínio*`;
};

const getWhatsAppUrl = (phone: string, text: string) => {
  const clean = getCleanPhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};

/**
 * Componente de assinatura touch para smartphones, tablets e desktop
 */
const SignaturePad: React.FC<{
  value?: string;
  onChange: (dataUrl: string) => void;
}> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!value);

  // Inicializa o canvas com suporte a Retina/alta resolução (DPI)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Se já houver assinatura prévia salva
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
      setHasDrawn(true);
    }
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignorar caso o navegador não suporte pointer capture
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
    onChange(canvas.toDataURL('image/png'));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasDrawn(false);
    onChange('');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-emerald-700" />
          <span>Assinatura / Rubrica de Quem Retirou</span>
          <span className="text-[10px] text-slate-400 font-normal">(assine na tela com o dedo)</span>
        </label>
        {hasDrawn && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar / Rubricar Novamente</span>
          </button>
        )}
      </div>

      <div
        className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden select-none hover:border-emerald-400 transition-colors"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className="w-full h-32 block cursor-crosshair bg-white"
        />

        {/* Guia visual enquanto o usuário não assinou */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 p-2">
            <PenLine className="w-5 h-5 mb-1 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">
              Assine ou rubrique aqui com o dedo ou caneta
            </p>
            <p className="text-[10px] text-slate-400">
              Toque e deslize direto na tela do celular
            </p>
          </div>
        )}

        {/* Linha de base discreta para alinhamento da assinatura */}
        <div className="absolute bottom-6 left-4 right-4 border-b border-dashed border-slate-300/80 pointer-events-none" />
      </div>
    </div>
  );
};

interface PackagesViewProps {
  packages: PackageDelivery[];
  onAddPackage: (pkg: PackageDelivery) => void;
  onDeliverPackage: (id: string, retiradoPor: string, dataRetirada?: string, assinatura?: string) => void;
  onUpdatePackage?: (pkg: PackageDelivery) => void;
  apartments?: ApartmentProfile[];
  onUpdateApartment?: (updated: ApartmentProfile) => void;
  onAddApartment?: (created: ApartmentProfile) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  onAddPackage,
  onDeliverPackage,
  apartments: propApartments,
  onUpdateApartment: propOnUpdateApartment,
  onAddApartment: propOnAddApartment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'aguardando' | 'retirado'>('todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAptosModalOpen, setIsAptosModalOpen] = useState(false);

  // Fallback apartments state if not provided via props
  const [localApartments, setLocalApartments] = useState<ApartmentProfile[]>(INITIAL_APARTMENT_PROFILES);
  const apartments = propApartments || localApartments;
  const handleUpdateApto = (updated: ApartmentProfile) => {
    if (propOnUpdateApartment) {
      propOnUpdateApartment(updated);
    } else {
      setLocalApartments((prev) => prev.map((a) => (a.apto === updated.apto ? updated : a)));
    }
  };

  // Delivery Modal State (for pending packages or editing withdrawal of existing packages)
  const [deliveringPackage, setDeliveringPackage] = useState<PackageDelivery | null>(null);
  const [retiradoPor, setRetiradoPor] = useState('');
  const [dataHoraRetirada, setDataHoraRetirada] = useState('');
  const [assinatura, setAssinatura] = useState('');
  const [viewingSignature, setViewingSignature] = useState<PackageDelivery | null>(null);

  // WhatsApp Notification State
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    pkg: {
      apto: string;
      destinatario: string;
      transportadora: string;
      dataChegada: string;
      observacoes?: string;
    };
    profile?: ApartmentProfile;
    url: string;
    messageText: string;
  } | null>(null);

  // New package form state
  const [formData, setFormData] = useState({
    apto: '',
    destinatario: '',
    transportadora: 'Mercado Livre',
    dataChegada: getBrasiliaCurrentDateTime(),
    recebidoPor: 'Portaria Diurna',
    observacoes: ''
  });

  // Find apartment profile corresponding to currently typed apto in form
  const matchedAptoProfile = apartments.find(
    (a) => a.apto.toLowerCase().trim() === formData.apto.toLowerCase().trim()
  );

  const handleOpenAddForm = () => {
    setFormData((prev) => ({
      ...prev,
      dataChegada: getBrasiliaCurrentDateTime()
    }));
    setShowAddForm(!showAddForm);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apto || !formData.destinatario || !formData.dataChegada) return;

    const newPkg: PackageDelivery = {
      id: `pkg-${Date.now()}`,
      apto: formData.apto,
      destinatario: formData.destinatario.toUpperCase(),
      transportadora: formData.transportadora,
      dataChegada: formData.dataChegada,
      status: 'aguardando',
      recebidoPor: formData.recebidoPor,
      observacoes: formData.observacoes.trim() || undefined
    };

    onAddPackage(newPkg);

    const profile = apartments.find(
      (a) => a.apto.toLowerCase().trim() === formData.apto.toLowerCase().trim()
    );

    if (notifyWhatsApp) {
      const messageText = generateWhatsAppPackageMessage(newPkg, profile);
      const url = getWhatsAppUrl(profile?.celular || '', messageText);
      setWhatsAppModalData({
        pkg: newPkg,
        profile,
        url,
        messageText
      });
    }

    setShowAddForm(false);
    setFormData({
      apto: '',
      destinatario: '',
      transportadora: 'Mercado Livre',
      dataChegada: getBrasiliaCurrentDateTime(),
      recebidoPor: 'Portaria Diurna',
      observacoes: ''
    });
  };

  const handleNotifyPackageViaWhatsApp = (pkg: PackageDelivery) => {
    const profile = apartments.find(
      (a) => a.apto.toLowerCase().trim() === pkg.apto.toLowerCase().trim()
    );
    const messageText = generateWhatsAppPackageMessage(pkg, profile);
    const url = getWhatsAppUrl(profile?.celular || '', messageText);
    setWhatsAppModalData({
      pkg,
      profile,
      url,
      messageText
    });
  };

  const handleCopyMessage = () => {
    if (!whatsAppModalData) return;
    navigator.clipboard.writeText(whatsAppModalData.messageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleStartDelivery = (item: PackageDelivery) => {
    setDeliveringPackage(item);
    setRetiradoPor(item.retiradoPor || item.destinatario);
    setAssinatura(item.assinatura || '');
    
    // If it already has a withdrawal date, use it; otherwise use current Brasília time
    if (item.dataRetirada) {
      const clean = item.dataRetirada.includes(' ')
        ? item.dataRetirada.replace(' ', 'T')
        : item.dataRetirada;
      setDataHoraRetirada(clean);
    } else {
      setDataHoraRetirada(getBrasiliaCurrentDateTime());
    }
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringPackage || !retiradoPor.trim()) return;

    onDeliverPackage(
      deliveringPackage.id,
      retiradoPor.trim(),
      dataHoraRetirada || getBrasiliaCurrentDateTime(),
      assinatura || undefined
    );

    setDeliveringPackage(null);
    setRetiradoPor('');
    setDataHoraRetirada('');
    setAssinatura('');
  };

  const filtered = packages.filter((p) => {
    const matchesSearch =
      p.apto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transportadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.observacoes && p.observacoes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.retiradoPor && p.retiradoPor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = packages.filter((p) => p.status === 'aguardando').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Controle de Encomendas</h2>
            <p className="text-xs text-slate-500">
              Registro de mercadorias recebidas na portaria e comprovante de retirada pelo morador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAptosModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs border border-slate-750"
            title="Abrir Lista de Cadastro dos Apartamentos"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Lista de Cadastro dos Apartamentos</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Fechar Cadastro' : 'Registrar Nova Encomenda'}</span>
          </button>
        </div>
      </div>

      {/* New Package Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border-2 border-blue-600/30 shadow-xs space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-700" />
                Dar Entrada de Pacote / Encomenda na Portaria
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ao selecionar o apartamento, os dados do morador e WhatsApp cadastrados são identificados automaticamente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Apartamento *
              </label>
              <input
                type="text"
                placeholder="Ex: 304"
                value={formData.apto}
                onChange={(e) => setFormData({ ...formData, apto: e.target.value })}
                list="packages-aptos-list"
                autoComplete="off"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                required
              />
              <datalist id="packages-aptos-list">
                <option value="Condomínio" />
                {BUILDING_APARTMENTS.map((ap) => (
                  <option key={ap} value={ap} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Nome no Pacote *
              </label>
              <input
                type="text"
                placeholder="Destinatário impresso na etiqueta"
                value={formData.destinatario}
                onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Transportadora *
              </label>
              <select
                value={formData.transportadora}
                onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
              >
                <option value="Mercado Livre">Mercado Livre</option>
                <option value="Amazon Brasil">Amazon Brasil</option>
                <option value="Correios (Sedex/PAC)">Correios (Sedex/PAC)</option>
                <option value="Shopee Express">Shopee Express</option>
                <option value="Loggi">Loggi</option>
                <option value="Jadlog">Jadlog</option>
                <option value="Outra / Entregador Particular">Outra / Entregador Particular</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Data e Hora de Chegada *
              </label>
              <input
                type="datetime-local"
                value={formData.dataChegada}
                onChange={(e) => setFormData({ ...formData, dataChegada: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Recepcionista (Recebido por) *
              </label>
              <input
                type="text"
                placeholder="Ex: Portaria Diurna / Nome"
                value={formData.recebidoPor}
                onChange={(e) => setFormData({ ...formData, recebidoPor: e.target.value })}
                list="packages-receptionist-list"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
                required
              />
              <datalist id="packages-receptionist-list">
                <option value="Portaria Diurna" />
                <option value="Portaria Noturna / Vigia" />
                <option value="Recepção Central" />
                <option value="Zelador" />
                <option value="Administração" />
              </datalist>
            </div>
          </div>

          {/* Campo de Observações */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Caixa volumosa, pacote frágil, envelope pardo, prateleira B da portaria, avisar com urgência..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white placeholder:font-normal"
            />
          </div>

          {/* Smart Resident Identification Banner */}
          {matchedAptoProfile ? (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">
                      Morador Cadastrado: {matchedAptoProfile.proprietario}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {matchedAptoProfile.tipoApto}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      WhatsApp: {matchedAptoProfile.celular || 'Sem celular'}
                    </span>
                    {matchedAptoProfile.email && (
                      <span className="text-slate-500">({matchedAptoProfile.email})</span>
                    )}
                  </div>
                </div>
              </div>

              {!formData.destinatario && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, destinatario: matchedAptoProfile.proprietario })
                  }
                  className="text-[11px] bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Copiar o nome do morador cadastrado para o destinatário"
                >
                  + Preencher com este morador
                </button>
              )}
            </div>
          ) : (
            formData.apto.trim().length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-amber-800">
                  ⚠️ O apartamento <strong>{formData.apto}</strong> ainda não foi encontrado no cadastro geral de apartamentos.
                </div>
                <button
                  type="button"
                  onClick={() => setIsAptosModalOpen(true)}
                  className="text-[11px] text-amber-900 bg-white border border-amber-300 font-semibold px-2.5 py-1 rounded-md hover:bg-amber-100 cursor-pointer self-start sm:self-auto"
                >
                  Consultar / Cadastrar Apartamentos
                </button>
              </div>
            )
          )}

          {/* WhatsApp Notification Trigger Toggle */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Enviar notificação via WhatsApp ao salvar a encomenda
              </span>
            </label>

            {matchedAptoProfile?.celular ? (
              <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Destino: {matchedAptoProfile.celular}
              </span>
            ) : (
              formData.apto && (
                <span className="text-[11px] text-slate-500 italic">
                  (Sem telefone cadastrado para o apto)
                </span>
              )
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Salvar & {notifyWhatsApp && matchedAptoProfile?.celular ? 'Notificar WhatsApp' : 'Registrar Encomenda'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Delivery / Withdrawal Modal (Data e Hora de Retirada em Horário de Brasília Editável) */}
      {deliveringPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
          <form
            onSubmit={handleConfirmDelivery}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full space-y-4 animate-scaleUp border border-slate-200 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {deliveringPackage.status === 'retirado' ? 'Editar Retirada' : 'Registrar Retirada da Encomenda'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Apto {deliveringPackage.apto} • {deliveringPackage.destinatario} ({deliveringPackage.transportadora})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeliveringPackage(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-slate-600 flex justify-between">
                <span>Data de Chegada na Portaria:</span>
                <span className="font-medium text-slate-800">{formatBrasiliaDateTime(deliveringPackage.dataChegada, false)}</span>
              </div>
              {deliveringPackage.observacoes && (
                <div className="text-slate-600 flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="font-medium text-slate-700">Observações:</span>
                  <span className="text-slate-800 font-medium">{deliveringPackage.observacoes}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Nome de Quem Retirou
                </label>
                <input
                  type="text"
                  placeholder="Nome do morador ou autorizado"
                  value={retiradoPor}
                  onChange={(e) => setRetiradoPor(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Data e Hora de Retirada (Horário de Brasília)
                </label>
                <input
                  type="datetime-local"
                  value={dataHoraRetirada}
                  onChange={(e) => setDataHoraRetirada(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium bg-white"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Pré-preenchido no Horário Oficial de Brasília. Você pode editar data e hora livremente.
                </span>
              </div>

              {/* Assinatura / Rubrica Digital do Recebedor na Tela do Celular */}
              <div className="pt-2 border-t border-slate-100">
                <SignaturePad
                  value={assinatura}
                  onChange={(sig) => setAssinatura(sig)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeliveringPackage(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Retirada</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por apto, morador, transportadora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({packages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('aguardando')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'aguardando' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Aguardando ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('retirado')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'retirado' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Retirados
          </button>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma encomenda encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    item.status === 'aguardando' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs bg-blue-900 text-white px-2 py-0.5 rounded-md">
                      Apto {item.apto}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{item.destinatario}</span>
                    <span className="text-[11px] text-slate-500">({item.transportadora})</span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      Chegada: {formatBrasiliaDateTime(item.dataChegada, false)}
                    </span>
                    {item.status === 'retirado' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-emerald-700 font-medium">
                          ✓ Retirado por: {item.retiradoPor} em {formatBrasiliaDateTime(item.dataRetirada, false)}
                        </span>
                        {item.assinatura && (
                          <button
                            type="button"
                            onClick={() => setViewingSignature(item)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            title="Ver assinatura/rubrica digital coletada na entrega"
                          >
                            <PenLine className="w-3 h-3 text-blue-600" />
                            <span>Ver Assinatura</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {item.observacoes && (
                    <div className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-md px-2 py-0.5 w-fit">
                      <span className="font-bold text-slate-700">Obs:</span>
                      <span className="text-slate-600 font-medium">{item.observacoes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {item.status === 'aguardando' ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleNotifyPackageViaWhatsApp(item)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Enviar notificação no WhatsApp do morador cadastrado"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Avisar WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartDelivery(item)}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Dar Baixa / Entregar</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Entregue</span>
                    </span>
                    {item.assinatura && (
                      <button
                        type="button"
                        onClick={() => setViewingSignature(item)}
                        className="text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="Ver assinatura do recebedor"
                      >
                        <PenLine className="w-3 h-3" />
                        <span>Assinatura</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartDelivery(item)}
                      className="text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="Editar dados da retirada"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Lista de Cadastro dos Apartamentos */}
      <ApartmentsRegistryModal
        isOpen={isAptosModalOpen}
        onClose={() => setIsAptosModalOpen(false)}
        apartments={apartments}
        onUpdateApartment={handleUpdateApto}
        onAddApartment={propOnAddApartment}
      />

      {/* WhatsApp Notification Modal */}
      {whatsAppModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Notificação via WhatsApp • Apto {whatsAppModalData.pkg.apto}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aviso automático de encomenda pronta para retirada na recepção
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppModalData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resident details card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destinatário no Pacote:</span>
                <span className="font-bold text-slate-900">{whatsAppModalData.pkg.destinatario}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Morador no Cadastro:</span>
                <span className="font-bold text-emerald-800">
                  {whatsAppModalData.profile?.proprietario || 'Não encontrado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Celular WhatsApp:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {whatsAppModalData.profile?.celular || (
                    <span className="text-amber-600 font-medium">Não cadastrado</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transportadora:</span>
                <span className="font-medium text-slate-800">{whatsAppModalData.pkg.transportadora}</span>
              </div>
              {whatsAppModalData.pkg.observacoes && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Observações:</span>
                  <span className="font-medium text-slate-800">{whatsAppModalData.pkg.observacoes}</span>
                </div>
              )}
            </div>

            {/* Message preview speech bubble */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Mensagem que será enviada:</label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono font-medium max-h-48 overflow-y-auto">
                {whatsAppModalData.messageText}
              </div>
            </div>

            {/* Warning if no phone registered */}
            {!whatsAppModalData.profile?.celular && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
                <span>⚠️ Este apartamento ainda não possui celular no cadastro.</span>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppModalData(null);
                    setIsAptosModalOpen(true);
                  }}
                  className="text-amber-900 font-bold underline hover:text-amber-950 shrink-0 cursor-pointer"
                >
                  Cadastrar agora
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWhatsAppModalData(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>

              {whatsAppModalData.profile?.celular ? (
                <a
                  href={whatsAppModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsAppModalData(null)}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir WhatsApp & Enviar</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização do Comprovante de Assinatura */}
      {viewingSignature && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-md w-full space-y-4 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <PenLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Comprovante de Retirada com Assinatura
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Apto {viewingSignature.apto} • {viewingSignature.destinatario}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingSignature(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Destinatário:</span>
                <span className="font-bold text-slate-900">{viewingSignature.destinatario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Retirado Por:</span>
                <span className="font-bold text-emerald-800">{viewingSignature.retiradoPor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data e Hora:</span>
                <span className="font-medium text-slate-700">{formatBrasiliaDateTime(viewingSignature.dataRetirada, false)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transportadora:</span>
                <span className="font-medium text-slate-700">{viewingSignature.transportadora}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Rubrica / Assinatura Digital Coletada na Portaria:
              </span>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[140px] shadow-inner">
                {viewingSignature.assinatura ? (
                  <img
                    src={viewingSignature.assinatura}
                    alt={`Assinatura de ${viewingSignature.retiradoPor}`}
                    className="max-h-36 max-w-full object-contain filter contrast-125"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic">Nenhuma assinatura registrada</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingSignature(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

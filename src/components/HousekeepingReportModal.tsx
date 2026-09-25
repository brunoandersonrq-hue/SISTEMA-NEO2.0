import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Building2,
  Sparkles,
  Home,
  Key,
  Luggage,
  BarChart3,
  PieChart,
  Percent,
  TrendingUp,
  Layers,
  Phone
} from 'lucide-react';
import { CleaningSlot, CleaningStatus, MaidName, ApartmentProfile, ApartmentType } from '../types.ts';
import { DAYS_OF_WEEK, MAIDS, TIME_SLOTS } from '../data/housekeepingMockData.ts';

interface HousekeepingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: CleaningSlot[];
  apartments: ApartmentProfile[];
  currentWeekOffset: number;
  selectableWeeks: { offset: number; label: string; title: string }[];
  currentWeekDays: { key: string; name: string; shortName: string; dateStr: string; fullDate: string }[];
}

export const HousekeepingReportModal: React.FC<HousekeepingReportModalProps> = ({
  isOpen,
  onClose,
  slots,
  apartments,
  currentWeekOffset,
  selectableWeeks,
  currentWeekDays
}) => {
  // Navigation tabs inside the modal
  const [activeTab, setActiveTab] = useState<'graficos' | 'tabela'>('graficos');

  // Filter states
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'todas'>(currentWeekOffset);
  const [selectedMaidFilter, setSelectedMaidFilter] = useState<string>('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [cleaningScope, setCleaningScope] = useState<'efetivas' | 'todas'>('efetivas'); // efetivas: concluidas + encaixes | todas: inclui agendadas
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Helper to find apartment info
  const getAptoInfo = (aptoNum: string) => {
    if (!aptoNum || aptoNum === 'VAGO' || aptoNum === 'AUSENTE') return null;
    return apartments.find((a) => a.apto.toLowerCase() === aptoNum.toLowerCase().trim());
  };

  // Pre-filter slots according to period
  const periodFilteredSlots = useMemo(() => {
    if (selectedWeekFilter === 'todas') {
      return slots;
    }

    const currentWeekDateSet = new Set(currentWeekDays.map((d) => d.fullDate));
    if (selectedWeekFilter === currentWeekOffset) {
      // Current selected view week
      return slots.filter((s) => {
        if (s.dayDate) return currentWeekDateSet.has(s.dayDate);
        return currentWeekOffset === 0;
      });
    }

    // Specific week offset
    const targetWeekDays = selectableWeeks.find((w) => w.offset === selectedWeekFilter);
    if (!targetWeekDays) return slots;

    return slots.filter((s) => {
      if (s.dayDate) {
        return currentWeekDays.some((d) => d.fullDate === s.dayDate);
      }
      return true;
    });
  }, [slots, selectedWeekFilter, currentWeekDays, currentWeekOffset, selectableWeeks]);

  // Apply maid, status and search filters (for the detailed table)
  const filteredSlots = useMemo(() => {
    return periodFilteredSlots.filter((slot) => {
      if (selectedMaidFilter !== 'todas' && slot.maid !== selectedMaidFilter) {
        return false;
      }

      if (selectedStatusFilter !== 'todos' && slot.status !== selectedStatusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const aptoMatch = slot.apto.toLowerCase().includes(query);
        const obsMatch = slot.observacao ? slot.observacao.toLowerCase().includes(query) : false;
        const aptoInfo = getAptoInfo(slot.apto);
        const residentMatch = aptoInfo?.proprietario ? aptoInfo.proprietario.toLowerCase().includes(query) : false;
        if (!aptoMatch && !obsMatch && !residentMatch) {
          return false;
        }
      }

      return true;
    });
  }, [periodFilteredSlots, selectedMaidFilter, selectedStatusFilter, searchQuery, apartments]);

  // Base slots for KPIs (respects maid filter if selected)
  const baseSlotsForKPIs = useMemo(() => {
    return periodFilteredSlots.filter((s) => {
      if (selectedMaidFilter !== 'todas' && s.maid !== selectedMaidFilter) return false;
      return true;
    });
  }, [periodFilteredSlots, selectedMaidFilter]);

  // General KPIs
  const kpis = useMemo(() => {
    const totalSlots = baseSlotsForKPIs.length;
    const agendados = baseSlotsForKPIs.filter(
      (s) => s.status === 'agendado' && s.apto !== 'VAGO' && s.apto !== 'AUSENTE'
    ).length;
    const concluidos = baseSlotsForKPIs.filter((s) => s.status === 'concluido').length;
    const encaixes = baseSlotsForKPIs.filter((s) => s.status === 'encaixe').length;
    const naoAceitou = baseSlotsForKPIs.filter((s) => s.status === 'nao_aceitou').length;
    const naoAtendeu = baseSlotsForKPIs.filter((s) => s.status === 'nao_atendeu').length;
    const vagos = baseSlotsForKPIs.filter((s) => s.status === 'vago' || s.apto === 'VAGO').length;
    const ausentes = baseSlotsForKPIs.filter((s) => s.status === 'ausente' || s.apto === 'AUSENTE').length;

    const totalLimpezasEfetivas = concluidos + encaixes;
    const totalSolicitados = agendados + concluidos + encaixes + naoAceitou + naoAtendeu;
    const taxaConclusao = totalSolicitados > 0 ? Math.round((totalLimpezasEfetivas / totalSolicitados) * 100) : 0;

    return {
      totalSlots,
      agendados,
      concluidos,
      encaixes,
      naoAceitou,
      naoAtendeu,
      vagos,
      ausentes,
      totalLimpezasEfetivas,
      taxaConclusao
    };
  }, [baseSlotsForKPIs]);

  // ==========================================
  // GRÁFICO 1: QUANTIDADE DE LIMPEZA POR CAMAREIRA
  // ==========================================
  const maidCleaningStats = useMemo(() => {
    const list = MAIDS.map((maid) => {
      const maidSlots = periodFilteredSlots.filter((s) => s.maid === maid.name);
      const concluidos = maidSlots.filter((s) => s.status === 'concluido').length;
      const encaixes = maidSlots.filter((s) => s.status === 'encaixe').length;
      const agendados = maidSlots.filter(
        (s) => s.status === 'agendado' && s.apto !== 'VAGO' && s.apto !== 'AUSENTE'
      ).length;
      const totalLimpezas = concluidos + encaixes;
      const totalComAgendados = totalLimpezas + agendados;

      return {
        name: maid.name,
        color: maid.name === 'HELENA' ? 'amber' : maid.name === 'JOSEANE' ? 'emerald' : 'purple',
        phone: maid.phone,
        concluidos,
        encaixes,
        agendados,
        totalLimpezas, // Concluídas + Encaixes
        totalComAgendados,
        horasTrabalhadas: totalLimpezas // 1h por apto
      };
    });

    const totalGeralLimpezas = list.reduce((acc, m) => acc + m.totalLimpezas, 0);
    const totalGeralComAgendados = list.reduce((acc, m) => acc + m.totalComAgendados, 0);
    const maxVal = Math.max(...list.map((m) => (cleaningScope === 'efetivas' ? m.totalLimpezas : m.totalComAgendados)), 1);

    return {
      list: list.map((m) => {
        const val = cleaningScope === 'efetivas' ? m.totalLimpezas : m.totalComAgendados;
        const totalBase = cleaningScope === 'efetivas' ? totalGeralLimpezas : totalGeralComAgendados;
        const percentage = totalBase > 0 ? Number(((val / totalBase) * 100).toFixed(1)) : 0;
        const barWidthPct = Math.round((val / maxVal) * 100);

        return {
          ...m,
          currentValue: val,
          percentage,
          barWidthPct
        };
      }),
      totalGeralLimpezas,
      totalGeralComAgendados,
      maxVal
    };
  }, [periodFilteredSlots, cleaningScope]);

  // ==========================================
  // GRÁFICO 2: QUANTIDADE DE STATUS VAGO DE CADA CAMAREIRA
  // ==========================================
  const maidVagoStats = useMemo(() => {
    const list = MAIDS.map((maid) => {
      const maidSlots = periodFilteredSlots.filter((s) => s.maid === maid.name);
      const vagos = maidSlots.filter((s) => s.status === 'vago' || s.apto === 'VAGO').length;
      const totalSlots = maidSlots.length;
      const taxaOciosidade = totalSlots > 0 ? Math.round((vagos / totalSlots) * 100) : 0;
      const ocupados = totalSlots - vagos;

      return {
        name: maid.name,
        color: maid.name === 'HELENA' ? 'amber' : maid.name === 'JOSEANE' ? 'emerald' : 'purple',
        phone: maid.phone,
        vagos,
        totalSlots,
        taxaOciosidade,
        ocupados
      };
    });

    const totalVagosGeral = list.reduce((acc, m) => acc + m.vagos, 0);
    const totalSlotsGeral = list.reduce((acc, m) => acc + m.totalSlots, 0);
    const taxaOciosidadeGeral = totalSlotsGeral > 0 ? Math.round((totalVagosGeral / totalSlotsGeral) * 100) : 0;
    const maxVagos = Math.max(...list.map((m) => m.vagos), 1);

    return {
      list: list.map((m) => {
        const pctDoTotalVagos = totalVagosGeral > 0 ? Number(((m.vagos / totalVagosGeral) * 100).toFixed(1)) : 0;
        const barWidthPct = Math.round((m.vagos / maxVagos) * 100);

        return {
          ...m,
          pctDoTotalVagos,
          barWidthPct
        };
      }),
      totalVagosGeral,
      totalSlotsGeral,
      taxaOciosidadeGeral,
      maxVagos
    };
  }, [periodFilteredSlots]);

  // ==========================================
  // GRÁFICO 3: COMPARATIVO: MORADIA vs INQUILINO vs TEMPORADA
  // (QUANTIDADE E PORCENTAGEM)
  // ==========================================
  const apartmentTypeStats = useMemo(() => {
    // Total de apartamentos cadastrados por tipo no condomínio (base 124 aptos)
    const buildingCounts = {
      morador: apartments.filter((a) => a.tipoApto === 'morador').length || 58,
      inquilino: apartments.filter((a) => a.tipoApto === 'inquilino').length || 38,
      temporada: apartments.filter((a) => a.tipoApto === 'temporada').length || 28
    };
    const totalBuildingAptos = apartments.length || 124;

    // Slots válidos de limpeza (desconsiderando VAGO e AUSENTE)
    const cleaningSlotsInPeriod = periodFilteredSlots.filter(
      (s) => s.apto && s.apto !== 'VAGO' && s.apto !== 'AUSENTE'
    );

    // Mapeamento por tipo
    const counts = {
      morador: { concluidos: 0, encaixes: 0, agendados: 0 },
      inquilino: { concluidos: 0, encaixes: 0, agendados: 0 },
      temporada: { concluidos: 0, encaixes: 0, agendados: 0 }
    };

    cleaningSlotsInPeriod.forEach((slot) => {
      const aptoInfo = getAptoInfo(slot.apto);
      const tipo: ApartmentType = aptoInfo?.tipoApto || 'morador';

      if (slot.status === 'concluido') {
        counts[tipo].concluidos += 1;
      } else if (slot.status === 'encaixe') {
        counts[tipo].encaixes += 1;
      } else if (slot.status === 'agendado') {
        counts[tipo].agendados += 1;
      }
    });

    // Totais conforme escopo (Efetivas: Concluído + Encaixe OU Todas: inclui Agendado)
    const getQty = (tipo: 'morador' | 'inquilino' | 'temporada') => {
      const c = counts[tipo];
      return cleaningScope === 'efetivas' ? c.concluidos + c.encaixes : c.concluidos + c.encaixes + c.agendados;
    };

    const qtdMoradia = getQty('morador');
    const qtdInquilino = getQty('inquilino');
    const qtdTemporada = getQty('temporada');
    const totalLimpezas = qtdMoradia + qtdInquilino + qtdTemporada;

    const pctMoradia = totalLimpezas > 0 ? Number(((qtdMoradia / totalLimpezas) * 100).toFixed(1)) : 0;
    const pctInquilino = totalLimpezas > 0 ? Number(((qtdInquilino / totalLimpezas) * 100).toFixed(1)) : 0;
    const pctTemporada = totalLimpezas > 0 ? Number(((qtdTemporada / totalLimpezas) * 100).toFixed(1)) : 0;

    const categories = [
      {
        id: 'morador' as const,
        label: 'MORADIA',
        subLabel: 'Morador Proprietário Residente',
        icon: Home,
        color: 'blue',
        badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        barColor: 'bg-blue-600',
        ringColor: 'ring-blue-500',
        textColor: 'text-blue-700',
        bgCard: 'bg-blue-50/50 border-blue-200',
        quantidade: qtdMoradia,
        porcentagem: pctMoradia,
        concluidos: counts.morador.concluidos,
        encaixes: counts.morador.encaixes,
        agendados: counts.morador.agendados,
        totalAptosEdificio: buildingCounts.morador,
        pctAptosEdificio: Math.round((buildingCounts.morador / totalBuildingAptos) * 100)
      },
      {
        id: 'inquilino' as const,
        label: 'INQUILINO',
        subLabel: 'Locação Residencial Anual / Fixa',
        icon: Key,
        color: 'amber',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        barColor: 'bg-amber-500',
        ringColor: 'ring-amber-500',
        textColor: 'text-amber-700',
        bgCard: 'bg-amber-50/50 border-amber-200',
        quantidade: qtdInquilino,
        porcentagem: pctInquilino,
        concluidos: counts.inquilino.concluidos,
        encaixes: counts.inquilino.encaixes,
        agendados: counts.inquilino.agendados,
        totalAptosEdificio: buildingCounts.inquilino,
        pctAptosEdificio: Math.round((buildingCounts.inquilino / totalBuildingAptos) * 100)
      },
      {
        id: 'temporada' as const,
        label: 'TEMPORADA',
        subLabel: 'Airbnb, Booking e Short-Stay',
        icon: Luggage,
        color: 'purple',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        barColor: 'bg-purple-600',
        ringColor: 'ring-purple-500',
        textColor: 'text-purple-700',
        bgCard: 'bg-purple-50/50 border-purple-200',
        quantidade: qtdTemporada,
        porcentagem: pctTemporada,
        concluidos: counts.temporada.concluidos,
        encaixes: counts.temporada.encaixes,
        agendados: counts.temporada.agendados,
        totalAptosEdificio: buildingCounts.temporada,
        pctAptosEdificio: Math.round((buildingCounts.temporada / totalBuildingAptos) * 100)
      }
    ];

    return {
      categories,
      totalLimpezas,
      totalBuildingAptos
    };
  }, [periodFilteredSlots, apartments, cleaningScope]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Data',
      'Horario',
      'Camareira',
      'Apartamento',
      'Morador',
      'Tipo_Perfil',
      'Status',
      'Observacao'
    ];
    const rows = filteredSlots.map((slot) => {
      const aptoInfo = getAptoInfo(slot.apto);
      const tipoPerfil =
        aptoInfo?.tipoApto === 'temporada'
          ? 'TEMPORADA'
          : aptoInfo?.tipoApto === 'inquilino'
          ? 'INQUILINO'
          : 'MORADIA';

      const statusLabel =
        slot.status === 'concluido'
          ? 'Concluido'
          : slot.status === 'encaixe'
          ? 'Encaixe'
          : slot.status === 'nao_aceitou'
          ? 'Nao Aceitou'
          : slot.status === 'nao_atendeu'
          ? 'Nao Atendeu'
          : slot.status === 'ausente'
          ? 'Ausente'
          : slot.status === 'vago'
          ? 'Vago'
          : 'Agendado';

      return [
        `"${slot.dayDate || slot.dayKey}"`,
        `"${slot.timeSlot}"`,
        `"${slot.maid}"`,
        `"${slot.apto}"`,
        `"${aptoInfo?.proprietario || 'N/A'}"`,
        `"${tipoPerfil}"`,
        `"${statusLabel}"`,
        `"${slot.observacao || ''}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_grafico_camareiras_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Text Summary (with all 3 graphical datasets included!)
  const handleCopySummary = () => {
    const periodLabel =
      selectedWeekFilter === 'todas'
        ? 'Todo o Histórico Cadastrado'
        : selectableWeeks.find((w) => w.offset === selectedWeekFilter)?.label || 'Semana Selecionada';

    let text = `*📊 RELATÓRIO GRÁFICO & OPERACIONAL • CAMAREIRAS • EDIFÍCIO NEO 2.0*\n`;
    text += `*Período:* ${periodLabel}\n`;
    text += `*Gerado em:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `----------------------------------------\n\n`;

    text += `*1️⃣ QUANTIDADE DE LIMPEZAS POR CAMAREIRA:*\n`;
    maidCleaningStats.list.forEach((m) => {
      text += `• *${m.name}*: ${m.totalLimpezas} limpezas (${m.percentage}% do total) [${m.concluidos} concluídas + ${m.encaixes} encaixes] ~${m.horasTrabalhadas}h trab.\n`;
    });
    text += `Total de Limpezas Realizadas: ${maidCleaningStats.totalGeralLimpezas}\n\n`;

    text += `*2️⃣ STATUS VAGO POR CAMAREIRA:*\n`;
    maidVagoStats.list.forEach((m) => {
      text += `• *${m.name}*: ${m.vagos} horários vagos (${m.pctDoTotalVagos}% das vagas | ociosidade de ${m.taxaOciosidade}%)\n`;
    });
    text += `Total de Horários Vagos no Período: ${maidVagoStats.totalVagosGeral} vagas (Ociosidade geral: ${maidVagoStats.taxaOciosidadeGeral}%)\n\n`;

    text += `*3️⃣ COMPARAÇÃO DE LIMPEZAS POR PERFIL DE APTO (QTD & %):*\n`;
    apartmentTypeStats.categories.forEach((cat) => {
      text += `• *${cat.label}*: ${cat.quantidade} limpezas (${cat.porcentagem}%) [${cat.concluidos} concluídas, ${cat.encaixes} encaixes]\n`;
    });
    text += `Total Base Analisada: ${apartmentTypeStats.totalLimpezas} limpezas\n\n`;

    text += `*📈 RESUMO GERAL DO CONDOMÍNIO:*\n`;
    text += `• ✅ Limpezas Concluídas: ${kpis.concluidos}\n`;
    text += `• 🔄 Encaixes: ${kpis.encaixes}\n`;
    text += `• ❌ Não Aceitou: ${kpis.naoAceitou}\n`;
    text += `• 🚪 Não Atendeu: ${kpis.naoAtendeu}\n`;
    text += `• ⭕ Horários Vagos: ${kpis.vagos}\n`;
    text += `• 🎯 Taxa de Conclusão: ${kpis.taxaConclusao}%\n\n`;

    text += `_Relatório emitido pelo Sistema de Gestão do Edifício NEO 2.0_`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-scaleUp overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Relatórios Gráficos & Analíticos das Camareiras
                </h2>
                <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/30">
                  Edifício NEO 2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Quantidade de limpezas, horários vagos e distribuição Moradia vs Inquilino vs Temporada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigator */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 pt-2 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('graficos')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition-all cursor-pointer ${
                activeTab === 'graficos'
                  ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios Gráficos Comparativos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tabela')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition-all cursor-pointer ${
                activeTab === 'tabela'
                  ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tabela Detalhada de Atendimentos ({filteredSlots.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Copiar dados formatados para WhatsApp"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-black">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Exportar planilha (.CSV / Excel)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Imprimir relatório gráfico"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          {/* Global Filter Bar */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Period selection */}
              <div className="min-w-[200px]">
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Período da Análise</span>
                </label>
                <select
                  value={selectedWeekFilter}
                  onChange={(e) =>
                    setSelectedWeekFilter(e.target.value === 'todas' ? 'todas' : Number(e.target.value))
                  }
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value={currentWeekOffset}>Semana Atual em Exibição</option>
                  <option value="todas">Todas as Semanas / Histórico Completo</option>
                  {selectableWeeks.map((w) => (
                    <option key={w.offset} value={w.offset}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cleaning Scope Toggle (Efetivas vs Todas) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Base das Limpezas</span>
                </label>
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => setCleaningScope('efetivas')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-colors cursor-pointer ${
                      cleaningScope === 'efetivas'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Efetivas (Concluídas + Encaixes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCleaningScope('todas')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-colors cursor-pointer ${
                      cleaningScope === 'todas'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas (+ Agendadas)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-[11px] text-blue-950 font-semibold shrink-0">
              <span className="block text-blue-700 font-bold">Resumo do Período:</span>
              <span>
                {kpis.totalLimpezasEfetivas} limpezas realizadas • {kpis.vagos} vagas disponíveis
              </span>
            </div>
          </div>

          {/* TAB 1: RELATÓRIOS GRÁFICOS */}
          {activeTab === 'graficos' && (
            <div className="space-y-6">
              {/* ============================================================== */}
              {/* GRÁFICO 3 EM DESTAQUE: MORADIA vs INQUILINO vs TEMPORADA        */}
              {/* ============================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        3. Comparativo de Limpezas: Moradia vs Inquilino vs Temporada
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Quantidade & Porcentagem
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Proporção de atendimento entre moradores proprietários, inquilinos e locações de temporada
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold block">Total de Limpezas Analisadas</span>
                    <strong className="text-lg font-black text-slate-900">
                      {apartmentTypeStats.totalLimpezas} atendimentos
                    </strong>
                  </div>
                </div>

                {/* Barra Proporcional Empilhada (100% Stacked Bar) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-0.5">
                    <span>Distribuição Percentual Proporcional</span>
                    <span>100% da Demanda</span>
                  </div>

                  {apartmentTypeStats.totalLimpezas === 0 ? (
                    <div className="h-9 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                      Nenhuma limpeza registrada no período selecionado.
                    </div>
                  ) : (
                    <div className="h-9 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100 p-1 gap-1 border border-slate-200">
                      {apartmentTypeStats.categories.map((cat) => {
                        if (cat.porcentagem <= 0) return null;
                        return (
                          <div
                            key={cat.id}
                            style={{ width: `${cat.porcentagem}%` }}
                            className={`${cat.barColor} h-full rounded-lg transition-all duration-500 flex items-center justify-center text-white font-black text-xs shadow-xs relative group cursor-pointer`}
                            title={`${cat.label}: ${cat.quantidade} limpezas (${cat.porcentagem}%)`}
                          >
                            <span className="truncate px-1 text-[11px]">
                              {cat.label} • {cat.porcentagem}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Legenda colorida com percentuais */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs pt-1">
                    {apartmentTypeStats.categories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-1.5 font-bold">
                        <span className={`w-3 h-3 rounded-full ${cat.barColor}`} />
                        <span className="text-slate-800">{cat.label}:</span>
                        <span className="font-black text-slate-900">{cat.quantidade} limpezas</span>
                        <span className={`text-[11px] font-black px-1.5 py-0.2 rounded ${cat.badgeBg}`}>
                          {cat.porcentagem}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Cards Detalhados dos Perfis (Quantidade + Porcentagem) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {apartmentTypeStats.categories.map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        className={`p-4 rounded-xl border ${cat.bgCard} shadow-2xs space-y-3 transition-all hover:shadow-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${cat.badgeBg}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs text-slate-900">{cat.label}</h4>
                              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                                {cat.subLabel}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-sm font-black px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                              {cat.porcentagem}%
                            </span>
                          </div>
                        </div>

                        {/* Grande indicador de Quantidade */}
                        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Quantidade de Limpezas
                            </span>
                            <div className="text-2xl font-black text-slate-900 mt-0.5">
                              {cat.quantidade}{' '}
                              <span className="text-xs text-slate-500 font-medium">aptos</span>
                            </div>
                          </div>

                          <div className="text-right text-[11px]">
                            <span className="text-slate-500 block font-semibold">Participação</span>
                            <strong className={`${cat.textColor} font-black text-base`}>
                              {cat.porcentagem}%
                            </strong>
                          </div>
                        </div>

                        {/* Barra individual de progresso */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center justify-between text-slate-600 font-semibold">
                            <span>Concluídas: <strong className="text-slate-900 font-bold">{cat.concluidos}</strong></span>
                            <span>Encaixes: <strong className="text-purple-700 font-bold">{cat.encaixes}</strong></span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                            <div
                              className={`${cat.barColor} h-full rounded-full transition-all`}
                              style={{ width: `${cat.porcentagem}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium text-right pt-0.5">
                            {cat.totalAptosEdificio} unidades cadastradas ({cat.pctAptosEdificio}% do prédio)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid com os Gráficos 1 e 2 lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ============================================================== */}
                {/* GRÁFICO 1: QUANTIDADE DE LIMPEZA POR CAMAREIRA                */}
                {/* ============================================================== */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h3 className="text-sm font-black text-slate-900">
                          1. Quantidade de Limpeza por Camareira
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Total de limpezas concluídas e encaixes distribuídos por profissional
                      </p>
                    </div>

                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {maidCleaningStats.totalGeralLimpezas} total
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {maidCleaningStats.list.map((m) => (
                      <div key={m.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shadow-xs ${
                                m.name === 'HELENA'
                                  ? 'bg-amber-600'
                                  : m.name === 'JOSEANE'
                                  ? 'bg-emerald-600'
                                  : 'bg-purple-600'
                              }`}
                            >
                              {m.name[0]}
                            </span>
                            <span className="font-extrabold text-slate-900">{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({m.phone})</span>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">
                              {m.totalLimpezas} <span className="text-[10px] text-slate-500 font-semibold">limpezas</span>
                            </span>
                            <span className="bg-slate-100 text-slate-800 font-black text-[11px] px-1.5 py-0.5 rounded">
                              {m.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Barra Gráfica de Progresso */}
                        <div className="w-full bg-slate-100 rounded-xl h-4 overflow-hidden flex border border-slate-200">
                          {/* Segmento Concluídas */}
                          <div
                            style={{
                              width: `${
                                m.currentValue > 0
                                  ? (m.concluidos / (maidCleaningStats.maxVal || 1)) * 100
                                  : 0
                              }%`
                            }}
                            className={`${
                              m.name === 'HELENA'
                                ? 'bg-amber-500'
                                : m.name === 'JOSEANE'
                                ? 'bg-emerald-500'
                                : 'bg-purple-500'
                            } h-full transition-all duration-500`}
                            title={`Concluídas: ${m.concluidos}`}
                          />
                          {/* Segmento Encaixes */}
                          <div
                            style={{
                              width: `${
                                m.currentValue > 0
                                  ? (m.encaixes / (maidCleaningStats.maxVal || 1)) * 100
                                  : 0
                              }%`
                            }}
                            className="bg-purple-400 h-full transition-all duration-500"
                            title={`Encaixes: ${m.encaixes}`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                          <span>
                            ✅ {m.concluidos} concluídas • 🔄 {m.encaixes} encaixes
                          </span>
                          <span>~{m.horasTrabalhadas}h dedicadas (1h/apto)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Média por camareira no período:</span>
                    <strong className="text-slate-900 font-black">
                      {MAIDS.length > 0 ? (maidCleaningStats.totalGeralLimpezas / MAIDS.length).toFixed(1) : 0} limpezas / profissional
                    </strong>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* GRÁFICO 2: QUANTIDADE DE STATUS VAGO DE CADA CAMAREIRA        */}
                {/* ============================================================== */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <h3 className="text-sm font-black text-slate-900">
                          2. Quantidade de Status VAGO de cada Camareira
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Horários vagos disponíveis na agenda e taxa de ociosidade por escala
                      </p>
                    </div>

                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      {maidVagoStats.totalVagosGeral} vagas no total
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {maidVagoStats.list.map((m) => (
                      <div key={m.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 font-black text-[11px] flex items-center justify-center border border-rose-300">
                              {m.name[0]}
                            </span>
                            <span className="font-extrabold text-slate-900">{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({m.phone})</span>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span className="font-black text-sm text-rose-600">
                              {m.vagos} <span className="text-[10px] text-slate-500 font-semibold">vagos</span>
                            </span>
                            <span className="bg-rose-100 text-rose-800 font-black text-[11px] px-1.5 py-0.5 rounded border border-rose-200">
                              {m.taxaOciosidade}% ociosa
                            </span>
                          </div>
                        </div>

                        {/* Barra Gráfica de Vagas */}
                        <div className="w-full bg-slate-100 rounded-xl h-4 overflow-hidden flex border border-slate-200">
                          <div
                            style={{
                              width: `${(m.vagos / (maidVagoStats.maxVagos || 1)) * 100}%`
                            }}
                            className="bg-rose-500 h-full rounded-lg transition-all duration-500 shadow-2xs"
                            title={`${m.name}: ${m.vagos} horários vagos`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                          <span>
                            {m.ocupados} horários ocupados de {m.totalSlots} totais
                          </span>
                          <span className="text-rose-700">
                            {m.pctDoTotalVagos}% de todas as vagas do condomínio
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200 text-[11px] text-rose-950 flex items-center justify-between">
                    <span>Taxa média de ociosidade das escalas:</span>
                    <strong className="font-black text-rose-800">
                      {maidVagoStats.taxaOciosidadeGeral}% de horários livres
                    </strong>
                  </div>
                </div>
              </div>

              {/* Tabela Resumo Executivo das Métricas Gráficas */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="bg-slate-100 p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-700" />
                    <span>Quadro Consolidado de Produtividade & Perfil dos Imóveis</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Atualizado em tempo real conforme a escala da semana
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-200">Camareira</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">Limpezas Concluídas</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">Encaixes</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">Total Realizado</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center">% das Limpezas</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-center text-rose-700">Horários Vagos</th>
                        <th className="py-2.5 px-3 text-center">Taxa de Ociosidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {maidCleaningStats.list.map((m, idx) => {
                        const vagoInfo = maidVagoStats.list[idx];
                        return (
                          <tr key={m.name} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2 px-3 border-r border-slate-200 font-black text-slate-900 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  m.name === 'HELENA'
                                    ? 'bg-amber-500'
                                    : m.name === 'JOSEANE'
                                    ? 'bg-emerald-500'
                                    : 'bg-purple-500'
                                }`}
                              />
                              <span>{m.name}</span>
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-emerald-800">
                              {m.concluidos}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-purple-800">
                              {m.encaixes}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-black text-slate-900 bg-slate-50/50">
                              {m.totalLimpezas}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-black text-blue-700">
                              {m.percentage}%
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-black text-rose-600">
                              {vagoInfo?.vagos ?? 0}
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-700">
                              {vagoInfo?.taxaOciosidade ?? 0}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300">
                        <td className="py-2.5 px-3 border-r border-slate-200 uppercase text-slate-900">
                          Total Geral
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-emerald-900">
                          {kpis.concluidos}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-purple-900">
                          {kpis.encaixes}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-slate-950">
                          {maidCleaningStats.totalGeralLimpezas}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-blue-800">
                          100%
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-rose-700">
                          {maidVagoStats.totalVagosGeral}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-900">
                          {maidVagoStats.taxaOciosidadeGeral}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABELA DETALHADA DE ATENDIMENTOS */}
          {activeTab === 'tabela' && (
            <div className="space-y-4">
              {/* Filter controls specifically for the table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Maid Filter */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Filtrar Camareira</label>
                  <select
                    value={selectedMaidFilter}
                    onChange={(e) => setSelectedMaidFilter(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="todas">Todas as Camareiras</option>
                    <option value="HELENA">Helena</option>
                    <option value="JOSEANE">Joseane</option>
                    <option value="JOSI">Josi</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Filtrar Status</label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="concluido">✅ Limpeza Concluída</option>
                    <option value="encaixe">🔄 ENCAIXE</option>
                    <option value="agendado">📅 Agendado</option>
                    <option value="nao_aceitou">❌ NÃO ACEITOU (Dispensou)</option>
                    <option value="nao_atendeu">🚪 NÃO ATENDEU (Sem resposta)</option>
                    <option value="vago">⭕ VAGO (Livre)</option>
                    <option value="ausente">🚫 AUSENTE (Camareira Ausente)</option>
                  </select>
                </div>

                {/* Search Apt */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Buscar Apto ou Morador</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: 405 ou nome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* The Detailed Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    Registros Detalhados ({filteredSlots.length})
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Inclui perfil de ocupação (Moradia, Inquilino, Temporada)
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="py-2 px-3 border-r border-slate-200">Data / Dia</th>
                        <th className="py-2 px-3 border-r border-slate-200">Horário</th>
                        <th className="py-2 px-3 border-r border-slate-200">Camareira</th>
                        <th className="py-2 px-3 border-r border-slate-200">Apartamento</th>
                        <th className="py-2 px-3 border-r border-slate-200">Perfil do Imóvel</th>
                        <th className="py-2 px-3 border-r border-slate-200">Morador / Contato</th>
                        <th className="py-2 px-3 border-r border-slate-200">Status</th>
                        <th className="py-2 px-3">Observações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredSlots.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                            Nenhum registro encontrado com os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredSlots.map((slot) => {
                          const aptoInfo = getAptoInfo(slot.apto);
                          const isVago = slot.status === 'vago' || slot.apto === 'VAGO';
                          const isAusente = slot.status === 'ausente' || slot.apto === 'AUSENTE';
                          const isConcluido = slot.status === 'concluido';
                          const isEncaixe = slot.status === 'encaixe';
                          const isNaoAceitou = slot.status === 'nao_aceitou';
                          const isNaoAtendeu = slot.status === 'nao_atendeu';

                          const tipoPerfil = aptoInfo?.tipoApto || 'morador';

                          return (
                            <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700 whitespace-nowrap">
                                {slot.dayDate ? slot.dayDate.split('-').reverse().slice(0, 2).join('/') : ''}{' '}
                                <span className="text-[11px] text-slate-500 uppercase font-bold">
                                  ({DAYS_OF_WEEK.find((d) => d.key === slot.dayKey)?.shortName || slot.dayKey})
                                </span>
                              </td>

                              <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                                {slot.timeSlot}
                              </td>

                              <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                                    slot.maid === 'HELENA'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : slot.maid === 'JOSEANE'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                                  }`}
                                >
                                  {slot.maid}
                                </span>
                              </td>

                              <td className="py-2 px-3 border-r border-slate-200 font-black text-slate-900 whitespace-nowrap">
                                {isVago ? (
                                  <span className="text-rose-600 font-bold">VAGO</span>
                                ) : isAusente ? (
                                  <span className="text-rose-700 font-bold">AUSENTE</span>
                                ) : (
                                  <span>Apto {slot.apto}</span>
                                )}
                              </td>

                              {/* Perfil do Imóvel: Moradia / Inquilino / Temporada */}
                              <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                                {isVago || isAusente ? (
                                  <span className="text-slate-400 italic text-[11px]">—</span>
                                ) : tipoPerfil === 'temporada' ? (
                                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[10px] font-black">
                                    <Luggage className="w-3 h-3 text-purple-600" />
                                    <span>TEMPORADA</span>
                                  </span>
                                ) : tipoPerfil === 'inquilino' ? (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                                    <Key className="w-3 h-3 text-amber-600" />
                                    <span>INQUILINO</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-black">
                                    <Home className="w-3 h-3 text-blue-600" />
                                    <span>MORADIA</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                                {aptoInfo ? (
                                  <div>
                                    <span className="font-bold block text-slate-900">{aptoInfo.proprietario}</span>
                                    {aptoInfo.celular && (
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        {aptoInfo.celular}
                                      </span>
                                    )}
                                  </div>
                                ) : isVago || isAusente ? (
                                  <span className="text-slate-400 italic text-[11px]">—</span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">Não identificado</span>
                                )}
                              </td>

                              <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                                {isConcluido ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Concluído</span>
                                  </span>
                                ) : isEncaixe ? (
                                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-950 font-extrabold px-2 py-0.5 rounded text-[11px] border border-purple-300">
                                    <Sparkles className="w-3 h-3 text-purple-700" />
                                    <span>ENCAIXE</span>
                                  </span>
                                ) : isNaoAceitou ? (
                                  <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded text-[11px]">
                                    <AlertCircle className="w-3 h-3 text-slate-600" />
                                    <span>NÃO ACEITOU</span>
                                  </span>
                                ) : isNaoAtendeu ? (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-extrabold px-2 py-0.5 rounded text-[11px]">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>NÃO ATENDEU</span>
                                  </span>
                                ) : isAusente ? (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                                    AUSENTE
                                  </span>
                                ) : isVago ? (
                                  <span className="text-rose-600 font-bold bg-rose-50/50 px-2 py-0.5 rounded text-[11px]">
                                    VAGO
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px]">
                                    <Calendar className="w-3 h-3 text-blue-600" />
                                    <span>Agendado</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-2 px-3 text-slate-600 font-medium">
                                {slot.observacao ? (
                                  <span className="italic">{slot.observacao}</span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edifício NEO 2.0 • Sistema de Relatórios e Análise Operacional</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

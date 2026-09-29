import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  Share2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Building2,
  Check,
  Copy,
  Info,
  CalendarDays,
  CopyPlus,
  RefreshCw,
  FileText,
  BarChart3,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { HousekeepingReportModal } from './HousekeepingReportModal.tsx';
import {
  CleaningSlot,
  CleaningStatus,
  MaidName,
  ApartmentProfile
} from '../types.ts';
import {
  DayConfig,
  DAYS_OF_WEEK,
  MAIDS,
  TIME_SLOTS,
  INITIAL_CLEANING_SLOTS
} from '../data/housekeepingMockData.ts';
import { BUILDING_APARTMENTS } from '../data/mockReservations.ts';

const STORAGE_SLOTS_KEY = 'controle_camareiras_slots_v1';

// Base Reference Monday: 21 de Setembro de 2026
const BASE_MONDAY = new Date(2026, 8, 21, 12, 0, 0);

export function getWeekDays(weekOffset: number): DayConfig[] {
  const monday = new Date(BASE_MONDAY);
  monday.setDate(BASE_MONDAY.getDate() + weekOffset * 7);

  const dayKeys = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const shortNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return dayKeys.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const fullDate = `${year}-${monthNum}-${dayNum}`;
    const dateStr = `${dayNum}/${monthNum}`;

    return {
      key,
      name: dayNames[i],
      shortName: shortNames[i],
      dateStr,
      fullDate
    };
  });
}

export function getPeriodText(days: DayConfig[]): string {
  if (!days || days.length === 0) return '';
  const first = new Date(days[0].fullDate + 'T12:00:00');
  const last = new Date(days[days.length - 1].fullDate + 'T12:00:00');

  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const firstDay = String(first.getDate()).padStart(2, '0');
  const lastDay = String(last.getDate()).padStart(2, '0');
  const firstMonth = monthNames[first.getMonth()];
  const lastMonth = monthNames[last.getMonth()];
  const year = last.getFullYear();

  if (firstMonth === lastMonth) {
    return `${firstDay} a ${lastDay} DE ${firstMonth} de ${year}`;
  } else {
    return `${firstDay} DE ${firstMonth} a ${lastDay} DE ${lastMonth} de ${year}`;
  }
}

interface HousekeepingViewProps {
  apartments: ApartmentProfile[];
  onOpenApartmentsModal?: () => void;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({
  apartments,
  onOpenApartmentsModal
}) => {
  // Slots state from localStorage
  const [slots, setSlots] = useState<CleaningSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOTS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: CleaningSlot) => ({
            ...s,
            maid: (s.maid === 'JOSI' ? 'JOSEILDES' : s.maid) as MaidName,
            observacao:
              s.observacao?.toUpperCase() === 'ENCAIXE' ||
              (s.status === 'agendado' &&
                (s.observacao?.toUpperCase() === 'NQ' ||
                  s.observacao?.toUpperCase() === 'NÃO ACEITOU' ||
                  s.observacao?.toUpperCase() === 'NAO ACEITOU' ||
                  s.observacao?.toUpperCase() === 'NÃO ATENDEU' ||
                  s.observacao?.toUpperCase() === 'NAO ATENDEU'))
                ? ''
                : s.observacao
          }));
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar escala de camareiras:', e);
    }
    return INITIAL_CLEANING_SLOTS.map((s) => ({
      ...s,
      maid: (s.maid === 'JOSI' ? 'JOSEILDES' : s.maid) as MaidName,
      observacao:
        s.observacao?.toUpperCase() === 'ENCAIXE' ||
        (s.status === 'agendado' &&
          (s.observacao?.toUpperCase() === 'NQ' ||
            s.observacao?.toUpperCase() === 'NÃO ACEITOU' ||
            s.observacao?.toUpperCase() === 'NAO ACEITOU' ||
            s.observacao?.toUpperCase() === 'NÃO ATENDEU' ||
            s.observacao?.toUpperCase() === 'NAO ATENDEU'))
          ? ''
          : s.observacao
    }));
  });

  // Save to localStorage
  const saveSlots = (newSlots: CleaningSlot[]) => {
    setSlots(newSlots);
    try {
      localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(newSlots));
    } catch (e) {
      console.error(e);
    }
  };

  // Filters & week navigation state
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const currentWeekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const periodText = useMemo(() => getPeriodText(currentWeekDays), [currentWeekDays]);

  // Pre-calculated list of upcoming weeks (0 to 12)
  const selectableWeeks = useMemo(() => {
    const list = [];
    for (let offset = 0; offset <= 12; offset++) {
      const days = getWeekDays(offset);
      const title = getPeriodText(days);
      const label =
        offset === 0
          ? `Semana Atual (${days[0].dateStr} a ${days[days.length - 1].dateStr})`
          : offset === 1
          ? `Próxima Semana: ${days[0].dateStr} a ${days[days.length - 1].dateStr}`
          : `Semana +${offset}: ${days[0].dateStr} a ${days[days.length - 1].dateStr}`;
      list.push({ offset, label, title });
    }
    return list;
  }, []);

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('todos');
  const [selectedMaidFilter, setSelectedMaidFilter] = useState<string>('todas');
  const [searchApto, setSearchApto] = useState('');

  // Modals state
  const [editingSlot, setEditingSlot] = useState<CleaningSlot | null>(null);
  const [slotFormData, setSlotFormData] = useState<{
    apto: string;
    status: CleaningStatus;
    observacao: string;
  }>({
    apto: '',
    status: 'agendado',
    observacao: ''
  });

  // WhatsApp Maid Dispatch Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [whatsAppMaidModal, setWhatsAppMaidModal] = useState<{
    maid: MaidName;
    dayKey: string;
  } | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Copy Week Data Modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [sourceWeekOffset, setSourceWeekOffset] = useState<number>(-1);
  const [copyNotesOption, setCopyNotesOption] = useState<boolean>(true);
  const [copyOnlyVacantOption, setCopyOnlyVacantOption] = useState<boolean>(false);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  // Simple notes & observations state
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('controle_camareiras_observacoes_notas_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar anotações das camareiras:', e);
    }
    return {};
  });

  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const currentWeekKey = currentWeekDays[0]?.fullDate || 'geral';
  const currentNotes = notesMap[currentWeekKey] ?? '';

  const handleNotesChange = (text: string) => {
    const updated = { ...notesMap, [currentWeekKey]: text };
    setNotesMap(updated);
    try {
      localStorage.setItem('controle_camareiras_observacoes_notas_v1', JSON.stringify(updated));
      setNotesSavedFeedback(true);
      setTimeout(() => setNotesSavedFeedback(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyNotes = () => {
    if (!currentNotes.trim()) return;
    navigator.clipboard.writeText(currentNotes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  // Helper to find apartment info
  const getAptoInfo = (aptoNum: string) => {
    if (!aptoNum || aptoNum === 'VAGO' || aptoNum === 'AUSENTE') return null;
    return apartments.find((a) => a.apto.toLowerCase() === aptoNum.toLowerCase().trim());
  };

  // Helper to retrieve slot for a specific day, maid and time
  const getSlotForCell = (day: DayConfig, maidName: MaidName, timeStr: string): CleaningSlot => {
    const isTargetMaid = (m: string) => m === maidName || (maidName === 'JOSEILDES' && m === 'JOSI');
    const found = slots.find(
      (s) =>
        s.dayDate === day.fullDate &&
        s.timeSlot === timeStr &&
        isTargetMaid(s.maid)
    );
    if (found) return found;

    // Backwards compatibility for week 0 if legacy slot didn't have dayDate or had exact match
    if (weekOffset === 0) {
      const legacyFound = slots.find(
        (s) =>
          s.dayKey === day.key &&
          s.timeSlot === timeStr &&
          isTargetMaid(s.maid) &&
          (!s.dayDate || s.dayDate === day.fullDate)
      );
      if (legacyFound) return legacyFound;
    }

    // Return default unbooked/vago slot for this future or new day
    return {
      id: `cs-${day.fullDate}-${maidName}-${timeStr}`,
      dayKey: day.key,
      dayDate: day.fullDate,
      timeSlot: timeStr,
      maid: maidName,
      apto: 'VAGO',
      status: 'vago' as CleaningStatus,
      observacao: ''
    };
  };

  // Source week computation for the copy feature
  const sourceWeekDays = useMemo(() => getWeekDays(sourceWeekOffset), [sourceWeekOffset]);
  const sourcePeriodText = useMemo(() => getPeriodText(sourceWeekDays), [sourceWeekDays]);

  const sourceWeekSlots = useMemo(() => {
    return sourceWeekDays.flatMap((day) =>
      MAIDS.flatMap((maid) => TIME_SLOTS.map((ts) => getSlotForCell(day, maid.name, ts.time)))
    );
  }, [sourceWeekDays, slots, sourceWeekOffset]);

  const sourceActiveCleaningsCount = useMemo(() => {
    return sourceWeekSlots.filter(
      (s) => s.status !== 'vago' && s.status !== 'ausente' && s.apto !== 'VAGO' && s.apto !== 'AUSENTE'
    ).length;
  }, [sourceWeekSlots]);

  const handleOpenCopyModal = () => {
    // Default source week to previous week relative to the currently viewed week
    setSourceWeekOffset(weekOffset - 1);
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = () => {
    const targetDays = currentWeekDays;
    const sourceDays = sourceWeekDays;

    const newTargetSlots: CleaningSlot[] = [];

    targetDays.forEach((targetDay, dayIdx) => {
      const sourceDay = sourceDays[dayIdx];
      MAIDS.forEach((maid) => {
        TIME_SLOTS.forEach((ts) => {
          const sourceSlot = getSlotForCell(sourceDay, maid.name, ts.time);
          const currentTargetSlot = getSlotForCell(targetDay, maid.name, ts.time);

          if (
            copyOnlyVacantOption &&
            currentTargetSlot.status !== 'vago' &&
            currentTargetSlot.apto !== 'VAGO' &&
            currentTargetSlot.status !== 'ausente' &&
            currentTargetSlot.apto !== 'AUSENTE'
          ) {
            newTargetSlots.push(currentTargetSlot);
            return;
          }

          const targetStatus: CleaningStatus =
            sourceSlot.status === 'concluido' ? 'agendado' : sourceSlot.status;

          newTargetSlots.push({
            id: `cs-${targetDay.fullDate}-${maid.name}-${ts.time}`,
            dayKey: targetDay.key,
            dayDate: targetDay.fullDate,
            timeSlot: ts.time,
            maid: maid.name,
            apto: sourceSlot.apto,
            status: targetStatus,
            observacao: sourceSlot.observacao || ''
          });
        });
      });
    });

    const targetFullDates = new Set(targetDays.map((d) => d.fullDate));
    const preservedSlots = slots.filter((s) => !targetFullDates.has(s.dayDate));
    const finalSlots = [...preservedSlots, ...newTargetSlots];
    saveSlots(finalSlots);

    if (copyNotesOption) {
      const sourceWeekKey = sourceDays[0]?.fullDate || 'geral';
      const targetWeekKey = targetDays[0]?.fullDate || 'geral';
      const sourceNotes = notesMap[sourceWeekKey];
      if (sourceNotes) {
        const updatedNotes = { ...notesMap, [targetWeekKey]: sourceNotes };
        setNotesMap(updatedNotes);
        try {
          localStorage.setItem('controle_camareiras_observacoes_notas_v1', JSON.stringify(updatedNotes));
        } catch (e) {
          console.error(e);
        }
      }
    }

    setIsCopyModalOpen(false);
    const copiedCount = newTargetSlots.filter(
      (s) => s.status !== 'vago' && s.apto !== 'VAGO' && s.status !== 'ausente'
    ).length;
    setCopySuccessToast(
      `Escala copiada com sucesso! ${copiedCount} agendamentos aplicados para ${periodText}.`
    );
    setTimeout(() => setCopySuccessToast(null), 4500);
  };

  // Upsert slot (updates if exists, otherwise inserts)
  const upsertSlot = (slotToSave: CleaningSlot) => {
    const existingIndex = slots.findIndex(
      (s) =>
        s.id === slotToSave.id ||
        (s.dayDate === slotToSave.dayDate &&
          s.timeSlot === slotToSave.timeSlot &&
          s.maid === slotToSave.maid)
    );
    if (existingIndex >= 0) {
      const updated = [...slots];
      updated[existingIndex] = slotToSave;
      saveSlots(updated);
    } else {
      saveSlots([...slots, slotToSave]);
    }
  };

  // Open slot editor
  const handleOpenSlotEdit = (slot: CleaningSlot) => {
    setEditingSlot(slot);
    setSlotFormData({
      apto: slot.apto,
      status: slot.status,
      observacao: slot.observacao || ''
    });
  };

  // Save slot changes
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    let finalStatus = slotFormData.status;
    let finalApto = slotFormData.apto.trim().toUpperCase();

    if (!finalApto || finalApto === 'VAGO') {
      finalApto = 'VAGO';
      finalStatus = 'vago';
    } else if (finalApto === 'AUSENTE') {
      finalStatus = 'ausente';
    }

    let finalObs = slotFormData.observacao?.trim() || '';
    if (finalStatus === 'nao_aceitou') {
      finalObs = 'NÃO ACEITOU';
    } else if (finalStatus === 'nao_atendeu') {
      finalObs = 'NÃO ATENDEU';
    } else if (finalStatus === 'encaixe') {
      finalObs = 'ENCAIXE';
    } else if (finalStatus === 'checkout') {
      finalObs = 'CHECK-OUT';
    } else if (
      finalStatus === 'agendado' ||
      finalStatus === 'concluido' ||
      finalStatus === 'vago' ||
      finalStatus === 'ausente'
    ) {
      if (
        finalObs === 'NÃO ACEITOU' ||
        finalObs === 'NAO ACEITOU' ||
        finalObs === 'NÃO ATENDEU' ||
        finalObs === 'NAO ATENDEU' ||
        finalObs === 'NQ' ||
        finalObs === 'ENCAIXE' ||
        finalObs === 'CHECK-OUT'
      ) {
        finalObs = '';
      }
    }

    const slotToSave: CleaningSlot = {
      ...editingSlot,
      apto: finalApto,
      status: finalStatus,
      observacao: finalObs
    };

    upsertSlot(slotToSave);
    setEditingSlot(null);
  };

  // Future week: Replicate previous week's schedule
  const handleReplicatePreviousWeek = () => {
    const prevDays = getWeekDays(weekOffset - 1);
    const prevDateMap = new Map(prevDays.map((d) => [d.key, d.fullDate]));

    const newSlotsToAdd: CleaningSlot[] = [];

    currentWeekDays.forEach((currDay) => {
      const prevDate = prevDateMap.get(currDay.key);
      MAIDS.forEach((maid) => {
        TIME_SLOTS.forEach((timeSlot) => {
          const prevSlot = slots.find(
            (s) =>
              (s.dayDate === prevDate ||
                (weekOffset === 1 &&
                  s.dayKey === currDay.key &&
                  (!s.dayDate || s.dayDate === prevDate))) &&
              s.timeSlot === timeSlot.time &&
              s.maid === maid.name
          );

          if (
            prevSlot &&
            prevSlot.apto &&
            prevSlot.apto !== 'VAGO' &&
            prevSlot.apto !== 'AUSENTE'
          ) {
            newSlotsToAdd.push({
              id: `cs-${currDay.fullDate}-${maid.name}-${timeSlot.time}`,
              dayKey: currDay.key,
              dayDate: currDay.fullDate,
              timeSlot: timeSlot.time,
              maid: maid.name,
              apto: prevSlot.apto,
              status: 'agendado', // Reset to scheduled for future week
              observacao: prevSlot.observacao || ''
            });
          }
        });
      });
    });

    if (newSlotsToAdd.length === 0) {
      alert('Nenhum agendamento da semana anterior encontrado para replicar.');
      return;
    }

    const currDateSet = new Set(currentWeekDays.map((d) => d.fullDate));
    const otherSlots = slots.filter((s) => !currDateSet.has(s.dayDate));
    saveSlots([...otherSlots, ...newSlotsToAdd]);
  };

  // Clear current week to VAGO
  const handleClearWeek = () => {
    if (!window.confirm('Deseja limpar todos os agendamentos desta semana e definir como VAGO?'))
      return;
    const currDateSet = new Set(currentWeekDays.map((d) => d.fullDate));
    const otherSlots = slots.filter((s) => !currDateSet.has(s.dayDate));
    saveSlots(otherSlots);
  };

  // Generate WhatsApp daily text for a maid
  const generateMaidWhatsAppText = (maid: MaidName, dayKey: string) => {
    const day = currentWeekDays.find((d) => d.key === dayKey) || currentWeekDays[0];
    const dayName = `${day.name} (${day.dateStr}/${day.fullDate.slice(0, 4)})`;

    let text = `*ESCALA DE LIMPEZA • EDIFÍCIO NEO 2.0*\n`;
    text += `*Camareira:* ${maid}\n`;
    text += `*Dia:* ${dayName}\n`;
    text += `*Duração:* 1 hora por apartamento\n`;
    text += `----------------------------------------\n\n`;

    TIME_SLOTS.forEach((ts) => {
      const s = getSlotForCell(day, maid, ts.time);
      const isVago = s.status === 'vago' || s.apto === 'VAGO';
      const isAusente = s.status === 'ausente' || s.apto === 'AUSENTE';
      const isEncaixe = s.status === 'encaixe';
      const obs = s.observacao ? ` (${s.observacao})` : isEncaixe ? ' (ENCAIXE)' : '';

      if (isVago) {
        text += `⏰ *${s.timeSlot}*: [ VAGO / DISPONÍVEL ]\n`;
      } else if (isAusente) {
        text += `⏰ *${s.timeSlot}*: [ AUSENTE ]\n`;
      } else {
        const aptoInfo = getAptoInfo(s.apto);
        const morador = aptoInfo?.proprietario ? ` - ${aptoInfo.proprietario}` : '';
        text += `⏰ *${s.timeSlot}*: Apto *${s.apto}*${morador}${obs}\n`;
      }
    });

    text += `\nBom trabalho! Em caso de dúvida, contatar a Recepção.`;
    return text;
  };

  // Copy text helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Active week slots and metrics
  const currentWeekDateSet = useMemo(
    () => new Set(currentWeekDays.map((d) => d.fullDate)),
    [currentWeekDays]
  );

  const currentWeekSlots = useMemo(() => {
    return currentWeekDays.flatMap((day) =>
      MAIDS.flatMap((maid) => TIME_SLOTS.map((ts) => getSlotForCell(day, maid.name, ts.time)))
    );
  }, [currentWeekDays, slots, weekOffset]);

  const activeCleaningCount = currentWeekSlots.filter(
    (s) => s.status !== 'vago' && s.status !== 'ausente' && s.apto !== 'VAGO' && s.apto !== 'AUSENTE'
  ).length;

  const vagoCount = currentWeekSlots.filter((s) => s.status === 'vago' || s.apto === 'VAGO').length;

  const maidStats = {
    HELENA: currentWeekSlots.filter(
      (s) => s.maid === 'HELENA' && s.status !== 'vago' && s.status !== 'ausente'
    ).length,
    JOSEANE: currentWeekSlots.filter(
      (s) => s.maid === 'JOSEANE' && s.status !== 'vago' && s.status !== 'ausente'
    ).length,
    JOSEILDES: currentWeekSlots.filter(
      (s) => (s.maid === 'JOSEILDES' || s.maid === 'JOSI') && s.status !== 'vago' && s.status !== 'ausente'
    ).length,
    get JOSI() {
      return this.JOSEILDES;
    }
  };

  const totalEncaixes = currentWeekSlots.filter((s) => s.status === 'encaixe').length;
  const totalNaoAtende = currentWeekSlots.filter((s) => s.status === 'nao_atendeu').length;
  const totalNaoAceita = currentWeekSlots.filter((s) => s.status === 'nao_aceitou').length;

  // Filtered days
  const displayedDays =
    selectedDayFilter === 'todos'
      ? currentWeekDays
      : currentWeekDays.filter((d) => d.key === selectedDayFilter);

  // Filtered maids
  const displayedMaids =
    selectedMaidFilter === 'todas'
      ? MAIDS
      : MAIDS.filter(
          (m) =>
            m.name === selectedMaidFilter ||
            (selectedMaidFilter === 'JOSEILDES' && m.name === 'JOSI') ||
            (selectedMaidFilter === 'JOSI' && m.name === 'JOSEILDES')
        );

  return (
    <div className="space-y-6">
      {/* Top Header & Title */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Controle de Camareiras
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto no-print">
          <button
            type="button"
            onClick={handleOpenCopyModal}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Copiar horários e agendamentos da semana anterior para a semana atual"
          >
            <CopyPlus className="w-4 h-4 text-slate-950" />
            <span>Copiar Semana Anterior</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Abrir Relatórios Gráficos de Produtividade, Status Vago e Moradia/Inquilino/Temporada"
          >
            <BarChart3 className="w-4 h-4 text-blue-200" />
            <span>Relatórios & Gráficos das Camareiras</span>
          </button>

          <button
            type="button"
            onClick={() => setWhatsAppMaidModal({ maid: 'HELENA', dayKey: 'segunda' })}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Escala do Dia</span>
          </button>
        </div>
      </div>

      {/* Copy Success Feedback Toast */}
      {copySuccessToast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-200 no-print">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{copySuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCopySuccessToast(null)}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI & Summary Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Resumo Operacional da Semana</span>
          </span>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Abrir relatórios gráficos detalhados (Camareiras, Status Vago e Perfil de Moradia)"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Ver Gráficos & Relatórios Completos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Total Agendado</span>
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{activeCleaningCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">limpezas na semana</span>
          </div>

          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Horários Vagos</span>
              <Clock className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-black text-rose-600 mt-1">{vagoCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">vagas disponíveis</span>
          </div>

          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório de Helena"
          >
            <div className="flex items-center justify-between text-amber-900 text-[11px] font-bold">
              <span>HELENA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100">1h/apto</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{maidStats.HELENA}</div>
            <span className="text-[10px] text-slate-500 font-medium">aptos agendados</span>
          </div>

          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório de Joseane"
          >
            <div className="flex items-center justify-between text-emerald-900 text-[11px] font-bold">
              <span>JOSEANE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100">1h/apto</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{maidStats.JOSEANE}</div>
            <span className="text-[10px] text-slate-500 font-medium">aptos agendados</span>
          </div>

          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border-l-4 border-l-purple-500 border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório de Joseildes"
          >
            <div className="flex items-center justify-between text-purple-900 text-[11px] font-bold">
              <span>JOSEILDES</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100">1h/apto</span>
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{maidStats.JOSEILDES}</div>
            <span className="text-[10px] text-slate-500 font-medium">aptos agendados</span>
          </div>

          <div
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400 hover:shadow-xs transition-all"
            title="Clique para ver no relatório"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Encaixes</span>
              <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-purple-700 mt-1">{totalEncaixes}</div>
            <span className="text-[10px] text-slate-500 font-medium">{totalNaoAtende} ñ atendeu • {totalNaoAceita} ñ aceitou</span>
          </div>
        </div>
      </div>

      {/* Yellow Header Banner & Controls matching the user's sheet */}
      <div className="bg-amber-300 border-2 border-amber-400 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col gap-3 text-slate-950 font-black">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Week navigation & period */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Week navigation buttons */}
            <div className="inline-flex items-center bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-amber-400/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1.5 hover:bg-amber-100 rounded-lg text-slate-800 transition-colors cursor-pointer"
                title="Semana Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dropdown selector for weeks */}
              <div className="relative mx-1">
                <select
                  value={weekOffset}
                  onChange={(e) => setWeekOffset(Number(e.target.value))}
                  className="bg-transparent text-xs font-black text-slate-900 pr-6 pl-2 py-1 cursor-pointer focus:outline-none appearance-none"
                >
                  {weekOffset < 0 && (
                    <option value={weekOffset}>
                      Semana {weekOffset} ({currentWeekDays[0].dateStr} a {currentWeekDays[5].dateStr})
                    </option>
                  )}
                  {selectableWeeks.map((w) => (
                    <option key={w.offset} value={w.offset}>
                      {w.label}
                    </option>
                  ))}
                  {weekOffset > 12 && (
                    <option value={weekOffset}>
                      Semana +{weekOffset} ({currentWeekDays[0].dateStr} a {currentWeekDays[5].dateStr})
                    </option>
                  )}
                </select>
                <CalendarDays className="w-3.5 h-3.5 text-amber-700 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1.5 hover:bg-amber-100 rounded-lg text-slate-800 transition-colors cursor-pointer"
                title="Próxima Semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick button to return to Current Week */}
            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="text-[11px] font-extrabold bg-white/90 hover:bg-white text-slate-800 px-2.5 py-1.5 rounded-xl border border-amber-400 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Voltar para a semana atual"
              >
                <RefreshCw className="w-3 h-3 text-amber-600" />
                <span>Hoje / Semana Atual</span>
              </button>
            )}

            {/* Period pill */}
            <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-xs sm:text-sm uppercase tracking-wide border border-amber-400 flex items-center gap-2 shadow-2xs">
              <span>PERÍODO:</span>
              <span className="underline decoration-2 font-black">{periodText}</span>
              {weekOffset === 0 ? (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Semana Atual
                </span>
              ) : weekOffset > 0 ? (
                <span className="bg-blue-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span>Programação Futura (+{weekOffset} sem)</span>
                </span>
              ) : (
                <span className="bg-slate-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Histórico ({weekOffset} sem)
                </span>
              )}
            </div>

            {/* Button to copy data from previous week */}
            <button
              type="button"
              onClick={handleOpenCopyModal}
              className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-300 hover:text-amber-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer border border-amber-500/80"
              title="Copiar dados e agendamentos da semana anterior para a semana atual"
            >
              <CopyPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Copiar Semana Anterior</span>
            </button>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold no-print">
            {/* Search apto */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar apto (ex: 405)..."
                value={searchApto}
                onChange={(e) => setSearchApto(e.target.value)}
                className="bg-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-amber-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium w-36 sm:w-40"
              />
            </div>

            {/* Filter Maid */}
            <select
              value={selectedMaidFilter}
              onChange={(e) => setSelectedMaidFilter(e.target.value)}
              className="bg-white text-xs px-2.5 py-1.5 rounded-lg border border-amber-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
            >
              <option value="todas">Todas Camareiras</option>
              <option value="HELENA">HELENA</option>
              <option value="JOSEANE">JOSEANE</option>
              <option value="JOSEILDES">JOSEILDES</option>
            </select>

            {/* Filter Day */}
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="bg-white text-xs px-2.5 py-1.5 rounded-lg border border-amber-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
            >
              <option value="todos">Semana Completa</option>
              {currentWeekDays.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.name} ({d.dateStr})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Future Week Assistant Bar */}
        {weekOffset > 0 && (
          <div className="bg-amber-200/90 border border-amber-400/80 p-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-900 no-print">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-800 shrink-0" />
              <div>
                <span className="font-extrabold text-amber-950">
                  Programação Futura ({periodText}):
                </span>{' '}
                <span className="font-medium text-slate-800">
                  {activeCleaningCount > 0
                    ? `${activeCleaningCount} limpezas já agendadas nesta semana.`
                    : 'Nenhuma limpeza cadastrada para esta semana ainda. Preencha os horários ou replique da semana anterior.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReplicatePreviousWeek}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs text-[11px]"
                title="Copiar os apartamentos fixos da semana anterior para esta semana"
              >
                <CopyPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Replicar Grade Anterior</span>
              </button>

              {activeCleaningCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearWeek}
                  className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
                  title="Limpar todos os agendamentos desta semana"
                >
                  <span>Limpar Semana</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Weekly Cleaning Table (Grade Oficial) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Grade Semanal de Limpeza</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <span className="flex items-center gap-1 font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block border border-emerald-400"></span>
              Concluída
            </span>
            <span className="flex items-center gap-1 font-bold text-purple-900">
              <span className="w-2.5 h-2.5 rounded bg-purple-200 inline-block border border-purple-400"></span>
              Encaixe
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block border border-slate-400"></span>
              Não Aceitou
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-900">
              <span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block border border-amber-400"></span>
              Não Atendeu
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-600">
              <span className="w-2.5 h-2.5 rounded bg-rose-200 inline-block border border-rose-300"></span>
              Ausente
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-600">
              <span className="w-2.5 h-2.5 rounded bg-slate-50 inline-block border border-dashed border-rose-400"></span>
              VAGO
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-amber-100 inline-block border border-amber-300"></span>
              HELENA
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 inline-block border border-emerald-300"></span>
              JOSEANE
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-purple-100 inline-block border border-purple-300"></span>
              JOSEILDES
            </span>
          </div>
        </div>

        {/* Campo Simples de Anotações & Observações */}
        <div className="p-3 sm:p-4 bg-amber-50/70 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Anotações & Observações da Semana</span>
              <span className="text-[11px] font-normal text-slate-500">
                (digite livremente recados, avisos, materiais ou observações da escala)
              </span>
            </label>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {notesSavedFeedback && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Salvo automaticamente</span>
                </span>
              )}
              {currentNotes.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyNotes}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-2 py-0.5 rounded-md shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copiar anotações"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>{copiedNotes ? 'Copiado!' : 'Copiar'}</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            value={currentNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={2}
            placeholder="Digite aqui anotações livres e observações (ex: Helena precisará sair 1h mais cedo na sexta, repor produtos de limpeza, apto 204 solicitou troca de toalhas extras...)"
            className="w-full text-xs p-2.5 rounded-xl border border-amber-300/80 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-y shadow-2xs font-normal"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              {/* Row 1: Days of Week */}
              <tr className="bg-amber-300 text-slate-950 font-black border-b-2 border-amber-400">
                <th className="py-2.5 px-3 text-left w-24 border-r border-amber-400 font-black uppercase text-[11px]">
                  Horários
                </th>
                {displayedDays.map((day) => (
                  <th
                    key={day.key}
                    colSpan={displayedMaids.length}
                    className="py-2 px-2 border-r border-amber-400 last:border-r-0 uppercase text-xs tracking-wider"
                  >
                    {day.name}-{day.dateStr}
                  </th>
                ))}
              </tr>

              {/* Row 2: Maids under each day */}
              <tr className="bg-amber-200 text-slate-900 font-extrabold text-[11px] border-b border-slate-300">
                <th className="py-1.5 px-2 text-left border-r border-slate-300 bg-amber-200/90 text-slate-700">
                  (1h cada)
                </th>
                {displayedDays.map((day) =>
                  displayedMaids.map((maid) => (
                    <th
                      key={`${day.key}-${maid.name}`}
                      className={`py-1.5 px-1.5 border-r border-slate-300 text-[11px] tracking-wide ${
                        maid.name === 'HELENA'
                          ? 'bg-amber-100/80 text-amber-950'
                          : maid.name === 'JOSEANE'
                          ? 'bg-emerald-100/80 text-emerald-950'
                          : 'bg-purple-100/80 text-purple-950'
                      }`}
                    >
                      {maid.name}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {/* Morning Slots: 08:10, 09:10, 10:10, 11:10 */}
              {TIME_SLOTS.slice(0, 4).map((timeSlot) => (
                <tr key={timeSlot.time} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 text-left font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200 whitespace-nowrap">
                    {timeSlot.time}
                  </td>
                  {displayedDays.map((day) =>
                    displayedMaids.map((maid) => {
                      const slot = getSlotForCell(day, maid.name, timeSlot.time);

                      const isHighlighted = searchApto && slot.apto.toLowerCase().includes(searchApto.toLowerCase());
                      const isVago = slot.status === 'vago' || slot.apto === 'VAGO';
                      const isAusente = slot.status === 'ausente' || slot.apto === 'AUSENTE';
                      const isCheckout = slot.status === 'checkout';
                      const isConcluido = slot.status === 'concluido';
                      const isEncaixe = slot.status === 'encaixe';
                      const isNaoAceitou = slot.status === 'nao_aceitou';
                      const isNaoAtendeu = slot.status === 'nao_atendeu';

                      return (
                        <td
                          key={`${day.key}-${maid.name}-${timeSlot.time}`}
                          onClick={() => handleOpenSlotEdit(slot)}
                          className={`py-2 px-1 border-r border-slate-200 last:border-r-0 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 hover:z-10 ${
                            isHighlighted ? 'bg-yellow-200 font-black ring-2 ring-yellow-500' : ''
                          } ${
                            isConcluido
                              ? 'bg-emerald-200/90 text-slate-700 font-bold'
                              : isEncaixe
                              ? 'bg-purple-100/90 text-purple-950 font-bold'
                              : isNaoAceitou
                              ? 'bg-slate-200/90 text-slate-800 font-bold'
                              : isNaoAtendeu
                              ? 'bg-amber-100/95 text-amber-950 font-bold'
                              : isAusente
                              ? 'bg-rose-50 text-rose-700'
                              : isVago
                              ? 'bg-slate-50/50 text-rose-600'
                              : isCheckout
                              ? 'bg-amber-100/70'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center min-h-[36px]">
                            {isAusente ? (
                              <span className="font-extrabold text-[11px] text-rose-600 tracking-wider">
                                AUSENTE
                              </span>
                            ) : isVago ? (
                              <span className="font-black text-[11px] text-rose-600 tracking-wider">
                                VAGO
                              </span>
                            ) : isConcluido ? (
                              <span className="font-bold text-xs text-slate-700 flex items-center justify-center">
                                {slot.apto}
                              </span>
                            ) : isEncaixe ? (
                              <>
                                <span className="font-extrabold text-xs text-purple-950">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-purple-900 font-black px-1 rounded bg-purple-200/90 leading-tight mt-0.5 tracking-tight uppercase">
                                  ENCAIXE
                                </span>
                              </>
                            ) : isNaoAceitou ? (
                              <>
                                <span className="font-extrabold text-xs text-slate-800">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-slate-700 font-black px-1 rounded bg-slate-300/80 leading-tight mt-0.5 tracking-tight uppercase">
                                  NÃO ACEITOU
                                </span>
                              </>
                            ) : isNaoAtendeu ? (
                              <>
                                <span className="font-extrabold text-xs text-amber-950">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-amber-900 font-black px-1 rounded bg-amber-200/90 leading-tight mt-0.5 tracking-tight uppercase">
                                  NÃO ATENDEU
                                </span>
                              </>
                            ) : (
                              <span className="font-extrabold text-xs text-slate-900">
                                {slot.apto}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}

              {/* INTERVALO (Almoço 12:10 às 13:10) */}
              <tr className="bg-slate-100/90 font-bold border-y-2 border-slate-300">
                <td className="py-1.5 px-3 text-left text-slate-700 font-black uppercase text-[11px] border-r border-slate-300">
                  INTERVALO
                </td>
                <td
                  colSpan={displayedDays.length * displayedMaids.length}
                  className="py-1.5 text-center text-slate-500 tracking-widest text-[11px]"
                >
                  --------------------------------- INTERVALO DE ALMOÇO (12:10 às 13:10) ---------------------------------
                </td>
              </tr>

              {/* Afternoon Slots: 13:10, 14:10, 15:10, 16:10 */}
              {TIME_SLOTS.slice(4).map((timeSlot) => (
                <tr key={timeSlot.time} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 text-left font-bold text-slate-800 bg-slate-50/80 border-r border-slate-200 whitespace-nowrap">
                    {timeSlot.time}
                  </td>
                  {displayedDays.map((day) =>
                    displayedMaids.map((maid) => {
                      const slot = getSlotForCell(day, maid.name, timeSlot.time);

                      const isHighlighted = searchApto && slot.apto.toLowerCase().includes(searchApto.toLowerCase());
                      const isVago = slot.status === 'vago' || slot.apto === 'VAGO';
                      const isAusente = slot.status === 'ausente' || slot.apto === 'AUSENTE';
                      const isCheckout = slot.status === 'checkout';
                      const isConcluido = slot.status === 'concluido';
                      const isEncaixe = slot.status === 'encaixe';
                      const isNaoAceitou = slot.status === 'nao_aceitou';
                      const isNaoAtendeu = slot.status === 'nao_atendeu';

                      return (
                        <td
                          key={`${day.key}-${maid.name}-${timeSlot.time}`}
                          onClick={() => handleOpenSlotEdit(slot)}
                          className={`py-2 px-1 border-r border-slate-200 last:border-r-0 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 hover:z-10 ${
                            isHighlighted ? 'bg-yellow-200 font-black ring-2 ring-yellow-500' : ''
                          } ${
                            isConcluido
                              ? 'bg-emerald-200/90 text-slate-700 font-bold'
                              : isEncaixe
                              ? 'bg-purple-100/90 text-purple-950 font-bold'
                              : isNaoAceitou
                              ? 'bg-slate-200/90 text-slate-800 font-bold'
                              : isNaoAtendeu
                              ? 'bg-amber-100/95 text-amber-950 font-bold'
                              : isAusente
                              ? 'bg-rose-50 text-rose-700'
                              : isVago
                              ? 'bg-slate-50/50 text-rose-600'
                              : isCheckout
                              ? 'bg-amber-100/70'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center min-h-[36px]">
                            {isAusente ? (
                              <span className="font-extrabold text-[11px] text-rose-600 tracking-wider">
                                AUSENTE
                              </span>
                            ) : isVago ? (
                              <span className="font-black text-[11px] text-rose-600 tracking-wider">
                                VAGO
                              </span>
                            ) : isConcluido ? (
                              <span className="font-bold text-xs text-slate-700 flex items-center justify-center">
                                {slot.apto}
                              </span>
                            ) : isEncaixe ? (
                              <>
                                <span className="font-extrabold text-xs text-purple-950">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-purple-900 font-black px-1 rounded bg-purple-200/90 leading-tight mt-0.5 tracking-tight uppercase">
                                  ENCAIXE
                                </span>
                              </>
                            ) : isNaoAceitou ? (
                              <>
                                <span className="font-extrabold text-xs text-slate-800">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-slate-700 font-black px-1 rounded bg-slate-300/80 leading-tight mt-0.5 tracking-tight uppercase">
                                  NÃO ACEITOU
                                </span>
                              </>
                            ) : isNaoAtendeu ? (
                              <>
                                <span className="font-extrabold text-xs text-amber-950">
                                  {slot.apto}
                                </span>
                                <span className="text-[9px] text-amber-900 font-black px-1 rounded bg-amber-200/90 leading-tight mt-0.5 tracking-tight uppercase">
                                  NÃO ATENDEU
                                </span>
                              </>
                            ) : (
                              <span className="font-extrabold text-xs text-slate-900">
                                {slot.apto}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveSlot}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl max-w-md w-full space-y-4 border border-slate-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                    editingSlot.maid === 'HELENA'
                      ? 'bg-amber-600'
                      : editingSlot.maid === 'JOSEANE'
                      ? 'bg-emerald-600'
                      : 'bg-purple-600'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Escala de Limpeza • {editingSlot.maid}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {DAYS_OF_WEEK.find((d) => d.key === editingSlot.dayKey)?.name} • Horário: {editingSlot.timeSlot} às {TIME_SLOTS.find(t => t.time === editingSlot.timeSlot)?.endTime} (1 hora)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Apartamento para Limpeza *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 405 ou VAGO"
                  value={slotFormData.apto}
                  onChange={(e) => setSlotFormData({ ...slotFormData, apto: e.target.value })}
                  list="housekeeping-aptos-list"
                  autoFocus
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  required
                />
                <datalist id="housekeeping-aptos-list">
                  <option value="VAGO" />
                  <option value="AUSENTE" />
                  {BUILDING_APARTMENTS.map((apto) => (
                    <option key={apto} value={apto} />
                  ))}
                </datalist>
              </div>

              {/* Resident details auto-lookup */}
              {getAptoInfo(slotFormData.apto) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Morador: {getAptoInfo(slotFormData.apto)?.proprietario}</span>
                    <span className="uppercase text-[9px] bg-emerald-200/80 px-1.5 py-0.5 rounded font-extrabold">
                      {getAptoInfo(slotFormData.apto)?.tipoApto}
                    </span>
                  </div>
                  <div className="text-emerald-800 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp: {getAptoInfo(slotFormData.apto)?.celular || 'Não cadastrado'}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status da Limpeza</label>
                <select
                  value={slotFormData.status}
                  onChange={(e) =>
                    setSlotFormData({
                      ...slotFormData,
                      status: e.target.value as CleaningStatus
                    })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold bg-white"
                >
                  <option value="agendado">📅 Agendado</option>
                  <option value="encaixe">🔄 ENCAIXE</option>
                  <option value="concluido">✅ Limpeza Concluída (Verde)</option>
                  <option value="nao_aceitou">❌ NÃO ACEITOU (Dispensou)</option>
                  <option value="nao_atendeu">🚪 NÃO ATENDEU (Sem resposta)</option>
                  <option value="ausente">🚫 AUSENTE (Camareira Ausente)</option>
                  <option value="vago">⭕ VAGO (Livre)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Maid Dispatch Modal */}
      {whatsAppMaidModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Copiar Escala do Dia
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gera a lista formatada de limpezas da camareira
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppMaidModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Camareira</label>
                <select
                  value={whatsAppMaidModal.maid}
                  onChange={(e) =>
                    setWhatsAppMaidModal({
                      ...whatsAppMaidModal,
                      maid: e.target.value as MaidName
                    })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 font-bold bg-white"
                >
                  <option value="HELENA">HELENA</option>
                  <option value="JOSEANE">JOSEANE</option>
                  <option value="JOSEILDES">JOSEILDES</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dia da Escala</label>
                <select
                  value={whatsAppMaidModal.dayKey}
                  onChange={(e) =>
                    setWhatsAppMaidModal({
                      ...whatsAppMaidModal,
                      dayKey: e.target.value
                    })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 font-semibold bg-white"
                >
                  {currentWeekDays.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name} ({d.dateStr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Texto formatado da escala:</label>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      generateMaidWhatsAppText(
                        whatsAppMaidModal.maid,
                        whatsAppMaidModal.dayKey
                      )
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono font-medium max-h-56 overflow-y-auto">
                {generateMaidWhatsAppText(
                  whatsAppMaidModal.maid,
                  whatsAppMaidModal.dayKey
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWhatsAppMaidModal(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    generateMaidWhatsAppText(
                      whatsAppMaidModal.maid,
                      whatsAppMaidModal.dayKey
                    )
                  )
                }
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Week Data Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950/20 text-slate-950 flex items-center justify-center shadow-2xs">
                  <CopyPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-tight">
                    Copiar Dados da Semana Anterior
                  </h3>
                  <p className="text-xs font-semibold text-slate-950/80">
                    Replicar horários e escala de limpeza das camareiras
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="p-1.5 text-slate-950/70 hover:text-slate-950 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Origin -> Destination Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Origin */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Semana de Origem (Copiar de)
                    </span>
                    <select
                      value={sourceWeekOffset}
                      onChange={(e) => setSourceWeekOffset(Number(e.target.value))}
                      className="w-full bg-slate-50 font-bold text-slate-900 text-xs px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {selectableWeeks.map((w) => (
                        <option key={w.offset} value={w.offset}>
                          {w.label}
                        </option>
                      ))}
                      {sourceWeekOffset < 0 && (
                        <option value={sourceWeekOffset}>
                          Semana Anterior ({sourceWeekDays[0].dateStr} a {sourceWeekDays[5].dateStr})
                        </option>
                      )}
                    </select>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Agendamentos encontrados:</span>
                      <strong className="text-slate-900 font-mono text-xs">{sourceActiveCleaningsCount}</strong>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-300 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                      Semana de Destino (Semana Atual)
                    </span>
                    <p className="font-black text-slate-900 text-xs leading-snug">
                      {periodText}
                    </p>
                    <div className="mt-2 text-[11px] text-amber-900 flex items-center justify-between">
                      <span>Status atual:</span>
                      <span className="font-semibold text-slate-700">{activeCleaningCount} agendados</span>
                    </div>
                  </div>
                </div>

                {sourceActiveCleaningsCount === 0 && (
                  <div className="bg-amber-100/70 border border-amber-300 rounded-lg p-2.5 text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span>A semana selecionada ({sourcePeriodText}) não possui agendamentos cadastrados. Deseja utilizar a <strong>Semana Base Original (21 a 26/Set)</strong> como origem?</span>
                      <button
                        type="button"
                        onClick={() => setSourceWeekOffset(0)}
                        className="mt-1 block text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        &rarr; Selecionar Semana Base (21 a 26/Set) como origem
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Opções de Cópia:
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={copyNotesOption}
                    onChange={(e) => setCopyNotesOption(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Copiar também Anotações e Observações da semana
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Replica o texto do painel de notas da semana de origem para a semana de destino.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={copyOnlyVacantOption}
                    onChange={(e) => setCopyOnlyVacantOption(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Preservar agendamentos já existentes na semana de destino
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Se marcado, apenas os horários vagos serão preenchidos. Se desmarcado, toda a grade da semana será atualizada.
                    </span>
                  </div>
                </label>
              </div>

              {/* Help Notice */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Como funciona a cópia da escala:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  <li>Todos os horários das camareiras (Helena, Joseane, Joseildes) de Segunda a Sábado serão transferidos.</li>
                  <li>Limpezas que estavam com status "Concluído" voltam para "Agendado" para serem executadas nesta semana.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecuteCopy}
                disabled={sourceActiveCleaningsCount === 0}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Copiar Escala ({sourceActiveCleaningsCount} aptos)</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Housekeeping Activity & Performance Report Modal */}
      <HousekeepingReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        slots={slots}
        apartments={apartments}
        currentWeekOffset={weekOffset}
        selectableWeeks={selectableWeeks}
        currentWeekDays={currentWeekDays}
      />
    </div>
  );
};

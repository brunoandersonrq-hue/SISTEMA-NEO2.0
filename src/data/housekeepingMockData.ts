import { CleaningSlot, DayException, MaidName } from '../types.ts';

export interface DayConfig {
  key: string;
  name: string;
  shortName: string;
  dateStr: string; // e.g. '21/09'
  fullDate: string; // e.g. '2026-09-21'
}

export const DAYS_OF_WEEK: DayConfig[] = [
  { key: 'segunda', name: 'Segunda-feira', shortName: 'Seg', dateStr: '21', fullDate: '2026-09-21' },
  { key: 'terca', name: 'Terça-feira', shortName: 'Ter', dateStr: '22', fullDate: '2026-09-22' },
  { key: 'quarta', name: 'Quarta-feira', shortName: 'Qua', dateStr: '23', fullDate: '2026-09-23' },
  { key: 'quinta', name: 'Quinta-feira', shortName: 'Qui', dateStr: '24', fullDate: '2026-09-24' },
  { key: 'sexta', name: 'Sexta-feira', shortName: 'Sex', dateStr: '25', fullDate: '2026-09-25' },
  { key: 'sabado', name: 'Sábado', shortName: 'Sáb', dateStr: '26', fullDate: '2026-09-26' }
];

export const MAIDS: { name: MaidName; phone: string; color: string; badgeColor: string }[] = [
  {
    name: 'HELENA',
    phone: '(47) 99812-4011',
    color: 'border-l-4 border-amber-500 bg-amber-50/40',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    name: 'JOSEANE',
    phone: '(47) 99744-8822',
    color: 'border-l-4 border-emerald-500 bg-emerald-50/40',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    name: 'JOSI',
    phone: '(47) 99655-3377',
    color: 'border-l-4 border-purple-500 bg-purple-50/40',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
  }
];

export const TIME_SLOTS: { time: string; label: string; endTime: string }[] = [
  { time: '08:10', label: '08:10 às 09:10', endTime: '09:10' },
  { time: '09:10', label: '09:10 às 10:10', endTime: '10:10' },
  { time: '10:10', label: '10:10 às 11:10', endTime: '11:10' },
  { time: '11:10', label: '11:10 às 12:10', endTime: '12:10' },
  // 12:10 às 13:10 -> INTERVALO (Almoço)
  { time: '13:10', label: '13:10 às 14:10', endTime: '14:10' },
  { time: '14:10', label: '14:10 às 15:10', endTime: '15:10' },
  { time: '15:10', label: '15:10 às 16:10', endTime: '16:10' },
  { time: '16:10', label: '16:10 às 17:10', endTime: '17:10' }
];

export const INITIAL_CLEANING_SLOTS: CleaningSlot[] = [
  // SEGUNDA-FEIRA (21)
  { id: 'cs-seg-0810-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '08:10', maid: 'HELENA', apto: '112', status: 'agendado' },
  { id: 'cs-seg-0810-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '08:10', maid: 'JOSEANE', apto: '616', status: 'agendado' },
  { id: 'cs-seg-0810-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '08:10', maid: 'JOSI', apto: '407', status: 'agendado' },

  { id: 'cs-seg-0910-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '09:10', maid: 'HELENA', apto: '401', status: 'agendado' },
  { id: 'cs-seg-0910-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '09:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-0910-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '09:10', maid: 'JOSI', apto: '207', status: 'agendado' },

  { id: 'cs-seg-1010-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '10:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1010-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '10:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1010-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '10:10', maid: 'JOSI', apto: '403', status: 'agendado' },

  { id: 'cs-seg-1110-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '11:10', maid: 'HELENA', apto: '305', status: 'agendado' },
  { id: 'cs-seg-1110-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '11:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1110-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '11:10', maid: 'JOSI', apto: '722', status: 'agendado' },

  { id: 'cs-seg-1310-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '13:10', maid: 'HELENA', apto: '503', status: 'agendado' },
  { id: 'cs-seg-1310-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '13:10', maid: 'JOSEANE', apto: '609', status: 'agendado' },
  { id: 'cs-seg-1310-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '13:10', maid: 'JOSI', apto: '204', status: 'agendado' },

  { id: 'cs-seg-1410-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '14:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1410-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '14:10', maid: 'JOSEANE', apto: '202', status: 'agendado' },
  { id: 'cs-seg-1410-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '14:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-seg-1510-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '15:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1510-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '15:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1510-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '15:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-seg-1610-helena', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '16:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-seg-1610-joseane', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '16:10', maid: 'JOSEANE', apto: '715', status: 'agendado' },
  { id: 'cs-seg-1610-josi', dayKey: 'segunda', dayDate: '2026-09-21', timeSlot: '16:10', maid: 'JOSI', apto: '702', status: 'agendado' },

  // TERÇA-FEIRA (22)
  { id: 'cs-ter-0810-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '08:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-0810-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '08:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-0810-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '08:10', maid: 'JOSI', apto: '701', status: 'agendado' },

  { id: 'cs-ter-0910-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '09:10', maid: 'HELENA', apto: '803', status: 'agendado' },
  { id: 'cs-ter-0910-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '09:10', maid: 'JOSEANE', apto: '104', status: 'agendado' },
  { id: 'cs-ter-0910-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '09:10', maid: 'JOSI', apto: '606', status: 'agendado' },

  { id: 'cs-ter-1010-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '10:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-1010-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '10:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-1010-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '10:10', maid: 'JOSI', apto: '206', status: 'agendado' },

  { id: 'cs-ter-1110-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '11:10', maid: 'HELENA', apto: '615', status: 'agendado' },
  { id: 'cs-ter-1110-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '11:10', maid: 'JOSEANE', apto: '604', status: 'agendado' },
  { id: 'cs-ter-1110-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '11:10', maid: 'JOSI', apto: '720', status: 'agendado' },

  { id: 'cs-ter-1310-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '13:10', maid: 'HELENA', apto: '305', status: 'agendado' },
  { id: 'cs-ter-1310-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '13:10', maid: 'JOSEANE', apto: '203', status: 'agendado' },
  { id: 'cs-ter-1310-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '13:10', maid: 'JOSI', apto: '724', status: 'agendado' },

  { id: 'cs-ter-1410-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '14:10', maid: 'HELENA', apto: '301', status: 'agendado' },
  { id: 'cs-ter-1410-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '14:10', maid: 'JOSEANE', apto: '415', status: 'agendado' },
  { id: 'cs-ter-1410-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '14:10', maid: 'JOSI', apto: '613', status: 'agendado' },

  { id: 'cs-ter-1510-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '15:10', maid: 'HELENA', apto: '607', status: 'agendado' },
  { id: 'cs-ter-1510-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '15:10', maid: 'JOSEANE', apto: '409', status: 'agendado' },
  { id: 'cs-ter-1510-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '15:10', maid: 'JOSI', apto: '505', status: 'agendado' },

  { id: 'cs-ter-1610-helena', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '16:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-1610-joseane', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '16:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-ter-1610-josi', dayKey: 'terca', dayDate: '2026-09-22', timeSlot: '16:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  // QUARTA-FEIRA (23)
  { id: 'cs-qua-0810-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '08:10', maid: 'HELENA', apto: 'AUSENTE', status: 'ausente' },
  { id: 'cs-qua-0810-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '08:10', maid: 'JOSEANE', apto: '405', observacao: 'ciente', status: 'agendado' },
  { id: 'cs-qua-0810-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '08:10', maid: 'JOSI', apto: '701', status: 'agendado' },

  { id: 'cs-qua-0910-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '09:10', maid: 'HELENA', apto: 'AUSENTE', status: 'ausente' },
  { id: 'cs-qua-0910-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '09:10', maid: 'JOSEANE', apto: '112', status: 'agendado' },
  { id: 'cs-qua-0910-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '09:10', maid: 'JOSI', apto: '401', status: 'agendado' },

  { id: 'cs-qua-1010-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '10:10', maid: 'HELENA', apto: 'AUSENTE', status: 'ausente' },
  { id: 'cs-qua-1010-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '10:10', maid: 'JOSEANE', apto: '602', observacao: 'ciente', status: 'agendado' },
  { id: 'cs-qua-1010-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '10:10', maid: 'JOSI', apto: '403', status: 'agendado' },

  { id: 'cs-qua-1110-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '11:10', maid: 'HELENA', apto: 'AUSENTE', status: 'ausente' },
  { id: 'cs-qua-1110-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '11:10', maid: 'JOSEANE', apto: '609', status: 'agendado' },
  { id: 'cs-qua-1110-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '11:10', maid: 'JOSI', apto: '722', status: 'agendado' },

  { id: 'cs-qua-1310-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '13:10', maid: 'HELENA', apto: '503', status: 'agendado' },
  { id: 'cs-qua-1310-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '13:10', maid: 'JOSEANE', apto: '511', status: 'agendado' },
  { id: 'cs-qua-1310-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '13:10', maid: 'JOSI', apto: '204', status: 'agendado' },

  { id: 'cs-qua-1410-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '14:10', maid: 'HELENA', apto: '113', status: 'agendado' },
  { id: 'cs-qua-1410-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '14:10', maid: 'JOSEANE', apto: '202', status: 'agendado' },
  { id: 'cs-qua-1410-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '14:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-qua-1510-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '15:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-qua-1510-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '15:10', maid: 'JOSEANE', apto: '410', status: 'agendado' },
  { id: 'cs-qua-1510-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '15:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-qua-1610-helena', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '16:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-qua-1610-joseane', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '16:10', maid: 'JOSEANE', apto: '715', status: 'agendado' },
  { id: 'cs-qua-1610-josi', dayKey: 'quarta', dayDate: '2026-09-23', timeSlot: '16:10', maid: 'JOSI', apto: '702', status: 'agendado' },

  // QUINTA-FEIRA (24)
  { id: 'cs-qui-0810-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '08:10', maid: 'HELENA', apto: '103', status: 'agendado' },
  { id: 'cs-qui-0810-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '08:10', maid: 'JOSEANE', apto: '301', status: 'agendado' },
  { id: 'cs-qui-0810-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '08:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-qui-0910-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '09:10', maid: 'HELENA', apto: '113', status: 'agendado' },
  { id: 'cs-qui-0910-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '09:10', maid: 'JOSEANE', apto: '104', status: 'agendado' },
  { id: 'cs-qui-0910-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '09:10', maid: 'JOSI', apto: '606', status: 'agendado' },

  { id: 'cs-qui-1010-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '10:10', maid: 'HELENA', apto: '216', status: 'agendado' },
  { id: 'cs-qui-1010-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '10:10', maid: 'JOSEANE', apto: '114', status: 'agendado' },
  { id: 'cs-qui-1010-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '10:10', maid: 'JOSI', apto: '206', status: 'agendado' },

  { id: 'cs-qui-1110-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '11:10', maid: 'HELENA', apto: '615', status: 'agendado' },
  { id: 'cs-qui-1110-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '11:10', maid: 'JOSEANE', apto: '604', status: 'agendado' },
  { id: 'cs-qui-1110-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '11:10', maid: 'JOSI', apto: '720', status: 'agendado' },

  { id: 'cs-qui-1310-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '13:10', maid: 'HELENA', apto: '310', status: 'agendado' },
  { id: 'cs-qui-1310-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '13:10', maid: 'JOSEANE', apto: '611', status: 'agendado' },
  { id: 'cs-qui-1310-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '13:10', maid: 'JOSI', apto: '724', status: 'agendado' },

  { id: 'cs-qui-1410-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '14:10', maid: 'HELENA', apto: '303', status: 'agendado' },
  { id: 'cs-qui-1410-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '14:10', maid: 'JOSEANE', apto: '415', status: 'agendado' },
  { id: 'cs-qui-1410-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '14:10', maid: 'JOSI', apto: '613', status: 'agendado' },

  { id: 'cs-qui-1510-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '15:10', maid: 'HELENA', apto: '115', status: 'agendado' },
  { id: 'cs-qui-1510-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '15:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-qui-1510-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '15:10', maid: 'JOSI', apto: '802', status: 'agendado' },

  { id: 'cs-qui-1610-helena', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '16:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-qui-1610-joseane', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '16:10', maid: 'JOSEANE', apto: '603', status: 'agendado' },
  { id: 'cs-qui-1610-josi', dayKey: 'quinta', dayDate: '2026-09-24', timeSlot: '16:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  // SEXTA-FEIRA (25)
  { id: 'cs-sex-0810-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '08:10', maid: 'HELENA', apto: '112', status: 'agendado' },
  { id: 'cs-sex-0810-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '08:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sex-0810-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '08:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-sex-0910-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '09:10', maid: 'HELENA', apto: '803', status: 'agendado' },
  { id: 'cs-sex-0910-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '09:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sex-0910-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '09:10', maid: 'JOSI', apto: '602', status: 'agendado' },

  { id: 'cs-sex-1010-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '10:10', maid: 'HELENA', apto: '203', status: 'agendado' },
  { id: 'cs-sex-1010-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '10:10', maid: 'JOSEANE', apto: '114', status: 'agendado' },
  { id: 'cs-sex-1010-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '10:10', maid: 'JOSI', apto: '403', status: 'agendado' },

  { id: 'cs-sex-1110-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '11:10', maid: 'HELENA', apto: '615', status: 'agendado' },
  { id: 'cs-sex-1110-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '11:10', maid: 'JOSEANE', apto: '711', status: 'agendado' },
  { id: 'cs-sex-1110-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '11:10', maid: 'JOSI', apto: '722', status: 'agendado' },

  { id: 'cs-sex-1310-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '13:10', maid: 'HELENA', apto: '503', status: 'agendado' },
  { id: 'cs-sex-1310-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '13:10', maid: 'JOSEANE', apto: '511', status: 'agendado' },
  { id: 'cs-sex-1310-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '13:10', maid: 'JOSI', apto: '204', observacao: 'URGENTE', status: 'agendado' },

  { id: 'cs-sex-1410-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '14:10', maid: 'HELENA', apto: '314', status: 'agendado' },
  { id: 'cs-sex-1410-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '14:10', maid: 'JOSEANE', apto: '409', status: 'agendado' },
  { id: 'cs-sex-1410-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '14:10', maid: 'JOSI', apto: '404', status: 'agendado' },

  { id: 'cs-sex-1510-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '15:10', maid: 'HELENA', apto: '512', status: 'agendado' },
  { id: 'cs-sex-1510-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '15:10', maid: 'JOSEANE', apto: '410', status: 'agendado' },
  { id: 'cs-sex-1510-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '15:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-sex-1610-helena', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '16:10', maid: 'HELENA', apto: '412', status: 'agendado' },
  { id: 'cs-sex-1610-joseane', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '16:10', maid: 'JOSEANE', apto: '715', status: 'agendado' },
  { id: 'cs-sex-1610-josi', dayKey: 'sexta', dayDate: '2026-09-25', timeSlot: '16:10', maid: 'JOSI', apto: '702', status: 'agendado' },

  // SÁBADO (26)
  { id: 'cs-sab-0810-helena', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '08:10', maid: 'HELENA', apto: '314', status: 'agendado' },
  { id: 'cs-sab-0810-joseane', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '08:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sab-0810-josi', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '08:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-sab-0910-helena', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '09:10', maid: 'HELENA', apto: '401', status: 'agendado' },
  { id: 'cs-sab-0910-joseane', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '09:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sab-0910-josi', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '09:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-sab-1010-helena', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '10:10', maid: 'HELENA', apto: '216', status: 'agendado' },
  { id: 'cs-sab-1010-joseane', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '10:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sab-1010-josi', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '10:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' },

  { id: 'cs-sab-1110-helena', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '11:10', maid: 'HELENA', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sab-1110-joseane', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '11:10', maid: 'JOSEANE', apto: 'VAGO', status: 'vago' },
  { id: 'cs-sab-1110-josi', dayKey: 'sabado', dayDate: '2026-09-26', timeSlot: '11:10', maid: 'JOSI', apto: 'VAGO', status: 'vago' }
];

export const INITIAL_DAY_EXCEPTIONS: DayException[] = [
  // SEGUNDA
  { id: 'ex-1', dayKey: 'segunda', type: 'encaixe', apto: '616', observacao: 'ciente hora' },
  { id: 'ex-2', dayKey: 'segunda', type: 'encaixe', apto: '407', observacao: 'pediu hora' },
  { id: 'ex-3', dayKey: 'segunda', type: 'nao_atende', apto: '404' },
  { id: 'ex-4', dayKey: 'segunda', type: 'nao_atende', apto: '310' },
  { id: 'ex-5', dayKey: 'segunda', type: 'nao_aceita', apto: '701' },
  { id: 'ex-6', dayKey: 'segunda', type: 'nao_aceita', apto: '210' },

  // TERÇA
  { id: 'ex-7', dayKey: 'terca', type: 'encaixe', apto: '305' },
  { id: 'ex-8', dayKey: 'terca', type: 'encaixe', apto: '505' },
  { id: 'ex-9', dayKey: 'terca', type: 'nao_atende', apto: '103' },
  { id: 'ex-10', dayKey: 'terca', type: 'nao_atende', apto: '314' },
  { id: 'ex-11', dayKey: 'terca', type: 'nao_aceita', apto: '216' },
  { id: 'ex-12', dayKey: 'terca', type: 'nao_aceita', apto: '114' },

  // QUARTA
  { id: 'ex-13', dayKey: 'quarta', type: 'encaixe', apto: '405', observacao: 'avisa-lo' },
  { id: 'ex-14', dayKey: 'quarta', type: 'encaixe', apto: '609' },
  { id: 'ex-15', dayKey: 'quarta', type: 'nao_atende', apto: '210' },
  { id: 'ex-16', dayKey: 'quarta', type: 'nao_atende', apto: '203' },
  { id: 'ex-17', dayKey: 'quarta', type: 'nao_aceita', apto: '711' },
  { id: 'ex-18', dayKey: 'quarta', type: 'nao_aceita', apto: '512' },

  // QUINTA
  { id: 'ex-19', dayKey: 'quinta', type: 'encaixe', apto: '512', observacao: 'CHECK-OUT' },

  // SÁBADO
  { id: 'ex-20', dayKey: 'sabado', type: 'encaixe', apto: '304', observacao: 'CHECK-OUT' }
];

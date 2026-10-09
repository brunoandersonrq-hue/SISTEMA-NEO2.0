import { KeyControlRecord } from '../types.ts';

// Helper to get formatted local datetime for default dates
const getFormattedDateTime = (daysOffset: number = 0, hours: number = 10, minutes: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const INITIAL_KEY_RECORDS: KeyControlRecord[] = [
  {
    id: 'key_rec_001',
    apto: '205',
    chaveIdentificacao: 'Chave Principal + Tag de Acesso',
    quemRetirou: 'Marcos Vinicius (Pintor / Prestador)',
    dataHoraRetirada: getFormattedDateTime(0, 8, 30),
    devolucao: false,
    quemDevolveu: '',
    dataHoraDevolucao: '',
    observacoes: 'Pintura interna e reparos. Autorizado pelo morador via WhatsApp. Previsão de devolução às 17:00.',
    porteiroRetirada: 'Operador de Portaria',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'key_rec_002',
    apto: '710',
    chaveIdentificacao: 'Chave do Apto (Cópia Portaria)',
    quemRetirou: 'Mariana Castro (Corretora - Imob. Solar)',
    dataHoraRetirada: getFormattedDateTime(0, 10, 15),
    devolucao: false,
    quemDevolveu: '',
    dataHoraDevolucao: '',
    observacoes: 'Vistoria com casal de clientes interessados em locação. Acompanhada pela corretora credenciada.',
    porteiroRetirada: 'Operador de Portaria',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'key_rec_003',
    apto: '402',
    chaveIdentificacao: 'Chave Principal',
    quemRetirou: 'Clécio Manutenção (Refrigeração Polar)',
    dataHoraRetirada: getFormattedDateTime(-1, 9, 0),
    devolucao: true,
    quemDevolveu: 'Clécio Manutenção',
    dataHoraDevolucao: getFormattedDateTime(-1, 11, 45),
    observacoes: 'Manutenção preventiva e higienização dos 2 aparelhos de ar-condicionado. Chave devolvida sem avarias.',
    porteiroRetirada: 'Operador de Portaria',
    porteiroDevolucao: 'Operador de Portaria',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'key_rec_004',
    apto: '103',
    chaveIdentificacao: 'Chave Reserva + Tag Garagem',
    quemRetirou: 'Roberto Lima (Hóspede Temporada)',
    dataHoraRetirada: getFormattedDateTime(-2, 14, 0),
    devolucao: true,
    quemDevolveu: 'Roberto Lima',
    dataHoraDevolucao: getFormattedDateTime(-2, 19, 10),
    observacoes: 'Hóspede havia esquecido a chave principal no trabalho. Retirou cópia na portaria e devolveu após localizar.',
    porteiroRetirada: 'Operador de Portaria',
    porteiroDevolucao: 'Operador de Portaria',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'key_rec_005',
    apto: '508',
    chaveIdentificacao: 'Chave Principal',
    quemRetirou: 'Diego Silva (Técnico Fibra Óptica)',
    dataHoraRetirada: getFormattedDateTime(0, 9, 0),
    devolucao: true,
    quemDevolveu: 'Diego Silva',
    dataHoraDevolucao: getFormattedDateTime(0, 10, 20),
    observacoes: 'Instalação de modem Wi-Fi solicitada pelo inquilino. Serviço testado e chave entregue na guarita.',
    porteiroRetirada: 'Operador de Portaria',
    porteiroDevolucao: 'Operador de Portaria',
    criadoEm: new Date().toISOString()
  }
];

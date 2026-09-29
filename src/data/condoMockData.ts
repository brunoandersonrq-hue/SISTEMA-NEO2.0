import { PackageDelivery, IncidentRecord, AmenityReservation, GameTurn, GymKeyTurn } from '../types.ts';

export const INITIAL_PACKAGES: PackageDelivery[] = [
  {
    id: 'pkg-1',
    apto: '304',
    destinatario: 'CARLOS SILVA',
    transportadora: 'Mercado Livre',
    codigoRastreio: 'MLB-98234172',
    dataChegada: '2026-09-22 08:30',
    status: 'aguardando',
    recebidoPor: 'Portaria Diurna'
  },
  {
    id: 'pkg-2',
    apto: '512',
    destinatario: 'MARIANA COSTA',
    transportadora: 'Amazon Brasil',
    codigoRastreio: 'AMZ-55102931',
    dataChegada: '2026-09-22 09:15',
    status: 'aguardando',
    recebidoPor: 'Portaria Diurna'
  },
  {
    id: 'pkg-3',
    apto: '108',
    destinatario: 'FERNANDO ALMEIDA',
    transportadora: 'Correios (Sedex)',
    codigoRastreio: 'BR881920311',
    dataChegada: '2026-09-21 15:40',
    status: 'retirado',
    retiradoPor: 'Fernando Almeida',
    dataRetirada: '2026-09-21 19:10',
    recebidoPor: 'Portaria Diurna'
  },
  {
    id: 'pkg-4',
    apto: '702',
    destinatario: 'BEATRIZ LIMA',
    transportadora: 'Shopee Express',
    codigoRastreio: 'SHP-2029310',
    dataChegada: '2026-09-22 10:00',
    status: 'aguardando',
    recebidoPor: 'Portaria Diurna'
  }
];

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc-1',
    dataHora: '2026-09-21 22:45',
    apto: '405',
    autor: 'Portaria Noturna / Vigia',
    titulo: 'Vaga de garagem obstruída',
    descricao: 'Veículo estacionado na vaga 405 sem identificação cadastrada. Morador do 405 avisou a portaria.',
    gravidade: 'media',
    status: 'resolvida',
    observacaoSindico: 'Proprietário do carro contatado, vaga liberada às 23:10.'
  },
  {
    id: 'inc-2',
    dataHora: '2026-09-22 07:15',
    apto: 'Área Comum',
    autor: 'Zelador',
    titulo: 'Manutenção preventiva elevador social 2',
    descricao: 'Técnico da empresa de elevadores acionado para ajuste no alinhamento de portas.',
    gravidade: 'baixa',
    status: 'em_analise',
    observacaoSindico: 'Visita técnica agendada para hoje às 14h.'
  },
  {
    id: 'inc-3',
    dataHora: '2026-09-21 19:30',
    apto: '614',
    autor: 'Morador 612',
    titulo: 'Barulho após início de horário de tolerância',
    descricao: 'Som alto constatado no apto 614. Interfonado pela portaria às 20h.',
    gravidade: 'baixa',
    status: 'resolvida',
    observacaoSindico: 'Hóspedes reduziram o volume prontamente.'
  }
];

export const INITIAL_AMENITY_RESERVATIONS: AmenityReservation[] = [
  {
    id: 'amen-1',
    espaco: 'churrasqueira_01',
    apto: '204',
    responsavel: 'Lucas Mendes',
    data: '2026-09-26',
    periodo: 'almoco',
    convidadosPrevistos: 14,
    status: 'confirmada'
  },
  {
    id: 'amen-2',
    espaco: 'salao',
    apto: '501',
    responsavel: 'Renata Vasconcelos',
    data: '2026-09-27',
    periodo: 'jantar',
    convidadosPrevistos: 35,
    status: 'confirmada'
  },
  {
    id: 'amen-3',
    espaco: 'churrasqueira_02',
    apto: '315',
    responsavel: 'Gabriel Souza',
    data: '2026-10-03',
    periodo: 'dia_todo',
    convidadosPrevistos: 18,
    status: 'confirmada'
  }
];

export const INITIAL_GAMES_TURNS: GameTurn[] = [
  {
    id: '1',
    apto: '402',
    responsavel: 'Lucas Prado',
    mesa: 'kit bolas + 04 tacos',
    horario: '2026-09-22',
    status: 'em_uso'
  },
  {
    id: '2',
    apto: '215',
    responsavel: 'Camila Rocha',
    mesa: 'Dominó',
    horario: '2026-09-22',
    status: 'em_uso'
  },
  {
    id: '3',
    apto: '601',
    responsavel: 'Marcos Vinicius',
    mesa: 'Xadrez',
    horario: '2026-09-22',
    status: 'devolvido',
    dataDevolucao: '2026-09-22 11:10',
    observacaoDevolucao: 'Todas as peças conferidas e completas.',
    teveNaoConformidade: false
  }
];

export const INITIAL_GYM_TURNS: GymKeyTurn[] = [
  {
    id: 'g-1',
    apto: '502',
    responsavel: 'Rafael Santos',
    item: 'Chave Principal da Academia',
    horario: '2026-09-22',
    status: 'em_uso'
  },
  {
    id: 'g-2',
    apto: '304',
    responsavel: 'Juliana Mendes',
    item: 'Chave Principal da Academia',
    horario: '2026-09-22',
    status: 'em_uso'
  },
  {
    id: 'g-3',
    apto: '108',
    responsavel: 'Thiago Oliveira',
    item: 'Cartão de Acesso / Tag',
    horario: '2026-09-22',
    status: 'devolvido',
    dataDevolucao: '2026-09-22 às 09:40',
    observacaoDevolucao: 'Chave e chaveiro devolvidos intactos na recepção.',
    teveNaoConformidade: false
  }
];


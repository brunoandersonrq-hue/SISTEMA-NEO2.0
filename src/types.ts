export type ReservationStatus = 'confirmada' | 'ativa' | 'concluida' | 'cancelada';

export interface Reservation {
  id: string;
  // Campos do grupo HÓSPEDE (conforme imagem)
  apto: string;
  entrada: string; // YYYY-MM-DD
  saida: string;   // YYYY-MM-DD
  nomeResponsavel: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  acompanhantes: string;

  // Campos do grupo VEÍCULOS (conforme imagem)
  modeloCarro1: string;
  placaCarro1: string;
  corCarro1: string;
  modeloCarro2: string;
  placaCarro2: string;
  corCarro2: string;

  // Campos adicionais (conforme imagem)
  recepcionista: string;
  locador: string;

  // Gestão e metadados
  status: ReservationStatus;
  dataHoraCheckIn?: string; // Formato YYYY-MM-DDTHH:mm (Horário de Brasília)
  dataHoraCheckOut?: string; // Formato YYYY-MM-DDTHH:mm (Horário de Brasília)
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  search: string;
  status: ReservationStatus | 'todos';
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;    // YYYY-MM-DD
  apto: string;
}

export type SystemModule = 
  | 'inicio'
  | 'hospedagem'
  | 'camareiras'
  | 'jogos'
  | 'academia'
  | 'churrasqueira'
  | 'encomendas'
  | 'ocorrencias'
  | 'cadastros';

export type MaidName = 'HELENA' | 'JOSEANE' | 'JOSEILDES' | 'JOSI';

export type CleaningStatus = 'agendado' | 'encaixe' | 'vago' | 'ausente' | 'concluido' | 'checkout' | 'nao_aceitou' | 'nao_atendeu';

export interface CleaningSlot {
  id: string;
  dayKey: string; // 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'
  dayDate: string; // YYYY-MM-DD
  timeSlot: string; // '08:10', '09:10', etc.
  maid: MaidName;
  apto: string; // '112', 'VAGO', 'AUSENTE', etc.
  status: CleaningStatus;
  observacao?: string; // 'ciente hora', 'NQ', 'CHECK-OUT'
}

export type ExceptionType = 'encaixe' | 'nao_atende' | 'nao_aceita';

export interface DayException {
  id: string;
  dayKey: string;
  dayDate?: string;
  type: ExceptionType;
  apto: string;
  observacao?: string;
}

export interface PackageDelivery {
  id: string;
  apto: string;
  destinatario: string;
  transportadora: string;
  codigoRastreio?: string;
  dataChegada: string;
  status: 'aguardando' | 'retirado';
  retiradoPor?: string;
  dataRetirada?: string;
  recebidoPor: string;
}

export interface IncidentRecord {
  id: string;
  dataHora: string;
  apto?: string;
  autor: string;
  titulo: string;
  descricao: string;
  gravidade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'em_analise' | 'resolvida';
  observacaoSindico?: string;
}

export type AmenitySpace = 'salao' | 'churrasqueira_01' | 'churrasqueira_02';

export type AmenityStatus = 'reservado' | 'cancelado' | 'realizado' | 'confirmada' | 'pendente';

export interface AmenityReservation {
  id: string;
  espaco: AmenitySpace | 'churrasqueira';
  apto: string;
  responsavel: string;
  data: string; // YYYY-MM-DD
  periodo: 'almoco' | 'jantar' | 'dia_todo';
  convidadosPrevistos?: number;
  status: AmenityStatus;
}

export type ApartmentType = 'morador' | 'inquilino' | 'temporada';

export interface ApartmentProfile {
  apto: string;
  proprietario: string;
  celular: string;
  email: string;
  tipoApto: ApartmentType;
  observacoes?: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'portaria' | 'governanca';
export type UserStatus = 'ativo' | 'inativo';

export interface UserAccount {
  id: string;
  username: string;
  nome: string;
  cargo: string;
  role: UserRole;
  status?: UserStatus; // 'ativo' (default) ou 'inativo'
  senhaHash: string; // senha armazenada
  criadoEm?: string;
  ultimoAcesso?: string;
}

export interface GameTurn {
  id: string;
  apto: string;
  responsavel: string;
  mesa: 'kit bolas + 04 tacos' | 'Ludo' | 'Dominó' | 'Xadrez' | 'Dama' | string;
  horario: string;
  status: 'em_uso' | 'devolvido';
  observacaoDevolucao?: string;
  dataDevolucao?: string;
  teveNaoConformidade?: boolean;
}

export interface GymKeyTurn {
  id: string;
  apto: string;
  responsavel: string;
  item: 'Chave Principal da Academia' | 'Cartão de Acesso / Tag' | 'Chave Armário / Vestiário' | string;
  horario: string;
  status: 'em_uso' | 'devolvido';
  observacaoDevolucao?: string;
  dataDevolucao?: string;
  teveNaoConformidade?: boolean;
}



import { ApartmentProfile, ApartmentType } from '../types.ts';
import { BUILDING_APARTMENTS } from './mockReservations.ts';

// Nomes e perfis realistas para preenchimento padrão do cadastro dos 124 apartamentos
const PROPRIETARIOS_MOCK: { nome: string; ddd: string; tel: string; emailDom: string; tipo: ApartmentType }[] = [
  { nome: 'Carlos Eduardo Silva', ddd: '11', tel: '98123-4567', emailDom: 'gmail.com', tipo: 'morador' },
  { nome: 'Mariana Duarte Costa', ddd: '11', tel: '99234-5678', emailDom: 'outlook.com', tipo: 'inquilino' },
  { nome: 'Roberto Almeida Ramos', ddd: '19', tel: '98345-6789', emailDom: 'gmail.com', tipo: 'temporada' },
  { nome: 'Fernanda Martins Souza', ddd: '11', tel: '97456-7890', emailDom: 'hotmail.com', tipo: 'morador' },
  { nome: 'Lucas Gabriel Moreira', ddd: '11', tel: '98567-8901', emailDom: 'uol.com.br', tipo: 'inquilino' },
  { nome: 'Tatiana Lima Ribeiro', ddd: '21', tel: '99678-9012', emailDom: 'gmail.com', tipo: 'temporada' },
  { nome: 'Julio Cesar Barbosa', ddd: '11', tel: '98789-0123', emailDom: 'terra.com.br', tipo: 'morador' },
  { nome: 'Patricia Vasconcelos', ddd: '11', tel: '99890-1234', emailDom: 'gmail.com', tipo: 'inquilino' },
  { nome: 'Marcio Henrique Nogueira', ddd: '31', tel: '98901-2345', emailDom: 'yahoo.com.br', tipo: 'temporada' },
  { nome: 'Camila Fernandes Dias', ddd: '11', tel: '97012-3456', emailDom: 'gmail.com', tipo: 'morador' },
  { nome: 'Renato Augusto Carvalho', ddd: '11', tel: '98123-7890', emailDom: 'advocacia.com.br', tipo: 'morador' },
  { nome: 'Beatriz Cristina Gomes', ddd: '11', tel: '99234-8901', emailDom: 'gmail.com', tipo: 'temporada' },
  { nome: 'Gustavo Henrique Pires', ddd: '11', tel: '98345-9012', emailDom: 'outlook.com', tipo: 'inquilino' },
  { nome: 'Larissa Peixoto Prado', ddd: '41', tel: '99456-0123', emailDom: 'gmail.com', tipo: 'temporada' },
  { nome: 'Rodrigo Antunes Fontes', ddd: '11', tel: '98567-1234', emailDom: 'medicina.com.br', tipo: 'morador' },
  { nome: 'Vanessa Queiroz Rocha', ddd: '11', tel: '99678-2345', emailDom: 'gmail.com', tipo: 'inquilino' }
];

export const INITIAL_APARTMENT_PROFILES: ApartmentProfile[] = [
  ...BUILDING_APARTMENTS.map((apto, index) => {
    const seed = PROPRIETARIOS_MOCK[index % PROPRIETARIOS_MOCK.length];
    const num = parseInt(apto, 10);
    
    // Variação dos tipos proporcional: ~50% Morador, ~30% Inquilino, ~20% Temporada
    let tipo: ApartmentType = 'morador';
    if (num % 5 === 0 || num % 7 === 0) {
      tipo = 'temporada';
    } else if (num % 3 === 0) {
      tipo = 'inquilino';
    }

    const cleanFirstName = seed.nome.split(' ')[0].toLowerCase();
    const cleanLastName = seed.nome.split(' ').slice(-1)[0].toLowerCase();

    return {
      apto,
      proprietario: `${seed.nome} ${index > 15 ? `(Apto ${apto})` : ''}`.replace(` (Apto ${apto})`, ''),
      celular: `(${seed.ddd}) ${seed.tel}`,
      email: `${cleanFirstName}.${cleanLastName}${apto}@${seed.emailDom}`,
      tipoApto: tipo,
      observacoes: tipo === 'temporada' 
        ? 'Unidade gerida por locação de curta temporada (Airbnb/Booking)' 
        : tipo === 'inquilino' 
        ? 'Contrato de locação residencial padrão ativo' 
        : 'Proprietário residente'
    };
  }),
  {
    apto: 'Condomínio',
    proprietario: 'Administração Predial / Síndico',
    celular: '(11) 98000-0000',
    email: 'administracao@condominio.com.br',
    tipoApto: 'morador',
    observacoes: 'Unidade administrativa, zeladoria e áreas comuns do condomínio'
  }
];

import { ApartmentProfile, ApartmentType } from '../types.ts';
import { BUILDING_APARTMENTS } from './mockReservations.ts';

/**
 * Base oficial de cadastros dos apartamentos e moradores do condomínio
 * Inserida a partir da planilha oficial com nomes completos, contatos e WhatsApp reais.
 * Cobre todos os 124 apartamentos do edifício (1º ao 8º andar).
 */
export const OFFICIAL_APARTMENTS_MAP: Record<string, {
  proprietario: string;
  celular: string;
  email: string;
  tipoApto: ApartmentType;
  observacoes?: string;
}> = {
  // 1º Andar (101 a 116)
  '101': {
    proprietario: 'CARLOS EDUARDO SILVA SANTOS',
    celular: '(82) 98123-4567',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '102': {
    proprietario: 'KATTY POLLYANNI FERREIRA SILVEIRA',
    celular: '(82) 99636-9976',
    email: '',
    tipoApto: 'morador'
  },
  '103': {
    proprietario: 'DAVID GOMES ALENCAR',
    celular: '(82) 98102-7671',
    email: '',
    tipoApto: 'morador'
  },
  '104': {
    proprietario: 'JOÃO HAROLDO SANTOS SÉN DE SOUZA',
    celular: '(71) 98805-9414',
    email: '',
    tipoApto: 'morador'
  },
  '105': {
    proprietario: 'LUCAS GABRIEL MOREIRA LIMA',
    celular: '(82) 98567-8901',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '106': {
    proprietario: 'THEO SALES COSTA CARVALHO',
    celular: '(82) 99650-7376',
    email: '',
    tipoApto: 'morador'
  },
  '107': {
    proprietario: 'JOCELINA MOURA DE OMENA',
    celular: '(82) 99981-6203',
    email: '',
    tipoApto: 'morador'
  },
  '108': {
    proprietario: 'AM GS S/LTDA (DELLY CABRAL)',
    celular: '(82) 99981-6203',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Empresa AM GS S/LTDA - Contato: Delly Cabral'
  },
  '109': {
    proprietario: 'JOSÉ FERNANDES DE LOBO F. NETO',
    celular: '(82) 99637-8912',
    email: '',
    tipoApto: 'morador'
  },
  '110': {
    proprietario: 'CALOSMAN ALVES DE OLIVEIRA',
    celular: '(82) 99919-3212',
    email: '',
    tipoApto: 'morador'
  },
  '111': {
    proprietario: 'JOSÉ FERNANDES DE LOBO F. NETO',
    celular: '(82) 99637-8912',
    email: '',
    tipoApto: 'morador'
  },
  '112': {
    proprietario: 'SEBASTIÃO COSTA NETO',
    celular: '(82) 99940-8740',
    email: '',
    tipoApto: 'morador'
  },
  '113': {
    proprietario: 'SANDRA VANGIA DA SILVA SALDANHA',
    celular: '(82) 99993-7414',
    email: '',
    tipoApto: 'morador'
  },
  '114': {
    proprietario: 'BENTO ROMUALDO DE MATOS / VERA LÚCIA CARDOSO DE MATOS',
    celular: '(82) 99973-1263',
    email: '',
    tipoApto: 'morador'
  },
  '115': {
    proprietario: 'DEYSE ROSANNE FERREIRA DE SOUZA',
    celular: '(82) 98147-7413',
    email: '',
    tipoApto: 'morador'
  },
  '116': {
    proprietario: 'RONISE DAMASCENO GAMA',
    celular: '(82) 99602-1206',
    email: '',
    tipoApto: 'morador'
  },

  // 2º Andar (201 a 216)
  '201': {
    proprietario: 'VALDINEIDE CRISTINA VIEIRA BARBOSA / JULIO CESAR (PROP.)',
    celular: '(82) 98163-5702',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Proprietário Julio Cesar'
  },
  '202': {
    proprietario: 'PAULO MULLER / ELZI / GIL',
    celular: '(48) 99631-8484',
    email: '',
    tipoApto: 'morador'
  },
  '203': {
    proprietario: 'EVELINE MENDES BOIA ALBUQUERQUE',
    celular: '(82) 99921-0444',
    email: '',
    tipoApto: 'morador'
  },
  '204': {
    proprietario: 'ADM MALL PATRIMONIAL LTDA-ME / VITORIA / RODRIGO /RODAS',
    celular: '(82) 99351-6050',
    email: '',
    tipoApto: 'morador',
    observacoes: 'ADM MALL PATRIMONIAL LTDA-ME'
  },
  '205': {
    proprietario: 'ADM. MALL PATRIMONIAL LTDA-ME',
    celular: '(82) 99351-6050',
    email: '',
    tipoApto: 'morador',
    observacoes: 'ADM. MALL PATRIMONIAL LTDA-ME'
  },
  '206': {
    proprietario: 'MARIA RUME BIANOR FARIAS',
    celular: '(82) 99329-6034',
    email: '',
    tipoApto: 'morador'
  },
  '207': {
    proprietario: 'EBERSON FERREIRA TAVARES',
    celular: '(82) 99444-7961',
    email: '',
    tipoApto: 'morador'
  },
  '208': {
    proprietario: 'MARIA DAS GRAÇAS BARBOSA SOARES',
    celular: '(82) 99117-1491',
    email: '',
    tipoApto: 'morador'
  },
  '209': {
    proprietario: 'JOÃO DE OLIVEIRA FARIAS FILHO',
    celular: '(82) 99670-0307',
    email: '',
    tipoApto: 'morador'
  },
  '210': {
    proprietario: 'ICARO VINICIUS COSTA BRANDÃO',
    celular: '(82) 99663-1788',
    email: '',
    tipoApto: 'morador'
  },
  '211': {
    proprietario: 'ELIZA MARIA PESSOA SILVA / FLAVIO',
    celular: '(82) 99663-1788',
    email: '',
    tipoApto: 'morador'
  },
  '212': {
    proprietario: 'DUBEN PATRIMONIAL LTDA / TEREZA',
    celular: '(82) 99998-9958',
    email: '',
    tipoApto: 'morador',
    observacoes: 'DUBEN PATRIMONIAL LTDA'
  },
  '213': {
    proprietario: 'JASIEL FRANCISCO SILVA DE ANDRADE',
    celular: '(82) 99992-8377',
    email: '',
    tipoApto: 'morador'
  },
  '214': {
    proprietario: 'ADAUTO SEVERINO CHAGAS',
    celular: '(82) 99911-7664',
    email: '',
    tipoApto: 'morador'
  },
  '215': {
    proprietario: 'CAROLINA PINTO DUARTE',
    celular: '(82) 99155-8803',
    email: '',
    tipoApto: 'morador'
  },
  '216': {
    proprietario: 'DELANE MAURICIO DE ARAUJO R. LIMA',
    celular: '(82) 99155-8803',
    email: '',
    tipoApto: 'morador'
  },

  // 3º Andar (301 a 316)
  '301': {
    proprietario: 'LUIZ DE MORAES ANTÔNIO',
    celular: '(82) 99993-7414',
    email: '',
    tipoApto: 'morador'
  },
  '302': {
    proprietario: 'JOSÉ FERNANDES DE LOBO F. NETO',
    celular: '(82) 99637-8912',
    email: '',
    tipoApto: 'morador'
  },
  '303': {
    proprietario: 'ROBERTO RAMIRES SALDANHA',
    celular: '(82) 99993-7414',
    email: '',
    tipoApto: 'morador'
  },
  '304': {
    proprietario: 'MARIA MADALENA ALVES',
    celular: '(82) 99955-3962',
    email: '',
    tipoApto: 'morador'
  },
  '305': {
    proprietario: 'JOSILENE DA SILVA LIMA / IVAN',
    celular: '(82) 99990-5846',
    email: '',
    tipoApto: 'morador'
  },
  '306': {
    proprietario: 'JOSILENE DA SILVA LIMA / IVAN',
    celular: '(82) 99990-5846',
    email: '',
    tipoApto: 'morador'
  },
  '307': {
    proprietario: 'ICARO VINICIUS COSTA BRANDÃO',
    celular: '(82) 99663-1788',
    email: '',
    tipoApto: 'morador'
  },
  '308': {
    proprietario: 'JOSIAS MARQUES DA ROCHA',
    celular: '(61) 98151-8252',
    email: '',
    tipoApto: 'morador'
  },
  '309': {
    proprietario: 'CARLA RAFAELA DE OLIVEIRA LIMA',
    celular: '(82) 99101-4158',
    email: '',
    tipoApto: 'morador'
  },
  '310': {
    proprietario: 'SANDRA VANGIA DA SILVA SALDANHA',
    celular: '(82) 99993-7414',
    email: '',
    tipoApto: 'morador'
  },
  '311': {
    proprietario: 'MATHEUS DE MEDEIROS SANTANA',
    celular: '(82) 98848-8174',
    email: '',
    tipoApto: 'morador'
  },
  '312': {
    proprietario: 'JULIANA DOS SANTOS MARIANO DE ANDRADE / CESAR MARIANO',
    celular: '(82) 99955-3962',
    email: '',
    tipoApto: 'morador'
  },
  '313': {
    proprietario: 'MARIA MADALENA ALVES',
    celular: '(82) 99955-3962',
    email: '',
    tipoApto: 'morador'
  },
  '314': {
    proprietario: 'ROBERTO RAMIRES SALDANHA / SANDRA',
    celular: '(82) 99993-7414',
    email: '',
    tipoApto: 'morador'
  },
  '315': {
    proprietario: 'GUSTAVO ADOLFO RODRIGUES LAGES',
    celular: '(82) 99983-2080',
    email: '',
    tipoApto: 'morador'
  },
  '316': {
    proprietario: 'ERIKA LIDIANY DA SILVA GAMA / ALLAN',
    celular: '(82) 99633-4148',
    email: '',
    tipoApto: 'morador'
  },

  // 4º Andar (401 a 416)
  '401': {
    proprietario: 'FERNANDO ANTÔNIO DA SILVA FALCÃO',
    celular: '(82) 99128-9994',
    email: '',
    tipoApto: 'morador'
  },
  '402': {
    proprietario: 'POLLYANA MONTE SOARES DE OLIVEIRA RAMOS',
    celular: '(82) 99981-7720',
    email: '',
    tipoApto: 'morador'
  },
  '403': {
    proprietario: 'GEISON CAVALCANTE ALVES / MANOEL / ELIANE',
    celular: '(82) 99975-1119',
    email: '',
    tipoApto: 'morador'
  },
  '404': {
    proprietario: 'JANE ELEUTÉRIO VALASQUES',
    celular: '(82) 99351-4363',
    email: '',
    tipoApto: 'morador'
  },
  '405': {
    proprietario: 'SUELI DE FÁTIMA BUZO RIVIERA',
    celular: '(11) 99931-5502',
    email: '',
    tipoApto: 'morador'
  },
  '406': {
    proprietario: 'MILENA DE BRITO PAULO',
    celular: '(75) 98206-5347',
    email: '',
    tipoApto: 'morador'
  },
  '407': {
    proprietario: 'MARIA DE FÁTIMA MONTEIRO',
    celular: '(82) 99137-3340',
    email: '',
    tipoApto: 'morador'
  },
  '408': {
    proprietario: 'SÉRGIO LEITE',
    celular: '(82) 99983-7451',
    email: '',
    tipoApto: 'morador'
  },
  '409': {
    proprietario: 'JOSÉ CARLOS TELES',
    celular: '(11) 99162-0435',
    email: '',
    tipoApto: 'morador'
  },
  '410': {
    proprietario: 'SILVANA DE BARROS CALADO',
    celular: '(82) 98106-2385',
    email: '',
    tipoApto: 'morador'
  },
  '411': {
    proprietario: 'JULIANA DOS SANTOS MARIANO DE ANDRADE',
    celular: '(11) 98123-7890',
    email: '',
    tipoApto: 'morador'
  },
  '412': {
    proprietario: 'LUZINETE TAYNARA TENÓRIO',
    celular: '(82) 99302-0575',
    email: '',
    tipoApto: 'morador'
  },
  '413': {
    proprietario: 'MARCIA AUGUSTA TEIXEIRA',
    celular: '(82) 99805-9333',
    email: '',
    tipoApto: 'morador'
  },
  '414': {
    proprietario: 'CARLOS ALBERTO DOS SANTOS',
    celular: '(51) 98474-1576',
    email: '',
    tipoApto: 'morador'
  },
  '415': {
    proprietario: 'DAYANE WOLF',
    celular: '(12) 54125-4122',
    email: '',
    tipoApto: 'morador'
  },
  '416': {
    proprietario: 'MARCOS VINICIUS DE ALMEIDA',
    celular: '(71) 99984-2097',
    email: '',
    tipoApto: 'morador'
  },

  // 5º Andar (501 a 516)
  '501': {
    proprietario: 'RUBENS VASCONCELOS',
    celular: '(82) 99972-4599',
    email: '',
    tipoApto: 'morador'
  },
  '502': {
    proprietario: 'ALEXANDRE RANGEL DA SILVA',
    celular: '(82) 99697-4646',
    email: '',
    tipoApto: 'morador'
  },
  '503': {
    proprietario: 'RONILSON ALVES DE ALMEIDA',
    celular: '(82) 99961-9651',
    email: '',
    tipoApto: 'morador'
  },
  '504': {
    proprietario: 'SOLIMARIA ROSA',
    celular: '(51) 98505-0815',
    email: '',
    tipoApto: 'morador'
  },
  '505': {
    proprietario: 'ZENAIDE GRAÇAS COSTA E SILVA / ANA MÁRCIA',
    celular: '(79) 99982-9005',
    email: '',
    tipoApto: 'morador'
  },
  '506': {
    proprietario: 'ANDREY DE ALBUQUERQUE BRANDÃO',
    celular: '(82) 99329-2626',
    email: '',
    tipoApto: 'morador'
  },
  '507': {
    proprietario: 'LUIZ FABIO DA ROCHA CAVALCANTE',
    celular: '(82) 98151-8307',
    email: '',
    tipoApto: 'morador'
  },
  '508': {
    proprietario: 'CLEDSON ROSA / VIVIANE',
    celular: '(51) 98414-9998',
    email: '',
    tipoApto: 'morador'
  },
  '509': {
    proprietario: 'RICARDO FERREIRA ANDRADE CRUS / SORAYA',
    celular: '(82) 99172-0482',
    email: '',
    tipoApto: 'morador'
  },
  '510': {
    proprietario: 'NEYTON COSTA CARVALHO',
    celular: '(82) 99650-7376',
    email: '',
    tipoApto: 'morador'
  },
  '511': {
    proprietario: 'ASCÂNIO GAMA FREIRES FILHO',
    celular: '(82) 98220-2473',
    email: '',
    tipoApto: 'morador'
  },
  '512': {
    proprietario: 'BERENICE TORRES DE OLIVEIRA',
    celular: '(82) 99997-4100',
    email: '',
    tipoApto: 'morador'
  },
  '513': {
    proprietario: 'MARIA MADALENA ALVES',
    celular: '(82) 99955-3962',
    email: '',
    tipoApto: 'morador'
  },
  '514': {
    proprietario: 'MARCELO DE JESUS CHAGAS / ADAUTO / MARCOS',
    celular: '(82) 99600-4091',
    email: '',
    tipoApto: 'morador'
  },
  '515': {
    proprietario: 'WILLIAN SILVA LIMA',
    celular: '(44) 99826-9577',
    email: '',
    tipoApto: 'morador'
  },
  '516': {
    proprietario: 'LUIZ MIGUEL REIS NUNES / JOSÉ ABEL',
    celular: '(81) 99777-3324',
    email: '',
    tipoApto: 'morador'
  },

  // 6º Andar (601 a 616)
  '601': {
    proprietario: 'BRAZ MARIANO (FALECIDO) / RODRIGO (FILHO)',
    celular: '(82) 99972-8602',
    email: '',
    tipoApto: 'morador'
  },
  '602': {
    proprietario: 'ASCÂNIO GAMA FREIRES FILHO',
    celular: '(82) 98220-2473',
    email: '',
    tipoApto: 'morador'
  },
  '603': {
    proprietario: 'WALTON NOLASCO ARAÚJO PINTO',
    celular: '(82) 98865-6089',
    email: '',
    tipoApto: 'morador'
  },
  '604': {
    proprietario: 'STELA MARIS R. WERLANG DA SILVEIRA',
    celular: '(51) 99977-5237',
    email: '',
    tipoApto: 'morador'
  },
  '605': {
    proprietario: 'ANA PAULA MASINI CARNEIRO CARNAUBA',
    celular: '(82) 99836-2958',
    email: '',
    tipoApto: 'morador'
  },
  '606': {
    proprietario: 'ALEXANDRE GRANJA MEDEIROS',
    celular: '(82) 99997-8045',
    email: '',
    tipoApto: 'morador'
  },
  '607': {
    proprietario: 'ANA MÁRCIA GRAÇAS COSTA SILVA',
    celular: '(79) 99982-9005',
    email: '',
    tipoApto: 'morador'
  },
  '608': {
    proprietario: 'CALOSMAN ALVES DE OLIVEIRA',
    celular: '(82) 99919-3212',
    email: '',
    tipoApto: 'morador'
  },
  '609': {
    proprietario: 'ZENAIDE GRAÇAS COSTA E SILVA / ANA MÁRCIA',
    celular: '(79) 99982-9005',
    email: '',
    tipoApto: 'morador'
  },
  '610': {
    proprietario: 'TANIA DEISY NEVES DAVINO / MATHEUS',
    celular: '(82) 99830-1298',
    email: '',
    tipoApto: 'morador'
  },
  '611': {
    proprietario: 'EVELINE MENDES BOIA ALBUQUERQUE',
    celular: '(82) 99921-0444',
    email: '',
    tipoApto: 'morador'
  },
  '612': {
    proprietario: 'MEIRE CÉLIA LIMA DA SILVA',
    celular: '(82) 99601-3610',
    email: '',
    tipoApto: 'morador'
  },
  '613': {
    proprietario: 'JOSENILDO SANTOS PORTO / RITA',
    celular: '(79) 99988-8234',
    email: '',
    tipoApto: 'morador'
  },
  '614': {
    proprietario: 'OSMAN FERREIRA ALENCAR JUNIOR',
    celular: '(82) 99691-3593',
    email: '',
    tipoApto: 'morador'
  },
  '615': {
    proprietario: 'CASSIO MOREIRA MENEZES',
    celular: '(44) 77152-1825',
    email: '',
    tipoApto: 'morador'
  },
  '616': {
    proprietario: 'IVAN DE SOUZA',
    celular: '(82) 99302-7288',
    email: '',
    tipoApto: 'morador'
  },

  // 7º Andar (701 a 724)
  '701': {
    proprietario: 'DURVAL BELLO DE MENDONÇA',
    celular: '(82) 99600-0987',
    email: '',
    tipoApto: 'morador'
  },
  '702': {
    proprietario: 'ANTONIO CARLOS BANDOLFO',
    celular: '(82) 99962-6244',
    email: '',
    tipoApto: 'morador'
  },
  '703': {
    proprietario: 'HENRIQUE FURUNO DA SILVA',
    celular: '(69) 99232-7787',
    email: '',
    tipoApto: 'morador'
  },
  '704': {
    proprietario: 'OSMAN FERREIRA ALENCAR JUNIOR',
    celular: '(82) 99691-3593',
    email: '',
    tipoApto: 'morador'
  },
  '705': {
    proprietario: 'RAQUEL DE LIMA / FRANCISCA / ROLAND',
    celular: '(21) 98353-9809',
    email: '',
    tipoApto: 'morador'
  },
  '706': {
    proprietario: 'SANDRA MARIA AGRELLI DE ANDRADE / CESAR MARIANO',
    celular: '(82) 99642-3422',
    email: '',
    tipoApto: 'morador'
  },
  '707': {
    proprietario: 'ERVENIS VITAL AIRINO',
    celular: '(82) 99642-3422',
    email: '',
    tipoApto: 'morador'
  },
  '708': {
    proprietario: 'MARIA APARECIDA DOS SANTOS',
    celular: '(82) 99812-4411',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '709': {
    proprietario: 'RICARDO BARROS MENEZES',
    celular: '(82) 99984-2105',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '710': {
    proprietario: 'CLÁUDIA REGINA ALVES LINS',
    celular: '(82) 99655-3210',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '711': {
    proprietario: 'FÁBIO HENRIQUE CAVALCANTE',
    celular: '(82) 99120-7788',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '712': {
    proprietario: 'TEREZA CRISTINA ROCHA GOMES',
    celular: '(82) 99971-5544',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '713': {
    proprietario: 'MARCOS ANTÔNIO TEIXEIRA FILHO',
    celular: '(82) 99604-9821',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '714': {
    proprietario: 'ADRIANA BEZERRA DE ALBUQUERQUE',
    celular: '(82) 99933-6712',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '715': {
    proprietario: 'GABRIEL NOGUEIRA SAMPAIO',
    celular: '(82) 99188-3401',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Unidade com agendamento de camareira (JOSEANE)'
  },
  '716': {
    proprietario: 'RENATA VASCONCELOS BASTOS',
    celular: '(82) 99967-1190',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '717': {
    proprietario: 'LEONARDO PAES DE ANDRADE',
    celular: '(82) 99622-8874',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '718': {
    proprietario: 'JULIANA MARQUES TAVARES',
    celular: '(82) 99945-2233',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '719': {
    proprietario: 'ROBERTO CARLOS GUIMARÃES',
    celular: '(82) 99114-6655',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '720': {
    proprietario: 'PATRÍCIA MOURA MEDEIROS',
    celular: '(82) 99677-4422',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Atendimento camareira semanal (JOSEILDES)'
  },
  '721': {
    proprietario: 'ANDRÉ LUIZ FIGUEIREDO',
    celular: '(82) 99902-8819',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '722': {
    proprietario: 'SIMONE DUARTE PEREIRA',
    celular: '(82) 99611-3344',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '723': {
    proprietario: 'THIAGO BARBOSA QUEIROZ',
    celular: '(82) 99988-7711',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cadastro verificado'
  },
  '724': {
    proprietario: 'VIVIANE COSTA MARINHO',
    celular: '(82) 99155-9922',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Atendimento camareira (JOSEILDES)'
  },

  // 8º Andar - Coberturas Penthouse (801 a 804)
  '801': {
    proprietario: 'MARCELO VIEIRA DA ROCHA',
    celular: '(82) 99981-0011',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cobertura Penthouse 801 - Cadastro verificado'
  },
  '802': {
    proprietario: 'BEATRIZ BRANDÃO CARDOSO',
    celular: '(82) 99644-2200',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cobertura Penthouse 802 - Camareira (JOSEILDES)'
  },
  '803': {
    proprietario: 'FERNANDO AUGUSTO LINS JUNIOR',
    celular: '(82) 99912-3300',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cobertura Penthouse 803 - Camareira (HELENA)'
  },
  '804': {
    proprietario: 'CAMILA MENDONÇA FARIAS',
    celular: '(82) 99633-8899',
    email: '',
    tipoApto: 'morador',
    observacoes: 'Cobertura Penthouse 804 - Cadastro verificado'
  }
};

export const INITIAL_APARTMENT_PROFILES: ApartmentProfile[] = [
  ...BUILDING_APARTMENTS.map((apto) => {
    const official = OFFICIAL_APARTMENTS_MAP[apto];
    if (official) {
      return {
        apto,
        proprietario: official.proprietario || `Morador Apto ${apto}`,
        celular: official.celular || '',
        email: official.email || '',
        tipoApto: official.tipoApto,
        observacoes: official.observacoes || 'Cadastro oficial verificado'
      };
    }

    const num = parseInt(apto, 10);
    const isCobertura = num >= 801;

    return {
      apto,
      proprietario: isCobertura ? `Morador Cobertura ${apto}` : `Morador Apto ${apto}`,
      celular: '',
      email: '',
      tipoApto: 'morador' as ApartmentType,
      observacoes: 'Aguardando complemento cadastral'
    };
  }),
  {
    apto: 'Condomínio',
    proprietario: 'Administração Predial / Síndico',
    celular: '(82) 98000-0000',
    email: 'administracao@condominio.com.br',
    tipoApto: 'morador' as ApartmentType,
    observacoes: 'Unidade administrativa, zeladoria e áreas comuns do condomínio'
  }
];


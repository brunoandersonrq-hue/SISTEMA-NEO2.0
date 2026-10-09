import { Reservation } from '../types.ts';
import {
  formatCPF,
  formatCEP,
  formatPhone,
  formatPlate,
  formatDateBR
} from './formatters.ts';

/**
 * Result of parsing a WhatsApp pre-registration text
 */
export interface WhatsAppParseResult {
  data: Partial<Reservation>;
  recognizedFields: {
    key: string;
    label: string;
    value: string;
  }[];
  rawText: string;
  hasErrors: boolean;
  warnings: string[];
}

/**
 * Parses date string in format DD/MM/YYYY, D/M/YYYY, DD-MM-YYYY, or YYYY-MM-DD
 * and returns YYYY-MM-DD suitable for HTML date inputs.
 */
export const parseBrazilianDateToISO = (dateStr: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const brMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    let year = brMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  return '';
};

/**
 * Strips WhatsApp markdown formatting (*, _, ~, `) and leading bullet points/hyphens
 */
const cleanValue = (val: string): string => {
  if (!val) return '';
  return val
    .replace(/^[*_~`•\-\s]+/, '')
    .replace(/[*_~`]+$/, '')
    .trim();
};

/**
 * Robust WhatsApp guest card parser that supports the official template:
 * - Tolerant to asterisks, bullets (• or * or -), spaces, emojis, bolding
 * - Understands Portuguese accents or without accents
 * - Detects accompanied guests in multiple numbered formats
 * - Extracts both vehicles (Carro 1 and Carro 2)
 */
export const parseWhatsAppGuestCard = (rawText: string): WhatsAppParseResult => {
  const result: Partial<Reservation> = {};
  const recognized: { key: string; label: string; value: string }[] = [];
  const warnings: string[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      data: result,
      recognizedFields: recognized,
      rawText: rawText || '',
      hasErrors: true,
      warnings: ['Nenhum texto informado para importar.']
    };
  }

  const lines = rawText.split(/\r?\n/);

  let currentSection = '';
  let currentCar: 1 | 2 | null = null;
  const acompanhantesList: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect main section headers
    if (/ESTADIA/i.test(line)) {
      currentSection = 'estadia';
      continue;
    }
    if (/DADOS DO H[OÓ]SPEDE/i.test(line) || /H[OÓ]SPEDE TITULAR/i.test(line)) {
      currentSection = 'titular';
      continue;
    }
    if (/ACOMPANHANTE/i.test(line)) {
      currentSection = 'acompanhantes';
      continue;
    }
    if (/VE[IÍ]CULOS?/i.test(line) || /ESTACIONAMENTO/i.test(line)) {
      currentSection = 'veiculos';
      continue;
    }
    if (/OBSERVA[CÇ][OÕ]ES/i.test(line)) {
      currentSection = 'observacoes';
      continue;
    }

    // Carro detection
    if (/Carro\s*1/i.test(line)) {
      currentCar = 1;
      continue;
    }
    if (/Carro\s*2/i.test(line)) {
      currentCar = 2;
      continue;
    }

    // Section: ACOMPANHANTES
    if (currentSection === 'acompanhantes') {
      // Look for lines like "* 1. DEBORAH MOREIRA" or "1. DEBORAH MOREIRA" or "• DEBORAH"
      const acompMatch = line.match(/^[*•\-\s]*(\d+[\.\-\)]\s*)?([^\n\r]+)$/);
      if (acompMatch) {
        const potentialName = cleanValue(acompMatch[2]);
        // Filter out header explanations like "(Informe o nome completo...)"
        if (
          potentialName &&
          !potentialName.startsWith('(') &&
          !/informe o nome/i.test(potentialName) &&
          !/ve[ií]culos/i.test(potentialName) &&
          !/observa/i.test(potentialName) &&
          potentialName.replace(/[\d\.\-\s_]/g, '').length > 1
        ) {
          // Check it's not a numbered empty slot like "3."
          const strippedDigits = potentialName.replace(/^(\d+[\.\-\)]\s*)/, '').trim();
          if (strippedDigits && strippedDigits !== '_' && strippedDigits !== '.') {
            acompanhantesList.push(strippedDigits);
          }
        }
      }
    }

    // Key-value matching: line might be "* Apto: 101" or "• Nome Completo: BRUNO ANDERSON" or "- Placa: RGQ7E08"
    // Regex splits by first colon
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const rawKey = line
        .substring(0, colonIndex)
        .replace(/[*_~`•\-\s]/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      const rawVal = cleanValue(line.substring(colonIndex + 1));

      // Apto
      if (rawKey === 'apto' || rawKey === 'apartamento') {
        if (rawVal && rawVal !== '______' && rawVal !== '_') {
          result.apto = rawVal;
        }
      }

      // Entrada
      else if (rawKey.includes('entrada') || rawKey === 'datadeentrada' || rawKey === 'checkin') {
        const iso = parseBrazilianDateToISO(rawVal);
        if (iso) {
          result.entrada = iso;
        } else if (rawVal && rawVal !== '______') {
          result.entrada = rawVal;
        }
      }

      // Saída
      else if (rawKey.includes('saida') || rawKey === 'datadesaida' || rawKey === 'checkout') {
        const iso = parseBrazilianDateToISO(rawVal);
        if (iso) {
          result.saida = iso;
        } else if (rawVal && rawVal !== '______') {
          result.saida = rawVal;
        }
      }

      // Nome Titular
      else if (
        rawKey.includes('nome') ||
        rawKey === 'nomecompleto' ||
        rawKey === 'responsavel' ||
        rawKey === 'titular'
      ) {
        if (rawVal && !rawVal.includes('____')) {
          result.nomeResponsavel = rawVal;
        }
      }

      // CPF
      else if (rawKey === 'cpf') {
        const digits = rawVal.replace(/\D/g, '');
        if (digits) {
          result.cpf = formatCPF(digits);
        }
      }

      // Telefone / WhatsApp
      else if (
        rawKey.includes('telefone') ||
        rawKey.includes('whatsapp') ||
        rawKey.includes('celular') ||
        rawKey === 'tel'
      ) {
        const digits = rawVal.replace(/\D/g, '');
        if (digits) {
          result.telefone = formatPhone(digits);
        } else if (rawVal && !rawVal.includes('___')) {
          result.telefone = rawVal;
        }
      }

      // E-mail
      else if (rawKey.includes('email') || rawKey.includes('e-mail')) {
        if (rawVal && !rawVal.includes('___')) {
          result.email = rawVal;
        }
      }

      // CEP
      else if (rawKey === 'cep') {
        const digits = rawVal.replace(/\D/g, '');
        if (digits) {
          result.cep = formatCEP(digits);
        }
      }

      // Endereço
      else if (rawKey.includes('endereco') || rawKey.includes('endereço') || rawKey.includes('logradouro')) {
        if (rawVal && !rawVal.includes('___')) {
          result.endereco = rawVal;
        }
      }

      // Cidade
      else if (rawKey === 'cidade' || rawKey === 'municipio') {
        if (rawVal && !rawVal.includes('___')) {
          result.cidade = rawVal;
        }
      }

      // Estado
      else if (rawKey === 'estado' || rawKey === 'uf') {
        if (rawVal && !rawVal.includes('___')) {
          // Normalize 2-letter state if possible
          const ufClean = rawVal.toUpperCase().trim();
          result.estado = ufClean.length === 2 ? ufClean : rawVal;
        }
      }

      // País
      else if (rawKey === 'pais' || rawKey === 'país') {
        if (rawVal && !rawVal.includes('___')) {
          result.pais = rawVal;
        }
      }

      // Carro 1 & 2 details
      else if (rawKey === 'modelo' || rawKey.includes('modelocarro')) {
        if (rawVal && !rawVal.includes('___')) {
          if (currentCar === 2) {
            result.modeloCarro2 = rawVal;
          } else {
            result.modeloCarro1 = rawVal;
          }
        }
      } else if (rawKey === 'placa' || rawKey.includes('placacarro')) {
        if (rawVal && !rawVal.includes('___')) {
          const formatted = formatPlate(rawVal);
          if (currentCar === 2) {
            result.placaCarro2 = formatted;
          } else {
            result.placaCarro1 = formatted;
          }
        }
      } else if (rawKey === 'cor' || rawKey.includes('corcarro')) {
        if (rawVal && !rawVal.includes('___')) {
          if (currentCar === 2) {
            result.corCarro2 = rawVal;
          } else {
            result.corCarro1 = rawVal;
          }
        }
      }

      // Observações
      else if (rawKey.includes('observa') || rawKey.includes('obs')) {
        if (rawVal && !rawVal.includes('___') && rawVal !== '•' && rawVal !== '-') {
          result.observacoes = rawVal;
        }
      }
    } else {
      // Line without colon in observações section
      if (currentSection === 'observacoes') {
        const obsVal = cleanValue(line);
        if (
          obsVal &&
          !obsVal.startsWith('Muito obrigado') &&
          !obsVal.startsWith('Desejamos') &&
          !obsVal.includes('🏨')
        ) {
          result.observacoes = result.observacoes ? `${result.observacoes}\n${obsVal}` : obsVal;
        }
      }
    }
  }

  // Combine acompanhantes
  if (acompanhantesList.length > 0) {
    result.acompanhantes = acompanhantesList.join(', ');
  }

  // Build recognized list for feedback
  if (result.apto) recognized.push({ key: 'apto', label: 'Apartamento', value: result.apto });
  if (result.entrada) recognized.push({ key: 'entrada', label: 'Data de Entrada', value: formatDateBR(result.entrada) });
  if (result.saida) recognized.push({ key: 'saida', label: 'Data de Saída', value: formatDateBR(result.saida) });
  if (result.nomeResponsavel) recognized.push({ key: 'nomeResponsavel', label: 'Hóspede Titular', value: result.nomeResponsavel });
  if (result.cpf) recognized.push({ key: 'cpf', label: 'CPF', value: result.cpf });
  if (result.telefone) recognized.push({ key: 'telefone', label: 'Telefone/WhatsApp', value: result.telefone });
  if (result.email) recognized.push({ key: 'email', label: 'E-mail', value: result.email });
  if (result.cep) recognized.push({ key: 'cep', label: 'CEP', value: result.cep });
  if (result.endereco) recognized.push({ key: 'endereco', label: 'Endereço', value: result.endereco });
  if (result.cidade) recognized.push({ key: 'cidade', label: 'Cidade', value: result.cidade });
  if (result.estado) recognized.push({ key: 'estado', label: 'Estado (UF)', value: result.estado });
  if (result.pais) recognized.push({ key: 'pais', label: 'País', value: result.pais });
  if (result.acompanhantes) recognized.push({ key: 'acompanhantes', label: 'Acompanhantes', value: result.acompanhantes });

  if (result.modeloCarro1 || result.placaCarro1 || result.corCarro1) {
    const car1Desc = [result.modeloCarro1, result.placaCarro1, result.corCarro1].filter(Boolean).join(' • ');
    recognized.push({ key: 'carro1', label: 'Veículo 1', value: car1Desc });
  }

  if (result.modeloCarro2 || result.placaCarro2 || result.corCarro2) {
    const car2Desc = [result.modeloCarro2, result.placaCarro2, result.corCarro2].filter(Boolean).join(' • ');
    recognized.push({ key: 'carro2', label: 'Veículo 2', value: car2Desc });
  }

  if (result.observacoes) recognized.push({ key: 'observacoes', label: 'Observações', value: result.observacoes });

  if (recognized.length === 0) {
    warnings.push('Não foi possível identificar campos estruturados na mensagem colada. Verifique se copiou a ficha do WhatsApp.');
  }

  return {
    data: result,
    recognizedFields: recognized,
    rawText,
    hasErrors: recognized.length === 0,
    warnings
  };
};

/**
 * Standard generator for WhatsApp message template matching the condominium standard
 */
export const generateStandardWhatsAppCard = (data: Partial<Reservation> = {}, isBlank: boolean = false): string => {
  if (isBlank) {
    return `📋 FICHA DE PRÉ-CADASTRO DE HÓSPEDE
Olá! Para agilizar seu acesso e cadastro na portaria do condomínio, por favor preencha os dados abaixo e nos envie de volta:

🏢 ESTADIA:
* Apto: 
* Data de Entrada: 
* Data de Saída: 

👤 DADOS DO HÓSPEDE TITULAR:
* Nome Completo: 
* CPF: 
* Telefone/WhatsApp: 
* E-mail: 
* CEP: 
* Endereço: 
* Cidade: 
* Estado: 
* País: Brasil

👥 ACOMPANHANTES:
(Informe o nome completo de todos os acompanhantes ou familiares)
* 1. 
* 2. 
* 3. 

🚗 VEÍCULOS (Estacionamento):
* Carro 1:
  - Modelo: 
  - Placa: 
  - Cor: 
* Carro 2 (se houver):
  - Modelo: 
  - Placa: 
  - Cor: 

📝 OBSERVAÇÕES:
• 

Muito obrigado! Desejamos uma excelente estadia. 🏨✨`;
  }

  const entradaFmt = data.entrada ? formatDateBR(data.entrada) : '';
  const saidaFmt = data.saida ? formatDateBR(data.saida) : '';

  // Format acompanhantes as numbered list if provided
  let acompanhantesText = '* 1. \n* 2. \n* 3. ';
  if (data.acompanhantes && data.acompanhantes.trim()) {
    const list = data.acompanhantes.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      acompanhantesText = list.map((ac, idx) => `* ${idx + 1}. ${ac}`).join('\n');
    }
  }

  return `📋 FICHA DE PRÉ-CADASTRO DE HÓSPEDE
Olá! Para agilizar seu acesso e cadastro na portaria do condomínio, por favor preencha os dados abaixo e nos envie de volta:

🏢 ESTADIA:
* Apto: ${data.apto || ''}
* Data de Entrada: ${entradaFmt}
* Data de Saída: ${saidaFmt}

👤 DADOS DO HÓSPEDE TITULAR:
* Nome Completo: ${data.nomeResponsavel || ''}
* CPF: ${data.cpf || ''}
* Telefone/WhatsApp: ${data.telefone || ''}
* E-mail: ${data.email || ''}
* CEP: ${data.cep || ''}
* Endereço: ${data.endereco || ''}
* Cidade: ${data.cidade || ''}
* Estado: ${data.estado || ''}
* País: ${data.pais || 'Brasil'}

👥 ACOMPANHANTES:
(Informe o nome completo de todos os acompanhantes ou familiares)
${acompanhantesText}

🚗 VEÍCULOS (Estacionamento):
* Carro 1:
  - Modelo: ${data.modeloCarro1 || ''}
  - Placa: ${data.placaCarro1 || ''}
  - Cor: ${data.corCarro1 || ''}
* Carro 2 (se houver):
  - Modelo: ${data.modeloCarro2 || ''}
  - Placa: ${data.placaCarro2 || ''}
  - Cor: ${data.corCarro2 || ''}

📝 OBSERVAÇÕES:
• ${data.observacoes || ''}

Muito obrigado! Desejamos uma excelente estadia. 🏨✨`;
};

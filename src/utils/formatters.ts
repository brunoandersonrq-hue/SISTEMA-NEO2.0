export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatPlate(value: string): string {
  // Mercosul or traditional: 7 characters alphanumeric, e.g. ABC-1234 or ABC1D23
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length > 3) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return clean;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(`${checkIn}T00:00:00`);
  const outDate = new Date(`${checkOut}T00:00:00`);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function isDateInRange(targetDate: string, startDate: string, endDate: string): boolean {
  if (!targetDate) return false;
  if (!startDate && !endDate) return true;
  if (startDate && targetDate < startDate) return false;
  if (endDate && targetDate > endDate) return false;
  return true;
}

export function isReservationOverlapping(
  resStart: string,
  resEnd: string,
  filterStart: string,
  filterEnd: string
): boolean {
  if (!filterStart && !filterEnd) return true;
  const rStart = resStart;
  const rEnd = resEnd;

  if (filterStart && filterEnd) {
    // Overlap condition: rStart <= filterEnd && rEnd >= filterStart
    return rStart <= filterEnd && rEnd >= filterStart;
  }
  if (filterStart) {
    return rEnd >= filterStart;
  }
  if (filterEnd) {
    return rStart <= filterEnd;
  }
  return true;
}

/**
 * Obtém a data atual no Horário Oficial de Brasília no formato YYYY-MM-DD
 */
export function getBrasiliaTodayDate(): string {
  const dt = getBrasiliaCurrentDateTime();
  return dt.split('T')[0];
}

/**
 * Obtém a data atual no Horário de Brasília formatada em pt-BR (DD/MM/YYYY)
 */
export function getBrasiliaTodayDateFormatted(): string {
  const today = getBrasiliaTodayDate();
  return formatDateBR(today);
}

/**
 * Obtém uma data futura relativa a hoje no formato YYYY-MM-DD
 */
export function getBrasiliaFutureDate(daysAhead: number): string {
  const todayStr = getBrasiliaTodayDate();
  const [y, m, d] = todayStr.split('-').map(Number);
  const future = new Date(y, m - 1, d + daysAhead);
  const year = future.getFullYear();
  const month = String(future.getMonth() + 1).padStart(2, '0');
  const day = String(future.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém a data e hora atual no Horário Oficial de Brasília (America/Sao_Paulo)
 * Formato compatível com <input type="datetime-local" />: "YYYY-MM-DDTHH:mm"
 */
export function getBrasiliaCurrentDateTime(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Formata data e hora para exibição em português com Horário de Brasília
 * Exemplo: "21/09/2026 às 14:30 (Horário de Brasília)" ou "21/09/2026 às 14:30"
 */
export function formatBrasiliaDateTime(dateTimeStr?: string, showTimezone = true): string {
  if (!dateTimeStr) return '-';
  const cleanStr = dateTimeStr.replace(' ', 'T');
  const [datePart, timePart] = cleanStr.split('T');
  if (!datePart) return dateTimeStr;
  const parts = datePart.split('-');
  const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : datePart;
  const timeFormatted = timePart ? timePart.slice(0, 5) : '';
  
  if (timeFormatted) {
    return `${dateFormatted} às ${timeFormatted}${showTimezone ? ' (Horário de Brasília)' : ''}`;
  }
  return dateFormatted;
}

/**
 * Obtém o relógio atual formatado no Horário de Brasília (HH:mm:ss)
 */
export function getBrasiliaCurrentTimeDisplay(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

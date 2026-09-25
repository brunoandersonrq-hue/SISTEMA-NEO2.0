import { Reservation, ReservationStatus } from '../types.ts';
import { formatDateBR, calculateNights, formatBrasiliaDateTime, getBrasiliaCurrentDateTime } from './formatters.ts';

export function buildPrintableHtml(
  reservations: Reservation[],
  statusFilter: ReservationStatus | 'todos',
  dateStart: string,
  dateEnd: string,
  searchTerm: string
): string {
  const currentDateTime = formatBrasiliaDateTime(getBrasiliaCurrentDateTime());

  const rowsHtml = reservations.map((res) => {
    const nights = calculateNights(res.entrada, res.saida);
    const statusColor =
      res.status === 'ativa'
        ? '#065f46; background: #d1fae5;'
        : res.status === 'confirmada'
        ? '#1e40af; background: #dbeafe;'
        : res.status === 'concluida'
        ? '#334155; background: #f1f5f9;'
        : '#9f1239; background: #ffe4e6;';

    const vehicles = [];
    if (res.placaCarro1 || res.modeloCarro1) {
      vehicles.push(
        `<div><strong>${res.placaCarro1 || 'S/ PLACA'}</strong> ${res.modeloCarro1 || ''} ${res.corCarro1 ? '(' + res.corCarro1 + ')' : ''}</div>`
      );
    }
    if (res.placaCarro2 || res.modeloCarro2) {
      vehicles.push(
        `<div><strong>${res.placaCarro2 || 'S/ PLACA'}</strong> ${res.modeloCarro2 || ''} ${res.corCarro2 ? '(' + res.corCarro2 + ')' : ''}</div>`
      );
    }
    const vehiclesHtml = vehicles.length > 0 ? vehicles.join('') : '<span style="color: #94a3b8; font-style: italic;">Nenhum</span>';

    return `
      <tr>
        <td style="white-space: nowrap;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: ${statusColor}">
            ${res.status.toUpperCase()}
          </span>
        </td>
        <td style="white-space: nowrap; font-weight: bold; font-size: 13px; color: #0f172a;">
          Apto ${res.apto}
        </td>
        <td>
          <div style="font-weight: bold; color: #0f172a;">${res.nomeResponsavel}</div>
          <div style="font-size: 11px; color: #64748b;">CPF: ${res.cpf || 'Não informado'} ${res.telefone ? '• Tel: ' + res.telefone : ''}</div>
          ${res.acompanhantes ? `<div style="font-size: 10px; color: #475569;">Acomp.: ${res.acompanhantes}</div>` : ''}
        </td>
        <td style="white-space: nowrap;">
          <div style="font-weight: 600; color: #0f172a;">${formatDateBR(res.entrada)} a ${formatDateBR(res.saida)}</div>
          <div style="font-size: 11px; color: #64748b;">${nights} ${nights === 1 ? 'diária' : 'diárias'}</div>
        </td>
        <td>${vehiclesHtml}</td>
        <td>
          <div style="font-size: 11px;"><strong style="color: #334155;">Atendente:</strong> ${res.recepcionista || '-'}</div>
          <div style="font-size: 11px;"><strong style="color: #334155;">Locador:</strong> ${res.locador || '-'}</div>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Reservas - Edifício NEO 2.0</title>
  <style>
    @page {
      size: landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #fff;
      color: #0f172a;
      padding: 20px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }
    .condo-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e3a8a;
    }
    .report-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 3px 0;
    }
    .report-sub {
      font-size: 11px;
      color: #475569;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .filters-bar {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 15px;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 11px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      vertical-align: top;
      font-size: 11px;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .footer-signatures {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid #cbd5e1;
      font-size: 11px;
      color: #475569;
    }
    .print-actions {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 10px;
      background: #0f172a;
      padding: 8px 14px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
    }
    .print-actions button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
    }
    .print-actions button:hover {
      background: #1d4ed8;
    }
    .print-actions button.secondary {
      background: #334155;
    }
    .print-actions button.secondary:hover {
      background: #475569;
    }
    @media print {
      .print-actions {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
    <button class="secondary" onclick="window.close()">Fechar</button>
  </div>

  <div class="header">
    <div>
      <div class="condo-title">Edifício NEO 2.0 • Recepção & Portaria</div>
      <div class="report-title">Relatório de Histórico de Reservas de Hóspedes</div>
      <div class="report-sub">Controle oficial de ocupação de apartamentos, veículos e locadores autorizados</div>
    </div>
    <div class="meta-box">
      <div><strong>Emissão:</strong> ${currentDateTime}</div>
      <div><strong>Total de Registros:</strong> ${reservations.length}</div>
    </div>
  </div>

  <div class="filters-bar">
    <div><strong>Status:</strong> ${statusFilter === 'todos' ? 'Todos os Status' : statusFilter.toUpperCase()}</div>
    <div><strong>Período:</strong> ${dateStart ? formatDateBR(dateStart) : 'Início livre'} até ${dateEnd ? formatDateBR(dateEnd) : 'Fim livre'}</div>
    ${searchTerm ? `<div><strong>Busca:</strong> "${searchTerm}"</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 80px;">Status</th>
        <th style="width: 70px;">Apto</th>
        <th>Hóspede (Responsável)</th>
        <th style="width: 140px;">Estadia</th>
        <th>Veículo(s)</th>
        <th>Atendente / Locador</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhuma reserva encontrada</td></tr>'}
    </tbody>
  </table>

  <div class="footer-signatures">
    <div>Visto Portaria / Recepção: __________________________________</div>
    <div>Visto Administração / Síndico: __________________________________</div>
  </div>

  <script>
    // Auto trigger print when page opens outside iframe
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.log(e);
        }
      }, 500);
    });
  </script>
</body>
</html>`;
}

export function openPrintWindow(
  reservations: Reservation[],
  statusFilter: ReservationStatus | 'todos',
  dateStart: string,
  dateEnd: string,
  searchTerm: string
): boolean {
  try {
    const htmlContent = buildPrintableHtml(reservations, statusFilter, dateStart, dateEnd, searchTerm);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Attempt window.open
    const printWin = window.open(url, '_blank');
    if (printWin) {
      printWin.focus();
      return true;
    }
  } catch (err) {
    console.error('Falha ao abrir janela de impressão:', err);
  }
  return false;
}

export function getPrintableBlobUrl(
  reservations: Reservation[],
  statusFilter: ReservationStatus | 'todos',
  dateStart: string,
  dateEnd: string,
  searchTerm: string
): string {
  const htmlContent = buildPrintableHtml(reservations, statusFilter, dateStart, dateEnd, searchTerm);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export function downloadPrintableHtml(
  reservations: Reservation[],
  statusFilter: ReservationStatus | 'todos',
  dateStart: string,
  dateEnd: string,
  searchTerm: string
): void {
  const htmlContent = buildPrintableHtml(reservations, statusFilter, dateStart, dateEnd, searchTerm);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-reservas-neo-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildVoucherHtml(reservation: Reservation): string {
  const currentDateTime = formatBrasiliaDateTime(getBrasiliaCurrentDateTime());
  const nights = calculateNights(reservation.entrada, reservation.saida);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ficha de Hóspede - Apto ${reservation.apto} - ${reservation.nomeResponsavel}</title>
  <style>
    @page { size: portrait; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #fff; color: #0f172a; padding: 25px; font-size: 13px; line-height: 1.5; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .condo { font-size: 12px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 20px; font-weight: 900; margin: 4px 0; }
    .apto-badge { font-size: 18px; font-weight: 900; background: #0f172a; color: #fff; padding: 6px 14px; border-radius: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .label { color: #64748b; font-size: 12px; }
    .val { font-weight: 600; color: #0f172a; }
    .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 11px; }
    .sig-line { border-top: 1px solid #475569; margin-top: 35px; text-align: center; padding-top: 5px; }
    .print-actions { position: fixed; top: 15px; right: 15px; display: flex; gap: 10px; background: #0f172a; padding: 8px 14px; border-radius: 8px; }
    .print-actions button { background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print { .print-actions { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  </div>
  <div class="header">
    <div>
      <div class="condo">Edifício NEO 2.0 • Recepção & Portaria</div>
      <div class="title">Ficha de Identificação de Hóspede e Veículos</div>
      <div style="font-size: 11px; color: #64748b;">Emissão: ${currentDateTime} • Status: ${reservation.status.toUpperCase()}</div>
    </div>
    <div class="apto-badge">APTO ${reservation.apto}</div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="box-title">Dados do Hóspede Titular</div>
      <div class="row"><span class="label">Nome:</span> <span class="val">${reservation.nomeResponsavel}</span></div>
      <div class="row"><span class="label">CPF:</span> <span class="val">${reservation.cpf || '-'}</span></div>
      <div class="row"><span class="label">Telefone:</span> <span class="val">${reservation.telefone || '-'}</span></div>
      <div class="row"><span class="label">E-mail:</span> <span class="val">${reservation.email || '-'}</span></div>
      <div class="row"><span class="label">Cidade/UF:</span> <span class="val">${reservation.cidade || '-'}/${reservation.estado || '-'}</span></div>
    </div>
    <div class="box">
      <div class="box-title">Período da Reserva</div>
      <div class="row"><span class="label">Entrada (Check-in):</span> <span class="val">${formatDateBR(reservation.entrada)}</span></div>
      <div class="row"><span class="label">Saída (Check-out):</span> <span class="val">${formatDateBR(reservation.saida)}</span></div>
      <div class="row"><span class="label">Duração:</span> <span class="val">${nights} diárias</span></div>
      <div class="row"><span class="label">Recepcionista:</span> <span class="val">${reservation.recepcionista || '-'}</span></div>
      <div class="row"><span class="label">Locador / Resp.:</span> <span class="val">${reservation.locador || '-'}</span></div>
    </div>
  </div>

  <div class="box" style="margin-bottom: 20px;">
    <div class="box-title">Veículos Autorizados</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div>
        <div style="font-size: 11px; color: #64748b;">Veículo 1:</div>
        <div style="font-weight: bold; font-size: 14px; font-family: monospace;">${reservation.placaCarro1 || 'NENHUM CADASTRADO'}</div>
        <div style="font-size: 12px; color: #334155;">${reservation.modeloCarro1 || ''} ${reservation.corCarro1 ? `(${reservation.corCarro1})` : ''}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #64748b;">Veículo 2:</div>
        <div style="font-weight: bold; font-size: 14px; font-family: monospace;">${reservation.placaCarro2 || 'NENHUM CADASTRADO'}</div>
        <div style="font-size: 12px; color: #334155;">${reservation.modeloCarro2 || ''} ${reservation.corCarro2 ? `(${reservation.corCarro2})` : ''}</div>
      </div>
    </div>
  </div>

  ${reservation.acompanhantes ? `
  <div class="box" style="margin-bottom: 20px;">
    <div class="box-title">Acompanhantes Cadastrados</div>
    <div style="font-size: 12px; color: #0f172a;">${reservation.acompanhantes}</div>
  </div>` : ''}

  <div class="signatures">
    <div>
      <div class="sig-line">Assinatura do Hóspede Responsável</div>
      <div style="font-size: 10px; text-align: center; color: #64748b; margin-top: 3px;">Declaro estar ciente e de acordo com as normas do condomínio</div>
    </div>
    <div>
      <div class="sig-line">Assinatura do Atendente da Recepção</div>
      <div style="font-size: 10px; text-align: center; color: #64748b; margin-top: 3px;">Documento conferido e acesso liberado</div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 500);
    });
  </script>
</body>
</html>`;
}

export function openVoucherPrintWindow(reservation: Reservation): boolean {
  try {
    const html = buildVoucherHtml(reservation);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) {
      w.focus();
      return true;
    }
  } catch (err) {
    console.error('Erro ao abrir impressão da ficha:', err);
  }
  return false;
}

export function downloadVoucherHtml(reservation: Reservation): void {
  const html = buildVoucherHtml(reservation);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ficha-apto-${reservation.apto}-${reservation.nomeResponsavel.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


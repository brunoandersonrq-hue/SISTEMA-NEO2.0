import { Reservation } from '../types.ts';
import { formatDateBR, calculateNights, formatBrasiliaDateTime } from './formatters.ts';

export function exportReservationsToCSV(reservations: Reservation[]) {
  const headers = [
    'APTO',
    'STATUS',
    'ENTRADA',
    'SAIDA',
    'CHECK_IN_HORARIO_BRASILIA',
    'CHECK_OUT_HORARIO_BRASILIA',
    'NOITES',
    'NOME_RESPONSAVEL',
    'EMAIL',
    'CPF',
    'TELEFONE',
    'ENDERECO',
    'CEP',
    'CIDADE',
    'ESTADO',
    'PAIS',
    'ACOMPANHANTES',
    'MODELO_CARRO_1',
    'PLACA_CARRO_1',
    'COR_CARRO_1',
    'MODELO_CARRO_2',
    'PLACA_CARRO_2',
    'COR_CARRO_2',
    'RECEPCIONISTA',
    'LOCADOR',
    'OBSERVACOES'
  ];

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reservations.map((res) => {
    const nights = calculateNights(res.entrada, res.saida);
    const statusMap: Record<string, string> = {
      confirmada: 'Confirmada',
      ativa: 'Ativa (Check-in)',
      concluida: 'Concluída (Check-out)',
      cancelada: 'Cancelada'
    };

    return [
      escapeCSV(res.apto),
      escapeCSV(statusMap[res.status] || res.status),
      escapeCSV(formatDateBR(res.entrada)),
      escapeCSV(formatDateBR(res.saida)),
      escapeCSV(res.dataHoraCheckIn ? formatBrasiliaDateTime(res.dataHoraCheckIn, true) : 'Pendente'),
      escapeCSV(res.dataHoraCheckOut ? formatBrasiliaDateTime(res.dataHoraCheckOut, true) : 'Pendente'),
      escapeCSV(nights),
      escapeCSV(res.nomeResponsavel),
      escapeCSV(res.email),
      escapeCSV(res.cpf),
      escapeCSV(res.telefone),
      escapeCSV(res.endereco),
      escapeCSV(res.cep),
      escapeCSV(res.cidade),
      escapeCSV(res.estado),
      escapeCSV(res.pais),
      escapeCSV(res.acompanhantes),
      escapeCSV(res.modeloCarro1),
      escapeCSV(res.placaCarro1),
      escapeCSV(res.corCarro1),
      escapeCSV(res.modeloCarro2),
      escapeCSV(res.placaCarro2),
      escapeCSV(res.corCarro2),
      escapeCSV(res.recepcionista),
      escapeCSV(res.locador),
      escapeCSV(res.observacoes || '')
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel displays accents (ã, é, ç) correctly in Brazilian Portuguese
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Historico_Reservas_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Also exports as styled Excel XML Spreadsheet (.xls)
 * which opens natively in Microsoft Excel with formatted headers, colors, and columns.
 */
export function exportReservationsToExcelXML(reservations: Reservation[]) {
  const statusMap: Record<string, string> = {
    confirmada: 'Confirmada',
    ativa: 'Ativa (Check-in)',
    concluida: 'Concluída (Check-out)',
    cancelada: 'Cancelada'
  };

  const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
  </Style>
  <Style ss:ID="DefaultRow">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="AptoCell">
   <Font ss:Bold="1" ss:Color="#1E3A8A"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="StatusAtiva">
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Font ss:Bold="1" ss:Color="#065F46"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="StatusConfirmada">
   <Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/>
   <Font ss:Bold="1" ss:Color="#1E40AF"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="StatusConcluida">
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Font ss:Bold="1" ss:Color="#334155"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="StatusCancelada">
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Font ss:Bold="1" ss:Color="#991B1B"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Histórico de Reservas">
  <Table>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="85"/>
   <Column ss:Width="85"/>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Column ss:Width="60"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="200"/>
   <Column ss:Width="80"/>
   <Column ss:Width="120"/>
   <Column ss:Width="60"/>
   <Column ss:Width="90"/>
   <Column ss:Width="180"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="130"/>
   <Column ss:Width="150"/>
   <Column ss:Width="200"/>
   <Row ss:StyleID="Header" ss:Height="25">
    <Cell><Data ss:Type="String">APTO</Data></Cell>
    <Cell><Data ss:Type="String">STATUS</Data></Cell>
    <Cell><Data ss:Type="String">ENTRADA</Data></Cell>
    <Cell><Data ss:Type="String">SAÍDA</Data></Cell>
    <Cell><Data ss:Type="String">CHECK-IN (HORÁRIO DE BRASÍLIA)</Data></Cell>
    <Cell><Data ss:Type="String">CHECK-OUT (HORÁRIO DE BRASÍLIA)</Data></Cell>
    <Cell><Data ss:Type="String">DIÁRIAS</Data></Cell>
    <Cell><Data ss:Type="String">NOME RESPONSÁVEL</Data></Cell>
    <Cell><Data ss:Type="String">EMAIL</Data></Cell>
    <Cell><Data ss:Type="String">CPF</Data></Cell>
    <Cell><Data ss:Type="String">TELEFONE</Data></Cell>
    <Cell><Data ss:Type="String">ENDEREÇO</Data></Cell>
    <Cell><Data ss:Type="String">CEP</Data></Cell>
    <Cell><Data ss:Type="String">CIDADE</Data></Cell>
    <Cell><Data ss:Type="String">ESTADO</Data></Cell>
    <Cell><Data ss:Type="String">PAÍS</Data></Cell>
    <Cell><Data ss:Type="String">ACOMPANHANTES</Data></Cell>
    <Cell><Data ss:Type="String">MODELO CARRO 1</Data></Cell>
    <Cell><Data ss:Type="String">PLACA CARRO 1</Data></Cell>
    <Cell><Data ss:Type="String">COR CARRO 1</Data></Cell>
    <Cell><Data ss:Type="String">MODELO CARRO 2</Data></Cell>
    <Cell><Data ss:Type="String">PLACA CARRO 2</Data></Cell>
    <Cell><Data ss:Type="String">COR CARRO 2</Data></Cell>
    <Cell><Data ss:Type="String">RECEPCIONISTA</Data></Cell>
    <Cell><Data ss:Type="String">LOCADOR</Data></Cell>
    <Cell><Data ss:Type="String">OBSERVAÇÕES</Data></Cell>
   </Row>`;

  const xmlRows = reservations.map((res) => {
    const nights = calculateNights(res.entrada, res.saida);
    let statusStyle = 'DefaultRow';
    if (res.status === 'ativa') statusStyle = 'StatusAtiva';
    else if (res.status === 'confirmada') statusStyle = 'StatusConfirmada';
    else if (res.status === 'concluida') statusStyle = 'StatusConcluida';
    else if (res.status === 'cancelada') statusStyle = 'StatusCancelada';

    const escapeXml = (unsafe: string | number | undefined | null) => {
      if (unsafe === undefined || unsafe === null) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    return `   <Row ss:Height="20">
    <Cell ss:StyleID="AptoCell"><Data ss:Type="String">${escapeXml(res.apto)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(statusMap[res.status] || res.status)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(formatDateBR(res.entrada))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(formatDateBR(res.saida))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.dataHoraCheckIn ? formatBrasiliaDateTime(res.dataHoraCheckIn, true) : 'Pendente')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.dataHoraCheckOut ? formatBrasiliaDateTime(res.dataHoraCheckOut, true) : 'Pendente')}</Data></Cell>
    <Cell><Data ss:Type="Number">${nights}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.nomeResponsavel)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.email)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.cpf)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.telefone)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.endereco)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.cep)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.cidade)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.estado)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.pais)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.acompanhantes)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.modeloCarro1)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.placaCarro1)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.corCarro1)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.modeloCarro2)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.placaCarro2)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.corCarro2)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.recepcionista)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.locador)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(res.observacoes || '')}</Data></Cell>
   </Row>`;
  }).join('\n');

  const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

  const fullXml = `${xmlHeader}\n${xmlRows}\n${xmlFooter}`;
  const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Historico_Reservas_${todayStr}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

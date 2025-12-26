
export function generateReportHtml(
  data: {
    revenue: any;
    occupancy: any;
    overdue: any;
    customers: any;
    units: any;
    fromDate?: string;
    toDate?: string;
  },
  t: (key: string, options?: any) => string,
  formatCurrency: (val: number | undefined) => string
): string {
  const isRTL = true; // Assuming Arabic as primary

  return `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${t('reports.title')}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #2c3e50; }
    .header p { margin: 5px 0; color: #666; }
    
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #2c3e50; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { border: 1px solid #ddd; padding: 15px; border-radius: 4px; text-align: center; }
    .kpi-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
    .kpi-value { font-size: 20px; font-weight: bold; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 11px; }
    td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
    tr:nth-child(even) { background-color: #fafafa; }
    
    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; }
    
    @page { margin: 1cm; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
      tr { page-break-inside: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${t('reports.title')}</h1>
    <p>${t('reports.subtitle')}</p>
    ${data.fromDate || data.toDate ? `<p>${data.fromDate || '-'} &harr; ${data.toDate || '-'}</p>` : ''}
  </div>

  <div class="section">
    <div class="section-title">${t('reports.summary')}</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">${t('reports.totalInvoiced')}</div>
        <div class="kpi-value">${formatCurrency(data.revenue?.totalInvoiced)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">${t('reports.totalPaid')}</div>
        <div class="kpi-value">${formatCurrency(data.revenue?.totalPaid)}</div>
      </div>
      <div class="kpi-card">
         <div class="kpi-label">${t('reports.occupancyRate')}</div>
         <div class="kpi-value">${(data.occupancy?.occupancyRate || 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">${t('reports.customers')}</div>
    <table>
      <thead>
        <tr>
          <th>${t('reports.customer')}</th>
          <th>${t('reports.totalBilled')}</th>
          <th>${t('reports.totalPaid')}</th>
          <th>${t('reports.balance')}</th>
          <th>${t('reports.invoices')}</th>
        </tr>
      </thead>
      <tbody>
        ${data.customers?.map((c: any) => `
          <tr>
            <td>${c.name}</td>
            <td>${formatCurrency(c.totalInvoiced)}</td>
            <td>${formatCurrency(c.totalPaid)}</td>
            <td style="font-weight: bold; color: ${c.balance > 0 ? '#c0392b' : 'inherit'}">${formatCurrency(c.balance)}</td>
            <td>${c.invoiceCount}</td>
          </tr>
        `).join('') || `<tr><td colspan="5">${t('common.noData')}</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">${t('reports.units')}</div>
    <table>
      <thead>
        <tr>
          <th>${t('reports.unit')}</th>
          <th>${t('reports.totalBilled')}</th>
          <th>${t('reports.totalPaid')}</th>
          <th>${t('reports.balance')}</th>
          <th>${t('reports.invoices')}</th>
        </tr>
      </thead>
      <tbody>
        ${data.units?.map((u: any) => `
          <tr>
            <td>${u.unitNumber}</td>
            <td>${formatCurrency(u.totalInvoiced)}</td>
            <td>${formatCurrency(u.totalPaid)}</td>
            <td style="font-weight: bold; color: ${u.balance > 0 ? '#c0392b' : 'inherit'}">${formatCurrency(u.balance)}</td>
            <td>${u.invoiceCount}</td>
          </tr>
        `).join('') || `<tr><td colspan="5">${t('common.noData')}</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">${t('reports.monthlyBreakdown')}</div>
    <table>
      <thead>
        <tr>
          <th>${t('reports.month')}</th>
          <th>${t('reports.invoiced')}</th>
          <th>${t('reports.paid')}</th>
        </tr>
      </thead>
      <tbody>
        ${data.revenue?.monthly?.map((m: any) => `
          <tr>
            <td>${m.year}-${String(m.month).padStart(2, '0')}</td>
            <td>${formatCurrency(m.invoiced)}</td>
            <td>${formatCurrency(m.paid)}</td>
          </tr>
        `).join('') || `<tr><td colspan="3">${t('common.noData')}</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">${t('reports.occupancyByBuilding')}</div>
    <table>
      <thead>
        <tr>
          <th>${t('reports.building')}</th>
          <th>${t('reports.units')}</th>
          <th>${t('reports.occupied')}</th>
          <th>${t('reports.occupancyRate')}</th>
        </tr>
      </thead>
      <tbody>
        ${data.occupancy?.perBuilding?.map((b: any) => `
          <tr>
            <td>${b.buildingName}</td>
            <td>${b.totalUnits}</td>
            <td>${b.occupiedUnits}</td>
            <td>${(b.occupancyRate || 0).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}</td>
          </tr>
        `).join('') || `<tr><td colspan="4">${t('common.noData')}</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="footer">
    ${new Date().toLocaleString()} - AQARAT
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

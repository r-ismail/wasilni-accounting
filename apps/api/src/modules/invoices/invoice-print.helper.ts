export interface InvoicePrintData {
  invoice: {
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    status: string;
    totalAmount: number;
    paidAmount: number;
    periodStart: Date;
    periodEnd: Date;
  };
  company: {
    name: string;
    currency: string;
    defaultLanguage: string;
    logo?: string;
  };
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  unit: {
    unitNumber: string;
    buildingName?: string;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export function generateInvoiceHtml(data: InvoicePrintData): string {
  const isRTL = data.company.defaultLanguage === 'ar';
  const currencySymbol = getCurrencySymbol(data.company.currency);

  return `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isRTL ? 'فاتورة' : 'Invoice'} ${data.invoice.invoiceNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif" : 'Arial, sans-serif'};
      padding: 40px;
      color: #212121;
      font-size: 14px;
      line-height: 1.6;
      background: #f5f5f5;
    }
    
    .invoice-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1976d2;
    }
    
    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #1976d2;
    }
    
    .invoice-title {
      font-size: 32px;
      font-weight: 700;
      color: #1976d2;
    }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }
    
    .info-box {
      flex: 1;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .info-header {
      font-size: 16px;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .info-item {
      margin: 10px 0;
      line-height: 1.8;
    }
    
    .info-item strong {
      font-weight: 600;
      color: #424242;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background: white;
    }
    
    thead {
      background: #1976d2;
      color: white;
    }
    
    th {
      padding: 15px 12px;
      text-align: ${isRTL ? 'right' : 'left'};
      font-weight: 600;
      font-size: 14px;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    tbody tr:hover {
      background: #f8f9fa;
    }
    
    .text-right { 
      text-align: right; 
    }
    
    .text-center { 
      text-align: center; 
    }
    
    .totals {
      margin-${isRTL ? 'right' : 'left'}: auto;
      width: 350px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 15px;
    }
    
    .total-row.main {
      font-weight: 700;
      font-size: 18px;
      border-top: 2px solid #424242;
      padding-top: 15px;
      margin-top: 10px;
      color: #1976d2;
    }
    
    .total-row.balance {
      color: #d32f2f;
      font-weight: 700;
      font-size: 16px;
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #757575;
      font-size: 14px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      ${isRTL ? 'left' : 'right'}: 20px;
      background: #1976d2;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: inherit;
    }
    
    .print-button:hover {
      background: #1565c0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
      
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">
    ${isRTL ? '🖨️ طباعة' : '🖨️ Print'}
  </button>
  
  <div class="invoice-container">
    <div class="header">
      ${data.company.logo ? `<img src="${data.company.logo}" alt="Logo" style="max-height: 80px; max-width: 200px; object-fit: contain;">` : `<div class="company-name">${data.company.name}</div>`}
      <div class="invoice-title">${isRTL ? 'فاتورة' : 'INVOICE'}</div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <div class="info-header">${isRTL ? 'معلومات الفاتورة' : 'Invoice Information'}</div>
        <div class="info-item"><strong>${isRTL ? 'رقم الفاتورة' : 'Invoice Number'}:</strong> ${data.invoice.invoiceNumber}</div>
        <div class="info-item"><strong>${isRTL ? 'تاريخ الإصدار' : 'Issue Date'}:</strong> ${formatDate(data.invoice.issueDate)}</div>
        <div class="info-item"><strong>${isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}:</strong> ${formatDate(data.invoice.dueDate)}</div>
        <div class="info-item"><strong>${isRTL ? 'الفترة' : 'Period'}:</strong> ${formatDate(data.invoice.periodStart)} - ${formatDate(data.invoice.periodEnd)}</div>
      </div>
      <div class="info-box">
        <div class="info-header">${isRTL ? 'معلومات العميل' : 'Customer Information'}</div>
        <div class="info-item"><strong>${isRTL ? 'الاسم' : 'Name'}:</strong> ${data.customer.name}</div>
        ${data.customer.phone ? `<div class="info-item"><strong>${isRTL ? 'الهاتف' : 'Phone'}:</strong> ${data.customer.phone}</div>` : ''}
        ${data.customer.email ? `<div class="info-item"><strong>${isRTL ? 'البريد' : 'Email'}:</strong> ${data.customer.email}</div>` : ''}
        <div class="info-item"><strong>${isRTL ? 'الوحدة' : 'Unit'}:</strong> ${data.unit.unitNumber}${data.unit.buildingName ? ` - ${data.unit.buildingName}` : ''}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>${isRTL ? 'الوصف' : 'Description'}</th>
          <th class="text-center">${isRTL ? 'الكمية' : 'Quantity'}</th>
          <th class="text-right">${isRTL ? 'السعر' : 'Unit Price'}</th>
          <th class="text-right">${isRTL ? 'المبلغ' : 'Amount'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.lines.map(line => `
          <tr>
            <td>${line.description}</td>
            <td class="text-center">${line.quantity}</td>
            <td class="text-right">${formatNumber(line.unitPrice)} ${currencySymbol}</td>
            <td class="text-right">${formatNumber(line.amount)} ${currencySymbol}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row main">
        <span>${isRTL ? 'الإجمالي' : 'Total'}:</span>
        <span>${formatNumber(data.invoice.totalAmount)} ${currencySymbol}</span>
      </div>
      <div class="total-row">
        <span>${isRTL ? 'المدفوع' : 'Paid'}:</span>
        <span>${formatNumber(data.invoice.paidAmount)} ${currencySymbol}</span>
      </div>
      <div class="total-row balance">
        <span>${isRTL ? 'المتبقي' : 'Balance'}:</span>
        <span>${formatNumber(data.invoice.totalAmount - data.invoice.paidAmount)} ${currencySymbol}</span>
      </div>
    </div>

    <div class="footer">
      ${isRTL ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}
    </div>
  </div>
</body>
</html>
  `;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
    AED: 'د.إ',
    KWD: 'د.ك',
    QAR: 'ر.ق',
    BHD: 'د.ب',
    YER: 'ر.ي',
  };
  return symbols[currency] || currency;
}

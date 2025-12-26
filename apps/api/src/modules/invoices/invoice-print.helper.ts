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
    phone?: string;
    address?: string;
    taxNumber?: string;
    // Display settings
    showInvoiceHeader?: boolean;
    showInvoiceFooter?: boolean;
    showCustomerDetails?: boolean;
    showUnitDetails?: boolean;
    showContractDetails?: boolean;
    showPaymentTerms?: boolean;
    showTaxBreakdown?: boolean;
    // Tax & Discount
    defaultTaxRate?: number;
    enableDiscount?: boolean;
    defaultDiscountPercent?: number;
    // Custom text
    invoiceHeaderText?: string;
    invoiceFooterText?: string;
    invoiceNotes?: string;
    paymentInstructions?: string;
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
  contract?: {
    startDate: Date;
    endDate: Date;
    rentType: string;
  };
  subtotal?: number;
  discount?: number;
  discountPercent?: number;
  taxAmount?: number;
  taxRate?: number;
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
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: #2c3e50;
      --accent-color: #3498db;
      --text-color: #333333;
      --text-light: #666666;
      --border-color: #e0e0e0;
      --bg-color: #f8f9fa;
    }

    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: ${isRTL ? "'Cairo', sans-serif" : "'Inter', 'Helvetica Neue', Arial, sans-serif"};
      background-color: #525659; /* Dark background for viewer context */
      color: var(--text-color);
      font-size: 14px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-container {
      max-width: 210mm; /* A4 width */
      min-height: 297mm; /* A4 height */
      margin: 40px auto;
      background: white;
      padding: 40px 50px;
      position: relative;
      box-shadow: 0 0 20px rgba(0,0,0,0.15);
    }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 50px;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 20px;
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-width: 50%;
    }

    .company-logo-img {
      max-height: 80px;
      max-width: 200px;
      object-fit: contain;
    }

    .company-name-text {
      font-size: 24px;
      font-weight: 800;
      color: var(--primary-color);
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }

    .invoice-meta {
      text-align: ${isRTL ? 'left' : 'right'};
    }

    .invoice-title {
      font-size: 42px;
      font-weight: 900;
      color: var(--border-color);
      text-transform: uppercase;
      line-height: 1;
      margin-bottom: 15px;
      letter-spacing: 2px;
    }

    .meta-grid {
      display: grid;
      gap: 8px;
    }

    .meta-item {
      display: flex;
      justify-content: ${isRTL ? 'flex-start' : 'flex-end'};
      gap: 15px;
    }

    .meta-label {
      font-weight: 600;
      color: var(--text-light);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-weight: 700;
      color: var(--primary-color);
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 50px;
    }

    .info-box h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: var(--text-light);
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }

    .info-content {
      font-size: 14px;
    }

    .info-row {
      margin-bottom: 5px;
    }

    .info-row strong {
      color: var(--primary-color);
      font-weight: 600;
    }

    /* Table Section */
    .table-container {
      margin-bottom: 40px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead th {
      background-color: var(--primary-color);
      color: white;
      padding: 12px 15px;
      text-align: ${isRTL ? 'right' : 'left'};
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    tbody td {
      padding: 15px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-color);
    }

    tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: ${isRTL ? 'left' : 'right'}; }
    
    /* Totals Section */
    .totals-container {
      display: flex;
      justify-content: ${isRTL ? 'flex-start' : 'flex-end'};
      margin-bottom: 40px;
    }

    .totals-box {
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-row.main-total {
      background-color: var(--primary-color);
      color: white;
      padding: 12px 15px;
      margin-top: 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 16px;
    }

    /* Footer Section */
    .footer {
      position: absolute;
      bottom: 40px;
      left: 50px;
      right: 50px;
      text-align: center;
      color: var(--text-light);
      font-size: 12px;
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
    }

    .notes-section {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      border-${isRTL ? 'right' : 'left'}: 4px solid var(--accent-color);
      margin-top: 20px;
      margin-bottom: 60px; /* Space for footer */
      font-size: 13px;
    }

    .print-btn {
      position: fixed;
      top: 30px;
      ${isRTL ? 'left' : 'right'}: 30px;
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 50px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 100;
    }

    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    
    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body {
        background: white;
        margin: 0;
        padding: 0;
        width: 210mm;
        height: 297mm;
      }
      .invoice-container {
        box-shadow: none;
        margin: 0;
        padding: 20px 40px !important;
        max-width: 210mm;
        min-height: 0;
        width: 100%;
        height: auto;
      }
      .print-btn {
        display: none;
      }
      
      /* Scale content down slightly if needed to prevent spillover */
      .header { margin-bottom: 30px; }
      .info-grid { margin-bottom: 30px; }
      .table-container { margin-bottom: 20px; }
      .notes-section { margin-bottom: 30px; padding: 15px; }
      .footer { position: static; margin-top: 30px; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    ${isRTL ? 'طباعة الفاتورة' : 'Print Invoice'}
  </button>
  
  <div class="invoice-container">
    <div class="header">
      <div class="brand-section">
        ${data.company.logo ? `<img src="${data.company.logo}" class="company-logo-img" alt="Logo">` : ''}
        <div class="company-name-text" style="${data.company.logo ? 'font-size: 18px; margin-top: 5px;' : ''}">${data.company.name}</div>
        
        <div style="margin-top: 10px; font-size: 12px; color: var(--text-light); line-height: 1.6;">
          ${data.company.taxNumber ? `<div style="margin-bottom: 4px;"><strong>${isRTL ? 'الرقم الضريبي' : 'Tax ID'}:</strong> ${data.company.taxNumber}</div>` : ''}
          ${data.company.address ? `<div style="margin-bottom: 2px;">${data.company.address}</div>` : ''}
          ${data.company.phone ? `<div>${data.company.phone}</div>` : ''}
          ${data.company.invoiceHeaderText ? `<div style="margin-top: 8px;">${data.company.invoiceHeaderText}</div>` : ''}
        </div>
      </div>

      <div class="invoice-meta">
        <div class="invoice-title" style="color: var(--primary-color);">${isRTL ? 'فاتورة إيجار' : 'RENTAL INVOICE'}</div>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label"># ${isRTL ? 'رقم الفاتورة' : 'Invoice No'}</span>
            <span class="meta-value">${data.invoice.invoiceNumber}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">📅 ${isRTL ? 'تاريخ الإصدار' : 'Issue Date'}</span>
            <span class="meta-value">${formatDate(data.invoice.issueDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">⚠️ ${isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
            <span class="meta-value">${formatDate(data.invoice.dueDate)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">📊 ${isRTL ? 'الحالة' : 'Status'}</span>
            <span class="meta-value" style="text-transform: capitalize;">${data.invoice.status}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="info-grid">
      ${data.company.showCustomerDetails !== false ? `
      <div class="info-box">
        <h3>${isRTL ? 'معلومات العميل ' : 'Bill To'}</h3>
        <div class="info-content">
          <div class="info-row"><strong style="font-size: 18px; color: var(--primary-color);">${data.customer.name}</strong></div>
          ${data.customer.phone ? `<div class="info-row">${data.customer.phone}</div>` : ''}
          ${data.customer.email ? `<div class="info-row">${data.customer.email}</div>` : ''}
        </div>
      </div>` : '<div></div>'}

      <div class="info-box">
        <h3>${isRTL ? 'تفاصيل المرفق' : 'Property Details'}</h3>
        <div class="info-content">
          ${data.company.showUnitDetails !== false ? `
            <div class="info-row">
              <span style="color: var(--text-light);">${isRTL ? 'الوحدة' : 'Unit'}:</span>
              <strong>${data.unit.unitNumber}</strong>
            </div>
            ${data.unit.buildingName ? `
            <div class="info-row">
              <span style="color: var(--text-light);">${isRTL ? 'المبنى' : 'Building'}:</span>
              <strong>${data.unit.buildingName}</strong>
            </div>` : ''}
          ` : ''}
          <div class="info-row" style="margin-top: 8px;">
            <span style="color: var(--text-light);">${isRTL ? 'الفترة' : 'Period'}:</span><br>
            <span>${formatDate(data.invoice.periodStart)} — ${formatDate(data.invoice.periodEnd)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>${isRTL ? 'الوصف' : 'Description'}</th>
            <th class="text-center" width="100">${isRTL ? 'الكمية' : 'Qty'}</th>
            <th class="text-right" width="150">${isRTL ? 'السعر' : 'Price'}</th>
            <th class="text-right" width="150">${isRTL ? 'المبلغ' : 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          ${data.lines.map(line => `
            <tr>
              <td><strong>${line.description}</strong></td>
              <td class="text-center">${line.quantity}</td>
              <td class="text-right">${formatNumber(line.unitPrice)}</td>
              <td class="text-right">${formatNumber(line.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="totals-container">
      <div class="totals-box">
        ${data.subtotal ? `
        <div class="total-row">
          <span>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span>${formatNumber(data.subtotal)} ${currencySymbol}</span>
        </div>` : ''}
        
        ${data.discount && data.discount > 0 ? `
        <div class="total-row" style="color: #27ae60;">
          <span>${isRTL ? 'خصم' : 'Discount'} ${data.discountPercent ? `(${data.discountPercent}%)` : ''}</span>
          <span>- ${formatNumber(data.discount)} ${currencySymbol}</span>
        </div>` : ''}
        
        ${data.taxAmount && data.taxAmount > 0 && data.company.showTaxBreakdown !== false ? `
        <div class="total-row">
          <span>${isRTL ? 'الضريبة' : 'Tax'} ${data.taxRate ? `(${data.taxRate}%)` : ''}</span>
          <span>+ ${formatNumber(data.taxAmount)} ${currencySymbol}</span>
        </div>` : ''}
        
        <div class="total-row main-total">
          <span>${isRTL ? 'الإجمالي' : 'Total'}</span>
          <span>${formatNumber(data.invoice.totalAmount)} ${currencySymbol}</span>
        </div>

        <div class="total-row" style="margin-top: 10px; border: none; font-size: 13px;">
          <span>${isRTL ? 'المدفوع' : 'Amount Paid'}</span>
          <span>${formatNumber(data.invoice.paidAmount)} ${currencySymbol}</span>
        </div>
        
        <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 8px; font-weight: 700; color: #c0392b;">
          <span>${isRTL ? 'المتبقي' : 'Balance Due'}</span>
          <span>${formatNumber(data.invoice.totalAmount - data.invoice.paidAmount)} ${currencySymbol}</span>
        </div>
      </div>
    </div>

    ${data.company.invoiceNotes || data.company.paymentInstructions ? `
    <div class="notes-section">
      ${data.company.invoiceNotes ? `
        <div style="margin-bottom: 12px;">
          <strong style="color: var(--primary-color); display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 11px;">${isRTL ? 'ملاحظات' : 'Notes'}</strong>
          <div style="color: var(--text-light);">${data.company.invoiceNotes}</div>
        </div>` : ''}
      
      ${data.company.paymentInstructions ? `
        <div>
          <strong style="color: var(--primary-color); display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 11px;">${isRTL ? 'تعليمات الدفع' : 'Payment Instructions'}</strong>
          <div style="color: var(--text-light); white-space: pre-line;">${data.company.paymentInstructions}</div>
        </div>` : ''}
    </div>` : ''}

    ${data.company.showInvoiceFooter !== false ? `
    <div class="footer">
      ${data.company.invoiceFooterText || (isRTL ? 'شكراً لتعاملكم معنا' : 'Thank you for your business')}
    </div>` : ''}
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

// Lazy load puppeteer to avoid bootstrap issues on Vercel

export interface InvoicePdfData {
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
    invoiceHeaderText?: string;
    invoiceFooterText?: string;
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

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const isRTL = data.company.defaultLanguage === 'ar';
  const currencySymbol = getCurrencySymbol(data.company.currency);

  const html = `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif" : 'Arial, sans-serif'};
      padding: 40px;
      color: #212121;
      font-size: 14px;
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
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }
    .company-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 260px;
    }
    .company-contact {
      font-size: 12px;
      color: #616161;
      line-height: 1.4;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: bold;
      color: #1976d2;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-box {
      width: 48%;
    }
    .info-header {
      font-size: 14px;
      font-weight: bold;
      color: #424242;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0e0e0;
    }
    .info-item {
      margin: 8px 0;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #f0f0f0;
      padding: 12px;
      text-align: ${isRTL ? 'right' : 'left'};
      font-weight: bold;
      border-bottom: 2px solid #1976d2;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals {
      margin-${isRTL ? 'right' : 'left'}: auto;
      width: 300px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.main {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #424242;
      padding-top: 12px;
    }
    .total-row.balance {
      color: #d32f2f;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #757575;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-block">
      <div class="company-name">${data.company.name}</div>
      ${data.company.phone ? `<div class="company-contact">${isRTL ? 'الهاتف' : 'Phone'}: ${data.company.phone}</div>` : ''}
      ${data.company.address ? `<div class="company-contact">${isRTL ? 'العنوان' : 'Address'}: ${data.company.address}</div>` : ''}
      ${data.company.invoiceHeaderText ? `<div class="company-contact">${data.company.invoiceHeaderText}</div>` : ''}
    </div>
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
    ${data.company.invoiceFooterText || (isRTL ? 'شكراً لتعاملكم معنا' : 'Thank you for your business')}
  </div>
</body>
</html>
  `;

  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch (err) {
    console.error('Puppeteer load error:', err);
    throw new Error('PDF generation (Puppeteer) is not available in this environment. Vercel requires @sparticuz/chromium for this feature.');
  }

  const browser = await (puppeteer as any).launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB');
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
  };
  return symbols[currency] || currency;
}

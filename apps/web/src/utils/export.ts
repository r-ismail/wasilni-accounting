
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportMultipleSheets = (sheets: { name: string; data: any[] }[], fileName: string) => {
    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
        // Truncate sheet name to 31 chars (Excel limit) or handle duplicates if necessary
        // For now assuming safe names
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

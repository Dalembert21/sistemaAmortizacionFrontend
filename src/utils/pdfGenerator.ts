import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AmortizationRow } from './amortization';

export const generatePDF = (table: AmortizationRow[], institutionName: string, clientName: string, systemName: string, logoBase64: string | null = null) => {
  const doc = new jsPDF() as any;
  const currentDateTime = new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });

  // Si hay logo lo incrustamos a la izquierda superior
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30, undefined, 'FAST');
      
      doc.setFontSize(24);
      doc.setTextColor(230, 98, 31); // Primary color (Naranja)
      doc.text(institutionName, 50, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${currentDateTime}`, 50, 32);
    } catch(e) {
      doc.setFontSize(24);
      doc.setTextColor(230, 98, 31);
      doc.text(institutionName, 14, 25);
      doc.setFontSize(10);
      doc.text(`Generado: ${currentDateTime}`, 14, 32);
    }
  } else {
    // Sin Logo
    doc.setFontSize(24);
    doc.setTextColor(230, 98, 31);
    doc.text(institutionName, 14, 25);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${currentDateTime}`, 14, 32);
  }

  // Separator Line
  doc.setDrawColor(230, 98, 31);
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Legal Note above table
  const noteText = "Nota: La tasa de interés se fija en conformidad con la resolucion vigente del Banco Central y el Código Monetario y Financiero.";
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(noteText, 14, 45);

  doc.setFontSize(14);
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'bold');
  doc.text(`Detalle de Amortización - ${clientName}`, 14, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(`Sistema de Amortización: ${systemName}`, 14, 62);

  // Table Data mapping
  const tableColumn = ["Mes", "Saldo Inicial", "Capital", "Interés", "Otros (Seguros)", "Cuota Total", "Saldo Final"];
  const tableRows = [];

  table.forEach(row => {
    const rowData = [
      row.period,
      `$${row.initialBalance.toFixed(2)}`,
      `$${row.principal.toFixed(2)}`,
      `$${row.interest.toFixed(2)}`,
      `$${row.insurance.toFixed(2)}`,
      `$${row.totalPayment.toFixed(2)}`,
      `$${row.finalBalance.toFixed(2)}`
    ];
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: 'grid',
    styles: { fontSize: 8, font: 'helvetica', cellPadding: 2 },
    headStyles: { fillColor: [230, 98, 31], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 245, 235] } // Tono naranja suave
  });

  doc.save(`Tabla_Amortizacion_${clientName}.pdf`);
};

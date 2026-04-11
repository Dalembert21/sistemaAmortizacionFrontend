import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AmortizationRow } from './amortization';

export const generatePDF = (table: AmortizationRow[], institutionName: string, clientName: string, systemName: string, logoBase64: string | null = null) => {
  const doc = new jsPDF() as any;
  const currentDateTime = new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });

  // Si hay logo lo incrustamos a la izquierda superior
  if (logoBase64) {
    try {
      // Elegant Header with Logo
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(10, 10, 190, 45, 3, 3, 'F');
      
      doc.addImage(logoBase64, 'PNG', 20, 15, 25, 25);
      
      doc.setFontSize(26);
      doc.setTextColor(230, 98, 31);
      doc.setFont('helvetica', 'bold');
      doc.text(institutionName.toUpperCase(), 55, 28);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text("Excelencia en Servicios Financieros", 55, 35);
      doc.text(`Fecha de Emisión: ${currentDateTime}`, 55, 42);
    } catch(e) {
      doc.setFontSize(24);
      doc.text(institutionName, 20, 25);
    }
  } else {
    doc.setFontSize(26);
    doc.setTextColor(230, 98, 31);
    doc.text(institutionName.toUpperCase(), 20, 25);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${currentDateTime}`, 20, 35);
  }

  // Elegant Border for the whole page
  doc.setDrawColor(230, 98, 31);
  doc.setLineWidth(0.7);
  doc.rect(5, 5, 200, 287);

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

  const logoToUse = logoBase64 || '/logo.png';


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
    alternateRowStyles: { fillColor: [255, 248, 240] } // Tono naranja extremadamente suave
  });

  // --- Watermark (Marca de Agua) SOBRE la tabla ---
  if (logoToUse) {
    try {
      if ((doc as any).GState) {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.25 })); // Visibilidad clara pero transparente
        doc.addImage(logoToUse, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
        doc.restoreGraphicsState();
      } else {
        doc.addImage(logoToUse, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
      }
    } catch (e) {}
  }

  doc.save(`Tabla_Amortizacion_${clientName}.pdf`);
};

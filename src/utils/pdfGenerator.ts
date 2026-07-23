import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  element: HTMLElement;
  filename: string;
  isThermal?: boolean;
}

export const generateAndDownloadPdf = async ({
  element,
  filename,
  isThermal = false,
}: GeneratePdfOptions): Promise<void> => {
  try {
    // 1. Temporarily prepare element for crisp canvas rendering
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: isThermal ? 420 : 900,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    if (isThermal) {
      // Thermal Receipt dimensions: ~80mm width (80mm = ~226.7pt)
      const pdfWidth = 80;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight + 5],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } else {
      // Standard A4 PDF dimensions: 210mm x 297mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const printWidth = pdfWidth - margin * 2;
      const printHeight = (imgHeight * printWidth) / imgWidth;

      if (printHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
      } else {
        // Multi-page handling if invoice/report is longer than single A4 page
        let heightLeft = printHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - printHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    }
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    throw error;
  }
};

export const generatePdfFile = async ({
  element,
  filename,
  isThermal = false,
}: GeneratePdfOptions): Promise<File> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: isThermal ? 420 : 900,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  let pdf: jsPDF;

  if (isThermal) {
    const pdfWidth = 80;
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
    pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [pdfWidth, pdfHeight + 5],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  } else {
    pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const printWidth = pdfWidth - margin * 2;
    const printHeight = (imgHeight * printWidth) / imgWidth;

    if (printHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
    } else {
      let heightLeft = printHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - printHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= pageHeight;
      }
    }
  }

  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pdfBlob = pdf.output('blob');
  return new File([pdfBlob], cleanName, { type: 'application/pdf' });
};

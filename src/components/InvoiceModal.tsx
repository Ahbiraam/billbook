import React, { useState, useRef } from 'react';
import type { Invoice, ShopInfo } from '../types';
import { Download, X, CheckCircle, FileText, Smartphone, Send, Copy, Check, Loader2, Share2, Trash2 } from 'lucide-react';
import { generateAndDownloadPdf, generatePdfFile } from '../utils/pdfGenerator';

interface InvoiceModalProps {
  invoice: Invoice | null;
  shopInfo: ShopInfo;
  onClose: () => void;
  onDeleteInvoice?: (invoiceId: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, shopInfo, onClose, onDeleteInvoice }) => {
  const [printLayout, setPrintLayout] = useState<'A4' | 'Thermal'>('A4');
  const [whatsappPhone, setWhatsappPhone] = useState<string>(invoice?.customer?.phone || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSharingPdf, setIsSharingPdf] = useState<boolean>(false);

  const invoiceSheetRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handleDeleteThisInvoice = () => {
    if (!invoice || !onDeleteInvoice) return;
    if (window.confirm(`Are you sure you want to delete Bill ${invoice.invoiceNumber}? This will restore product stock levels.`)) {
      onDeleteInvoice(invoice.id);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceSheetRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateAndDownloadPdf({
        element: invoiceSheetRef.current,
        filename: `${shopInfo.invoicePrefix || 'Invoice'}_${invoice.invoiceNumber}_${printLayout}.pdf`,
        isThermal: printLayout === 'Thermal',
      });
    } catch (err) {
      alert('Failed to generate PDF download. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdfWhatsApp = async () => {
    if (!invoiceSheetRef.current || isSharingPdf) return;
    setIsSharingPdf(true);

    const fileName = `${shopInfo.invoicePrefix || 'Invoice'}_${invoice.invoiceNumber}.pdf`;

    try {
      const pdfFile = await generatePdfFile({
        element: invoiceSheetRef.current,
        filename: fileName,
        isThermal: printLayout === 'Thermal',
      });

      // Check if Web Share API with files is supported (Mobile WhatsApp share)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `${shopInfo.name} Invoice ${invoice.invoiceNumber}`,
          text: buildWhatsAppMessage(),
          files: [pdfFile],
        });
      } else {
        // Fallback for Desktop: Auto-download PDF + Open WhatsApp Web with text
        await generateAndDownloadPdf({
          element: invoiceSheetRef.current,
          filename: fileName,
          isThermal: printLayout === 'Thermal',
        });
        handleSendWhatsApp();
      }
    } catch (err) {
      console.log('Share action ended or fallback');
    } finally {
      setIsSharingPdf(false);
    }
  };

  const getCleanPhone = (phoneStr: string): string => {
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  };

  const buildWhatsAppMessage = (): string => {
    const itemsList = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* (${it.quantity} ${it.unit}) - ${shopInfo.currencySymbol}${it.lineTotal.toFixed(2)}`
      )
      .join('\n');

    return `🧾 *${shopInfo.name} - Bill Receipt*
-----------------------------------
*Bill No:* ${invoice.invoiceNumber}
*Date:* ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}
*Customer:* ${invoice.customer.name || 'Valued Customer'}

*Itemized Bill:*
${itemsList}

-----------------------------------
💰 *Total Payable: ${shopInfo.currencySymbol}${invoice.grandTotal.toFixed(2)}*
💳 *Payment Mode:* ${invoice.paymentMethod}

*Store Location:* ${shopInfo.address}, ${shopInfo.cityStatePincode}
*Contact:* ${shopInfo.phone}

_Thank you for shopping with ${shopInfo.name}!_`;
  };

  const handleSendWhatsApp = (targetPhone?: string) => {
    let rawPhone = targetPhone || whatsappPhone || invoice.customer.phone;
    let cleanPhone = getCleanPhone(rawPhone);

    if (!cleanPhone) {
      const input = prompt('Enter customer WhatsApp mobile number:', whatsappPhone || '');
      if (!input) return;
      cleanPhone = getCleanPhone(input);
      if (!cleanPhone) return;
      setWhatsappPhone(input);
    }

    const messageText = buildWhatsAppMessage();
    const encodedText = encodeURIComponent(messageText);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Force native WhatsApp App on mobile directly without web login prompt
      window.location.href = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      // Desktop: Open WhatsApp Web
      const waWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
      const win = window.open(waWebUrl, '_blank');
      if (!win) {
        window.location.href = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      }
    }
  };

  const handleCopyMessage = () => {
    const messageText = buildWhatsAppMessage();
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: printLayout === 'Thermal' ? '480px' : '820px' }}>
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={22} className="text-emerald-400" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Invoice Generated Successfully</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {invoice.invoiceNumber} | {new Date(invoice.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${printLayout === 'A4' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPrintLayout('A4')}
            >
              <FileText size={15} /> A4 Bill
            </button>
            <button
              className={`btn btn-sm ${printLayout === 'Thermal' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPrintLayout('Thermal')}
            >
              <Smartphone size={15} /> Thermal Receipt
            </button>
            <button className="icon-btn" onClick={onClose} style={{ marginLeft: '0.5rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Printable Invoice View */}
        <div className="modal-body invoice-printable-wrapper" style={{ background: '#f8fafc', padding: '1.5rem' }}>
          <div ref={invoiceSheetRef} className={`invoice-sheet ${printLayout === 'Thermal' ? 'thermal' : ''}`}>
            {/* Header Section */}
            <div className="invoice-header-row">
              <div>
                <h2 style={{ fontSize: printLayout === 'Thermal' ? '1.2rem' : '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {shopInfo.name}
                </h2>
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>{shopInfo.address}</p>
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>{shopInfo.cityStatePincode}</p>
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>Ph: {shopInfo.phone}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.8rem', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>
                  BILL RECEIPT
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{invoice.invoiceNumber}</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Payment Mode: <strong>{invoice.paymentMethod}</strong>
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div style={{ background: '#f1f5f9', padding: '0.8rem 1rem', borderRadius: '6px', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Billed To:
              </p>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {invoice.customer.name || 'Walk-in Customer'}
              </h4>
              {invoice.customer.phone && (
                <p style={{ fontSize: '0.85rem', color: '#334155' }}>Contact: {invoice.customer.phone}</p>
              )}
              {invoice.customer.address && (
                <p style={{ fontSize: '0.85rem', color: '#334155' }}>Address: {invoice.customer.address}</p>
              )}
            </div>

            {/* Invoice Line Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {item.code}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {shopInfo.currencySymbol}{item.selectedPrice.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {shopInfo.currencySymbol}{item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Totals Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
              <div style={{ width: '55%' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  Terms & Conditions:
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  {shopInfo.termsAndConditions}
                </p>
                {invoice.notes && (
                  <p style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.5rem' }}>
                    Note: {invoice.notes}
                  </p>
                )}
              </div>

              <div style={{ width: '40%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #cbd5e1', marginTop: '0.4rem' }}>
                  <span>Total Bill:</span>
                  <span>{shopInfo.currencySymbol}{invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1rem' }}>
              <div style={{ textAlign: 'center', width: '150px' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer Signature</p>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }}></div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>Authorized Signatory</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{shopInfo.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="modal-left-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-emerald"
              onClick={handleSharePdfWhatsApp}
              disabled={isSharingPdf}
              style={{ background: '#075E54', color: '#fff' }}
              title="Share generated PDF file directly to WhatsApp"
            >
              {isSharingPdf ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
              <span>{isSharingPdf ? 'Preparing PDF...' : 'Share PDF WhatsApp'}</span>
            </button>

            <div className="whatsapp-input-group" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="tel"
                placeholder="WhatsApp Mobile #"
                className="form-input"
                style={{ width: '170px', padding: '0.45rem 0.75rem' }}
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
              />
              <button
                className="btn btn-emerald"
                onClick={() => handleSendWhatsApp(whatsappPhone)}
                style={{ background: '#25D366', color: '#fff' }}
                title="Send formatted receipt to entered WhatsApp number"
              >
                <Send size={16} />
                <span>Send WhatsApp</span>
              </button>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyMessage}
              title="Copy formatted bill text to paste manually in WhatsApp"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {onDeleteInvoice && (
              <button
                className="btn btn-danger"
                onClick={handleDeleteThisInvoice}
                title="Delete this bill and restore inventory stock"
              >
                <Trash2 size={16} />
                <span>Delete Bill</span>
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
              {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { Invoice, ShopInfo } from '../types';
import { getDailyReportSummary } from '../utils/storage';
import { Calendar, DollarSign, FileText, TrendingUp, Search, Eye, Award, Wallet, Smartphone, CreditCard, Clock, Printer, Send, X, Check, Copy } from 'lucide-react';

interface DailyReportsProps {
  invoices: Invoice[];
  shopInfo: ShopInfo;
  onViewInvoice: (invoice: Invoice) => void;
}

export const DailyReports: React.FC<DailyReportsProps> = ({ invoices, shopInfo, onViewInvoice }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  const report = getDailyReportSummary(invoices, selectedDate);

  // Filter invoices list by selected date and search text
  const filteredInvoices = invoices.filter((inv) => {
    const matchesDate = inv.dateString === selectedDate;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer.phone && inv.customer.phone.includes(searchQuery));
    return matchesDate && matchesSearch;
  });

  const avgOrderValue = report.totalInvoices > 0 ? report.totalSales / report.totalInvoices : 0;

  // Print Professional PDF Report
  const handlePrintPdfReport = () => {
    setShowPdfModal(true);
  };

  // Trigger browser print for PDF modal
  const handleTriggerPrint = () => {
    window.print();
  };

  // WhatsApp Message Handler
  const handleQuickWhatsApp = (inv: Invoice) => {
    let rawPhone = inv.customer.phone || '';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    if (!cleanPhone) {
      const input = prompt('Enter customer WhatsApp mobile number:');
      if (!input) return;
      cleanPhone = input.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    }

    const itemsList = inv.items
      .map((it, idx) => `${idx + 1}. *${it.name}* (${it.quantity} ${it.unit}) - ${shopInfo.currencySymbol}${it.lineTotal.toFixed(2)}`)
      .join('\n');

    const msg = `🧾 *${shopInfo.name} - Bill Receipt*
-----------------------------------
*Bill No:* ${inv.invoiceNumber}
*Date:* ${new Date(inv.createdAt).toLocaleDateString('en-IN')}
*Customer:* ${inv.customer.name || 'Valued Customer'}

*Items:*
${itemsList}

-----------------------------------
💰 *Total Payable: ${shopInfo.currencySymbol}${inv.grandTotal.toFixed(2)}*
💳 *Payment Mode:* ${inv.paymentMethod}

*Address:* ${shopInfo.address}, ${shopInfo.cityStatePincode}
*Phone:* ${shopInfo.phone}

_Thank you for choosing ${shopInfo.name}!_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleCopyBillText = (inv: Invoice) => {
    const itemsList = inv.items
      .map((it, idx) => `${idx + 1}. ${it.name} (${it.quantity} ${it.unit}) - ${shopInfo.currencySymbol}${it.lineTotal.toFixed(2)}`)
      .join('\n');

    const msg = `${shopInfo.name} - Bill ${inv.invoiceNumber}\nDate: ${new Date(inv.createdAt).toLocaleDateString('en-IN')}\n\nItems:\n${itemsList}\n\nTotal: ${shopInfo.currencySymbol}${inv.grandTotal.toFixed(2)}\nPayment: ${inv.paymentMethod}`;
    navigator.clipboard.writeText(msg);
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Control: Date Picker & Professional PDF Print Trigger */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={24} className="text-indigo-400" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daily Sales & Performance Reports</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Summary metrics for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                setSelectedDate(yesterday);
              }}
            >
              Yesterday
            </button>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '0.45rem 0.8rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-sm" onClick={handlePrintPdfReport}>
            <Printer size={16} />
            <span>Generate & Print Professional PDF Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-3">
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#34d399' }}>
              {shopInfo.currencySymbol}{report.totalSales.toLocaleString('en-IN')}
            </div>
            <div className="stat-lbl">Daily Gross Revenue</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FileText size={28} />
          </div>
          <div>
            <div className="stat-val">{report.totalInvoices}</div>
            <div className="stat-lbl">Total Bills Generated</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="stat-val">
              {shopInfo.currencySymbol}{avgOrderValue.toFixed(0)}
            </div>
            <div className="stat-lbl">Average Order Value (AOV)</div>
          </div>
        </div>
      </div>

      {/* Breakdown Rows: Payment Modes & Top Products */}
      <div className="grid-2">
        {/* Payment Methods Breakdown */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="card-title">
            <Wallet size={20} className="text-indigo-400" />
            <span>Payment Mode Breakdown</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Wallet size={20} style={{ color: '#34d399' }} />
                <span>Cash Collection</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {shopInfo.currencySymbol}{report.cashSales.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Smartphone size={20} style={{ color: '#38bdf8' }} />
                <span>UPI / QR Digital Payment</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {shopInfo.currencySymbol}{report.upiSales.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CreditCard size={20} style={{ color: '#a78bfa' }} />
                <span>Card Swipe Payment</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {shopInfo.currencySymbol}{report.cardSales.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={20} style={{ color: '#fbbf24' }} />
                <span>Credit / Pay Later</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {shopInfo.currencySymbol}{report.creditSales.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="card-title">
            <Award size={20} className="text-emerald-400" />
            <span>Top Performing Products Today</span>
          </h3>

          {report.topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              No product sales recorded for this date.
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Qty Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topProducts.slice(0, 5).map((item) => (
                    <tr key={item.productId}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <span className="badge badge-indigo">{item.quantity} Sold</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {shopInfo.currencySymbol}{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History & Search Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 className="card-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <FileText size={20} className="text-indigo-400" />
            <span>Daily Bills Register ({filteredInvoices.length})</span>
          </h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search bill no, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Time</th>
                <th>Customer Name</th>
                <th>Payment</th>
                <th>Items</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No matching bills found for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{inv.customer.name}</td>
                    <td>
                      <span className={`badge ${inv.paymentMethod === 'Cash' ? 'badge-emerald' : 'badge-indigo'}`}>
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td>{inv.items.length} items</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {shopInfo.currencySymbol}{inv.grandTotal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewInvoice(inv)}
                          style={{ gap: '4px' }}
                          title="View & Print Bill"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => handleQuickWhatsApp(inv)}
                          style={{ background: '#25D366', color: '#fff', padding: '0.3rem 0.6rem' }}
                          title="Send Bill to Customer via WhatsApp"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyBillText(inv)}
                          title="Copy Bill Text"
                        >
                          {copiedInvoiceId === inv.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROFESSIONAL DAILY PDF REPORT MODAL */}
      {showPdfModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={22} className="text-indigo-400" />
                <h3 style={{ fontWeight: 700 }}>Professional Daily Sales PDF Preview</h3>
              </div>
              <button className="icon-btn" onClick={() => setShowPdfModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Printable Daily Report Sheet */}
            <div className="modal-body invoice-printable-wrapper" style={{ background: '#f8fafc', padding: '2rem' }}>
              <div className="invoice-sheet" style={{ maxWidth: '780px' }}>
                {/* Header */}
                <div className="invoice-header-row">
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{shopInfo.name}</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem' }}>{shopInfo.address}, {shopInfo.cityStatePincode}</p>
                    <p style={{ color: '#475569', fontSize: '0.9rem' }}>Phone: <strong>{shopInfo.phone}</strong></p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: '#1e1b4b', color: '#ffffff', padding: '0.3rem 0.9rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                      DAILY SALES REPORT
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                      Date: {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Generated: {new Date().toLocaleTimeString('en-IN')}</p>
                  </div>
                </div>

                {/* KPI Overview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '1.5rem 0', background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Sales</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>{shopInfo.currencySymbol}{report.totalSales.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Bills</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{report.totalInvoices}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Avg Order Value</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{shopInfo.currencySymbol}{avgOrderValue.toFixed(0)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Cash Collection</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{shopInfo.currencySymbol}{report.cashSales.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Payment Methods Table */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.3rem' }}>
                  Payment Method Collection Split
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                    💵 Cash: <strong>{shopInfo.currencySymbol}{report.cashSales.toFixed(2)}</strong>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                    📱 UPI: <strong>{shopInfo.currencySymbol}{report.upiSales.toFixed(2)}</strong>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                    💳 Card: <strong>{shopInfo.currencySymbol}{report.cardSales.toFixed(2)}</strong>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
                    ⏳ Credit: <strong>{shopInfo.currencySymbol}{report.creditSales.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Detailed Transactions Register Table */}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.3rem' }}>
                  Itemized Bills Register ({filteredInvoices.length} Bills)
                </h4>
                <table className="invoice-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>Time</th>
                      <th>Customer</th>
                      <th>Payment</th>
                      <th style={{ textAlign: 'center' }}>Items</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>No bills recorded for this date.</td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700 }}>{inv.invoiceNumber}</td>
                          <td>{new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>{inv.customer.name}</td>
                          <td>{inv.paymentMethod}</td>
                          <td style={{ textAlign: 'center' }}>{inv.items.length}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{shopInfo.currencySymbol}{inv.grandTotal.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Footer Signature */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Report Generated By System</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{shopInfo.name}</p>
                  </div>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }}></div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>Authorized Manager Signature</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer no-print">
              <button className="btn btn-secondary" onClick={() => setShowPdfModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleTriggerPrint}>
                <Printer size={18} />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

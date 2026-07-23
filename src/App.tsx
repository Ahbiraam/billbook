import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  Product,
  Invoice,
  ShopInfo,
  InvoiceItem,
  CustomerInfo,
  PaymentMethod,
} from './types';
import {
  loadShopInfo,
  saveShopInfo,
  loadProducts,
  saveProducts,
  loadInvoices,
  saveInvoices,
  generateNextInvoiceNumber,
} from './utils/storage';

import { Header } from './components/Header';
import { BillingScreen } from './components/BillingScreen';
import { DailyReports } from './components/DailyReports';
import { ProductManagement } from './components/ProductManagement';
import { InvoiceModal } from './components/InvoiceModal';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Application Data States
  const [shopInfo, setShopInfo] = useState<ShopInfo>(loadShopInfo);
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices);

  // UI Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'billing' | 'reports' | 'products'>('billing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Generate & Save New Invoice
  const handleGenerateInvoice = (
    items: InvoiceItem[],
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    notes: string
  ) => {
    const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const newInvoiceNumber = generateNextInvoiceNumber(invoices, shopInfo.invoicePrefix);
    const dateStr = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      createdAt: new Date().toISOString(),
      dateString: dateStr,
      customer,
      items,
      grandTotal,
      paymentMethod,
      notes,
      status: 'Paid',
    };

    // 1. Update Invoices
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);

    // 2. Deduct stock from products
    const updatedProducts = products.map((prod) => {
      const purchasedItem = items.find((it) => it.productId === prod.id);
      if (purchasedItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - purchasedItem.quantity),
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    // 3. Trigger Celebration Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log('Confetti effect optional');
    }

    showToast(`Bill ${newInvoiceNumber} generated successfully!`);
    setSelectedInvoiceForModal(newInvoice);
  };

  // Save Product Changes
  const handleSaveProduct = (updatedProduct: Product) => {
    const exists = products.some((p) => p.id === updatedProduct.id);
    let newProductsList: Product[];
    if (exists) {
      newProductsList = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      showToast(`Product "${updatedProduct.name}" updated.`);
    } else {
      newProductsList = [updatedProduct, ...products];
      showToast(`Product "${updatedProduct.name}" added manually.`);
    }
    setProducts(newProductsList);
    saveProducts(newProductsList);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveProducts(updated);
    showToast('Product deleted from catalog.');
  };

  // Save Shop Profile Settings
  const handleSaveShopSettings = (updatedShopInfo: ShopInfo) => {
    setShopInfo(updatedShopInfo);
    saveShopInfo(updatedShopInfo);
    showToast('Store profile updated!');
  };

  // Update Invoice (Status or Payment Method change)
  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updated = invoices.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv));
    setInvoices(updated);
    saveInvoices(updated);
    showToast(`Bill ${updatedInvoice.invoiceNumber} payment status updated!`);
  };

  // Delete Invoice & Restore Product Stock
  const handleDeleteInvoice = (invoiceId: string) => {
    const invToDelete = invoices.find((i) => i.id === invoiceId);
    if (!invToDelete) return;

    const updatedInvoices = invoices.filter((i) => i.id !== invoiceId);
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);

    // Restock items associated with deleted invoice
    const updatedProducts = products.map((prod) => {
      const item = invToDelete.items.find((it) => it.productId === prod.id);
      if (item) {
        return {
          ...prod,
          stock: prod.stock + item.quantity,
        };
      }
      return prod;
    });
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    showToast(`Bill ${invToDelete.invoiceNumber} deleted and stock restored.`);
    if (selectedInvoiceForModal?.id === invoiceId) {
      setSelectedInvoiceForModal(null);
    }
  };

  // Calculate Today's Metrics for Header Badge
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((i) => i.dateString === todayStr && i.status !== 'Cancelled');
  const todaySalesTotal = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <div className="app-container">
      {/* Top Navigation & Header */}
      <Header
        shopInfo={shopInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        todaySalesTotal={todaySalesTotal}
        todayInvoicesCount={todayInvoices.length}
      />

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'billing' && (
          <BillingScreen
            products={products}
            shopInfo={shopInfo}
            onGenerateInvoice={handleGenerateInvoice}
          />
        )}

        {activeTab === 'reports' && (
          <DailyReports
            invoices={invoices}
            products={products}
            shopInfo={shopInfo}
            onViewInvoice={(inv) => setSelectedInvoiceForModal(inv)}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onSaveProduct={handleSaveProduct}
          />
        )}

        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            shopInfo={shopInfo}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* Printable Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoiceForModal}
        shopInfo={shopInfo}
        onClose={() => setSelectedInvoiceForModal(null)}
        onDeleteInvoice={handleDeleteInvoice}
      />

      {/* Shop Settings Modal */}
      <ShopSettingsModal
        shopInfo={shopInfo}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveShopSettings}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

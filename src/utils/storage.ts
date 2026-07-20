import type { Product, Invoice, ShopInfo, DailyReportSummary } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'nelrich_products_v5',
  INVOICES: 'nelrich_invoices_v5',
  SHOP_INFO: 'nelrich_shop_v5',
  THEME: 'nelrich_theme_v5',
};

export const DEFAULT_SHOP_INFO: ShopInfo = {
  name: 'Nel Rich Foods',
  tagline: 'Fresh & Premium Quality Foods',
  address: 'Poyya, Kodungallur',
  cityStatePincode: 'Thrissur, Kerala',
  phone: '6235443930 / 9292493930',
  email: 'nelrichfoods@gmail.com',
  invoicePrefix: 'NRF',
  currencySymbol: '₹',
  termsAndConditions: 'Thank you for choosing Nel Rich Foods! Goods once sold can be exchanged with original invoice within 7 days.',
};

export const INITIAL_PRODUCTS: Product[] = [];

export const getInitialInvoices = (): Invoice[] => {
  return [];
};

export const loadShopInfo = (): ShopInfo => {
  const data = localStorage.getItem(STORAGE_KEYS.SHOP_INFO);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse shop info from localStorage', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.SHOP_INFO, JSON.stringify(DEFAULT_SHOP_INFO));
  return DEFAULT_SHOP_INFO;
};

export const saveShopInfo = (shopInfo: ShopInfo): void => {
  localStorage.setItem(STORAGE_KEYS.SHOP_INFO, JSON.stringify(shopInfo));
};

export const loadProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse products from localStorage', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const loadInvoices = (): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse invoices from localStorage', e);
    }
  }
  const initial = getInitialInvoices();
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initial));
  return initial;
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const generateNextInvoiceNumber = (invoices: Invoice[], prefix: string = 'NRF'): string => {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let maxSeq = 0;

  invoices.forEach((inv) => {
    const match = inv.invoiceNumber.match(pattern);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix}-${year}-${nextSeq}`;
};

export const getDailyReportSummary = (invoices: Invoice[], targetDateStr: string): DailyReportSummary => {
  const targetInvoices = invoices.filter((inv) => inv.dateString === targetDateStr && inv.status !== 'Cancelled');

  let totalSales = 0;
  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  let creditSales = 0;

  const productSalesMap = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();

  targetInvoices.forEach((inv) => {
    totalSales += inv.grandTotal;

    switch (inv.paymentMethod) {
      case 'Cash':
        cashSales += inv.grandTotal;
        break;
      case 'UPI':
        upiSales += inv.grandTotal;
        break;
      case 'Card':
        cardSales += inv.grandTotal;
        break;
      case 'Credit':
        creditSales += inv.grandTotal;
        break;
    }

    inv.items.forEach((item) => {
      const existing = productSalesMap.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.lineTotal;
      productSalesMap.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  return {
    dateString: targetDateStr,
    totalSales,
    totalInvoices: targetInvoices.length,
    cashSales,
    upiSales,
    cardSales,
    creditSales,
    topProducts,
  };
};

export const exportDataBackup = (): void => {
  const backupObj = {
    appName: 'Nel Rich Foods Bill Book',
    exportedAt: new Date().toISOString(),
    shopInfo: loadShopInfo(),
    products: loadProducts(),
    invoices: loadInvoices(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupObj, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `Nel_Rich_Foods_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

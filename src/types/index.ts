export type PriceType = 'standard' | 'retail' | 'wholesale' | 'custom';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Credit';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string; // e.g. 'Pcs', 'Kg', 'Ltr', 'Box', 'Pack', 'Meter'
  stock: number;
  price: number; // Standard price
  retailPrice?: number;
  wholesalePrice?: number;
  description?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  code: string;
  name: string;
  unit: string;
  selectedPrice: number;
  priceType: PriceType;
  quantity: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  address: string;
  cityStatePincode: string;
  phone: string;
  email: string;
  gstin?: string;
  logoUrl?: string;
  invoicePrefix: string;
  currencySymbol: string;
  termsAndConditions: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string; // ISO String
  dateString: string; // YYYY-MM-DD
  customer: CustomerInfo;
  items: InvoiceItem[];
  grandTotal: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
}

export interface DailyReportSummary {
  dateString: string;
  totalSales: number;
  totalInvoices: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  creditSales: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

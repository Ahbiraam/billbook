import React, { useState } from 'react';
import type { Product, InvoiceItem, CustomerInfo, PaymentMethod, ShopInfo, PriceType } from '../types';
import { Plus, Trash2, ShoppingCart, User, CreditCard, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface BillingScreenProps {
  products: Product[];
  shopInfo: ShopInfo;
  onGenerateInvoice: (items: InvoiceItem[], customer: CustomerInfo, paymentMethod: PaymentMethod, notes: string) => void;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  products,
  shopInfo,
  onGenerateInvoice,
}) => {
  // Selection States
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType>('standard');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Cart & Customer States
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'Walk-in Customer',
    phone: '',
    email: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');

  // Get currently selected product object
  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Determine unit price based on selected price type
  const getActiveUnitPrice = (): number => {
    if (!currentProduct) return 0;
    if (selectedPriceType === 'retail' && currentProduct.retailPrice) {
      return currentProduct.retailPrice;
    }
    if (selectedPriceType === 'wholesale' && currentProduct.wholesalePrice) {
      return currentProduct.wholesalePrice;
    }
    if (selectedPriceType === 'custom') {
      return customPrice;
    }
    return currentProduct.price;
  };

  // Handle Product Selection Change
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setCustomPrice(prod.price);
      setSelectedPriceType('standard');
      setQuantity(1);
    }
  };

  // Add Item to Bill Cart
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const unitPrice = getActiveUnitPrice();
    if (unitPrice <= 0 || quantity <= 0) return;

    const lineTotal = unitPrice * quantity;

    const newItem: InvoiceItem = {
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: currentProduct.id,
      code: currentProduct.code,
      name: currentProduct.name,
      unit: currentProduct.unit,
      selectedPrice: unitPrice,
      priceType: selectedPriceType,
      quantity,
      lineTotal,
    };

    setCartItems((prev) => [...prev, newItem]);

    // Reset selection fields
    setSelectedProductId('');
    setQuantity(1);
  };

  // Remove Item from Cart
  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update Item Quantity in Cart directly
  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          const lineTotal = item.selectedPrice * newQty;
          return {
            ...item,
            quantity: newQty,
            lineTotal,
          };
        }
        return item;
      })
    );
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Calculate Grand Total
  const netGrandTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  // Submit Invoice Generation
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onGenerateInvoice(cartItems, customer, paymentMethod, notes);
  };

  return (
    <div className="billing-layout">
      {/* Left Column: Product Selection & Bill Table */}
      <div className="billing-card glass-panel">
        <div className="card-title">
          <ShoppingCart size={22} className="text-indigo-400" />
          <span>Product Billing & Cart</span>
          {cartItems.length > 0 && (
            <span className="badge badge-indigo" style={{ marginLeft: 'auto' }}>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Product Selection Form */}
        <form onSubmit={handleAddItem} className="selection-box">
          <div className="grid-2">
            {/* 1. PRODUCT DROPDOWN */}
            <div className="form-group">
              <label className="form-label">
                <span>Select Product</span>
                {currentProduct && (
                  <span className="badge badge-amber">Stock: {currentProduct.stock} {currentProduct.unit}</span>
                )}
              </label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">
                  {products.length === 0 ? '-- No Products Added Yet (Add in Products Tab) --' : '-- Choose Product from Dropdown --'}
                </option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    [{prod.code}] {prod.name} ({shopInfo.currencySymbol}{prod.price} / {prod.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. PRICE SELECTION DROPDOWN */}
            <div className="form-group">
              <label className="form-label">Select Price Rate</label>
              <select
                className="form-select"
                value={selectedPriceType}
                disabled={!currentProduct}
                onChange={(e) => setSelectedPriceType(e.target.value as PriceType)}
              >
                <option value="standard">
                  Standard Rate ({shopInfo.currencySymbol}{currentProduct?.price || 0})
                </option>
                {currentProduct?.retailPrice && (
                  <option value="retail">
                    Retail Rate ({shopInfo.currencySymbol}{currentProduct.retailPrice})
                  </option>
                )}
                {currentProduct?.wholesalePrice && (
                  <option value="wholesale">
                    Wholesale Rate ({shopInfo.currencySymbol}{currentProduct.wholesalePrice})
                  </option>
                )}
                <option value="custom">⚙ Custom Price Rate</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            {/* Custom Price Input if selected */}
            {selectedPriceType === 'custom' ? (
              <div className="form-group">
                <label className="form-label">Custom Unit Price ({shopInfo.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Unit Price</label>
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--accent-emerald)', fontWeight: 700 }}
                  value={`${shopInfo.currencySymbol}${getActiveUnitPrice()}`}
                />
              </div>
            )}

            {/* 3. QUANTITY DROPDOWN & STEPPER */}
            <div className="form-group">
              <label className="form-label">Quantity Selector</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <select
                  className="form-select"
                  value={[1, 2, 3, 4, 5, 10, 20, 50].includes(quantity) ? quantity : 'custom'}
                  disabled={!currentProduct}
                  onChange={(e) => {
                    if (e.target.value === 'custom') return;
                    setQuantity(parseInt(e.target.value, 10));
                  }}
                  style={{ flex: 1 }}
                >
                  <option value="1">1 {currentProduct?.unit || 'Unit'}</option>
                  <option value="2">2 Units</option>
                  <option value="3">3 Units</option>
                  <option value="4">4 Units</option>
                  <option value="5">5 Units</option>
                  <option value="10">10 Units</option>
                  <option value="20">20 Units</option>
                  <option value="50">50 Units</option>
                  <option value="custom">Specify Custom Qty</option>
                </select>

                <input
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ width: '85px' }}
                  value={quantity}
                  disabled={!currentProduct}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  title="Direct Quantity Input"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {currentProduct && (
                <span>
                  Line Total: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>
                    {shopInfo.currencySymbol}{(getActiveUnitPrice() * quantity).toFixed(2)}
                  </strong>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!currentProduct}
              style={{ padding: '0.6rem 1.5rem' }}
            >
              <Plus size={18} />
              <span>Add to Bill</span>
            </button>
          </div>
        </form>

        {/* Bill Cart Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Code & Name</th>
                <th>Price Rate</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Layers size={36} style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>Your bill cart is empty.</p>
                    <p style={{ fontSize: '0.825rem' }}>
                      {products.length === 0
                        ? 'No products available. Go to "Products" tab to add products first.'
                        : 'Select a product from the dropdown above to add to the invoice.'}
                    </p>
                  </td>
                </tr>
              ) : (
                cartItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.code}</div>
                    </td>
                    <td>
                      {shopInfo.currencySymbol}{item.selectedPrice} / {item.unit}
                      {item.priceType !== 'standard' && (
                        <span className="badge badge-indigo" style={{ marginLeft: '4px', fontSize: '0.65rem' }}>
                          {item.priceType}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.1rem 0.4rem' }}
                          onClick={() => handleUpdateCartQty(item.id, -1)}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.1rem 0.4rem' }}
                          onClick={() => handleUpdateCartQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                      {shopInfo.currencySymbol}{item.lineTotal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="icon-btn"
                        style={{ color: 'var(--accent-rose)', margin: '0 auto' }}
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {cartItems.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleClearCart} style={{ color: 'var(--accent-rose)' }}>
              <RefreshCw size={14} /> Clear Cart Items
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Customer Details & Calculation Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Customer Details Panel */}
        <div className="billing-card glass-panel">
          <div className="card-title">
            <User size={20} className="text-indigo-400" />
            <span>Customer Details</span>
          </div>

          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              value={customer.name}
              placeholder="e.g. John Doe / Walk-in Customer"
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={customer.phone}
                placeholder="+91 9876543210"
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="Cash">💵 Cash</option>
                <option value="UPI">📱 UPI / QR Code</option>
                <option value="Card">💳 Credit / Debit Card</option>
                <option value="Credit">⏳ Credit (Pay Later)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Reference (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              placeholder="Transaction ref no, delivery notes..."
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Invoice Summary & Checkout */}
        <div className="billing-card glass-panel" style={{ background: 'var(--gradient-card)' }}>
          <div className="card-title">
            <CreditCard size={20} className="text-emerald-400" />
            <span>Total Bill Calculation</span>
          </div>

          <div>
            <div className="summary-row total" style={{ borderTop: 'none', paddingTop: 0 }}>
              <span>Total Bill Amount:</span>
              <span style={{ color: 'var(--accent-emerald)', fontSize: '1.6rem' }}>
                {shopInfo.currencySymbol}{netGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            className="btn btn-emerald"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            <span>Generate & Preview Invoice</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

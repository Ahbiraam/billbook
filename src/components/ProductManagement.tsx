import React, { useState } from 'react';
import type { Product, ShopInfo } from '../types';
import { Package, Plus, Edit2, Trash2, Search, Filter, Save, X } from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  shopInfo: ShopInfo;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  shopInfo,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: 'General',
    unit: 'Pcs',
    stock: 10,
    price: 100,
    retailPrice: 110,
    wholesalePrice: 90,
    description: '',
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    setCurrentProduct({
      id: `prod-${Date.now()}`,
      code: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'General',
      unit: 'Pcs',
      stock: 50,
      price: 100,
      retailPrice: 110,
      wholesalePrice: 90,
      description: '',
    });
    setIsEditing(true);
  };

  const handleEditProduct = (prod: Product) => {
    setCurrentProduct(prod);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.code) return;

    onSaveProduct(currentProduct as Product);
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Package size={24} className="text-indigo-400" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Product Catalog & Inventory Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Add products manually, set stock levels and pricing rates
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add New Product Manually</span>
        </button>
      </div>

      {/* Filter Bar & Product List */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.8rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Standard Price</th>
                <th>Retail Rate</th>
                <th>Wholesale Rate</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>No products found in catalog.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Click <strong>"Add New Product Manually"</strong> above to add your products.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{prod.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      {prod.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.description}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-indigo">{prod.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${prod.stock > 10 ? 'badge-emerald' : 'badge-amber'}`}>
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {shopInfo.currencySymbol}{prod.price}
                    </td>
                    <td>{prod.retailPrice ? `${shopInfo.currencySymbol}${prod.retailPrice}` : '-'}</td>
                    <td>{prod.wholesalePrice ? `${shopInfo.currencySymbol}${prod.wholesalePrice}` : '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button className="icon-btn" onClick={() => handleEditProduct(prod)} title="Edit Product">
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          style={{ color: 'var(--accent-rose)' }}
                          onClick={() => onDeleteProduct(prod.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
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

      {/* Add / Edit Product Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>
                {currentProduct.id ? 'Edit Product Details' : 'Add Product Manually'}
              </h3>
              <button className="icon-btn" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Item Code / SKU</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={currentProduct.code || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, code: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={currentProduct.category || ''}
                      placeholder="e.g. Electronics, Grocery"
                      onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={currentProduct.name || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Unit Type</label>
                    <select
                      className="form-select"
                      value={currentProduct.unit || 'Pcs'}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, unit: e.target.value })}
                    >
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="Kg">Kg (Kilograms)</option>
                      <option value="Ltr">Ltr (Liters)</option>
                      <option value="Box">Box</option>
                      <option value="Pack">Pack</option>
                      <option value="Meter">Meter</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={currentProduct.stock || 0}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Standard Price ({shopInfo.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="form-input"
                      value={currentProduct.price || 0}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Retail Rate ({shopInfo.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={currentProduct.retailPrice || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, retailPrice: parseFloat(e.target.value) || undefined })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wholesale Rate ({shopInfo.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={currentProduct.wholesalePrice || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, wholesalePrice: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.description || ''}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

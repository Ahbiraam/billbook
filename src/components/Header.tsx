import React from 'react';
import type { ShopInfo } from '../types';
import { ShoppingBag, Receipt, BarChart3, Package, Settings, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  shopInfo: ShopInfo;
  activeTab: 'billing' | 'reports' | 'products';
  setActiveTab: (tab: 'billing' | 'reports' | 'products') => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  todaySalesTotal: number;
  todayInvoicesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  shopInfo,
  activeTab,
  setActiveTab,
  onOpenSettings,
  theme,
  toggleTheme,
  todaySalesTotal,
  todayInvoicesCount,
}) => {
  return (
    <header className="app-header glass-panel">
      <div className="brand-section">
        <div className="brand-icon">
          <ShoppingBag size={26} />
        </div>
        <div>
          <h1 className="brand-title">{shopInfo.name}</h1>
          <p className="brand-subtitle">{shopInfo.tagline}</p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <Receipt size={18} />
          <span>New Billing</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={18} />
          <span>Daily Reports</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} />
          <span>Products</span>
        </button>
      </nav>

      <div className="header-actions">
        <div className="badge badge-emerald" style={{ gap: '6px', padding: '0.4rem 0.8rem', fontSize: '0.825rem' }}>
          <Sparkles size={14} />
          <span>Today: <strong>{shopInfo.currencySymbol}{todaySalesTotal.toLocaleString('en-IN')}</strong> ({todayInvoicesCount} bills)</span>
        </div>

        <button className="icon-btn" onClick={onOpenSettings} title="Store Settings">
          <Settings size={19} />
        </button>

        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
};

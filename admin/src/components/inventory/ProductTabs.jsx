import React from 'react';

const ProductTabs = ({ activeTab, onTabChange }) => (
  <div className="custom-tabs">
    <button className={`custom-tab${activeTab === 'products' ? ' active' : ''}`}
      onClick={() => onTabChange('products')}>Products</button>
    <button className={`custom-tab${activeTab === 'inventory' ? ' active' : ''}`}
      onClick={() => onTabChange('inventory')}>Inventory</button>
  </div>
);

export default ProductTabs;

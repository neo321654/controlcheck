import React from 'react';
import type { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  selectedSku: string | null;
  onProductChange: (sku: string) => void;
  error?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ products, selectedSku, onProductChange, error }) => {
  return (
    <div data-error-key="product">
      <label htmlFor="product-select" className="block text-sm font-medium text-gray-700">
        Выберите SKU (наименование хлеба)
      </label>
      <select
        id="product-select"
        value={selectedSku || ''}
        onChange={(e) => onProductChange(e.target.value)}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md bg-white/75 backdrop-blur-sm text-gray-900`}
      >
        <option value="" disabled>-- Выберите хлеб --</option>
        {products.map((product) => (
          <option key={product.sku} value={product.sku}>
            {product.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
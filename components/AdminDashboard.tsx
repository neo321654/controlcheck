import React, { useState } from 'react';
import { Product } from '../types';
import { ProductEditModal } from './ProductEditModal';
import { ConfirmationModal } from './ConfirmationModal';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AdminDashboardProps {
    products: Product[];
    onAddProduct: (productData: any) => Promise<void>;
    onUpdateProduct: (product: Product & { exteriorPhotoFile?: File, crumbPhotoFile?: File }) => Promise<void>;
    onDeleteProduct: (sku: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleOpenAddModal = () => {
        setSelectedProduct(null);
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedProduct) {
            onDeleteProduct(selectedProduct.sku);
        }
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-900">Управление эталонами</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75 transition-colors"
                >
                    Добавить новый
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название (SKU)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Размеры (В/Ш/Д, мм)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.length > 0 ? products.map(product => (
                            <tr key={product.sku}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.sku}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ({product.referenceDimensions.heightMin}-{product.referenceDimensions.heightMax}) / ({product.referenceDimensions.widthMin}-{product.referenceDimensions.widthMax}) / ({product.referenceDimensions.lengthMin}-{product.referenceDimensions.lengthMax})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-4">
                                        <button onClick={() => handleOpenEditModal(product)} className="text-amber-600 hover:text-amber-900" title="Редактировать">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(product)} className="text-red-600 hover:text-red-900" title="Удалить">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="text-center py-10 text-gray-500">
                                    Эталонные образцы еще не добавлены.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <ProductEditModal
                    productToEdit={selectedProduct}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={selectedProduct ? onUpdateProduct : onAddProduct}
                />
            )}

            {isDeleteModalOpen && selectedProduct && (
                 <ConfirmationModal
                    title="Подтвердить удаление"
                    message={`Вы уверены, что хотите удалить эталон "${selectedProduct.name}"? Это действие необратимо.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                 />
            )}
        </div>
    );
};

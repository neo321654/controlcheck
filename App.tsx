import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { PackerApp } from './components/PackerApp';
import { AdminDashboard } from './components/AdminDashboard';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
    const [role, setRole] = useLocalStorage<'packer' | 'admin'>('currentRole', 'packer');
    const [products, setProducts] = useLocalStorage<Product[]>('products', []);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs only once to populate initial data if localStorage is empty.
        const initializeProducts = async () => {
            try {
                const storedProductsRaw = localStorage.getItem('products');
                const storedProducts = storedProductsRaw ? JSON.parse(storedProductsRaw) : [];
                
                if (storedProducts.length === 0) {
                    console.log("No products in localStorage, fetching initial data...");
                    // Using a relative path that should work from index.html
                    const response = await fetch('./data/products.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const initialData = await response.json();
                    setProducts(initialData); // This will update state and localStorage via the hook
                }
            } catch (e) {
                console.error("Failed to initialize products:", e);
                setError("Не удалось загрузить начальные данные о продуктах. Пожалуйста, обновите страницу.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeProducts();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleAddProduct = async (newProductData: Omit<Product, 'sku' | 'referencePhotos'> & { exteriorPhotoFile?: File, crumbPhotoFile?: File }) => {
        const exteriorPhotoUrl = newProductData.exteriorPhotoFile ? await fileToBase64(newProductData.exteriorPhotoFile) : "https://placehold.co/800x600/cccccc/ffffff?text=No+Image";
        const crumbPhotoUrl = newProductData.crumbPhotoFile ? await fileToBase64(newProductData.crumbPhotoFile) : "https://placehold.co/800x600/cccccc/ffffff?text=No+Image";

        const newProduct: Product = {
            ...newProductData,
            sku: `PROD-${Date.now()}`, // Simple unique SKU generation
            referencePhotos: {
                exterior: exteriorPhotoUrl,
                crumb: crumbPhotoUrl,
            }
        };
        setProducts(prev => [...prev, newProduct]);
    };

    const handleUpdateProduct = async (updatedProductData: Product & { exteriorPhotoFile?: File, crumbPhotoFile?: File }) => {
        const exteriorPhotoUrl = updatedProductData.exteriorPhotoFile 
            ? await fileToBase64(updatedProductData.exteriorPhotoFile) 
            : updatedProductData.referencePhotos.exterior;

        const crumbPhotoUrl = updatedProductData.crumbPhotoFile 
            ? await fileToBase64(updatedProductData.crumbPhotoFile) 
            : updatedProductData.referencePhotos.crumb;

        const finalProduct = { ...updatedProductData };
        delete finalProduct.exteriorPhotoFile;
        delete finalProduct.crumbPhotoFile;
        finalProduct.referencePhotos = { exterior: exteriorPhotoUrl, crumb: crumbPhotoUrl };
        
        setProducts(prev => prev.map(p => p.sku === finalProduct.sku ? finalProduct : p));
    };

    const handleDeleteProduct = (skuToDelete: string) => {
        setProducts(prev => prev.filter(p => p.sku !== skuToDelete));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-amber-50">
                <div className="text-xl font-semibold text-amber-800 animate-pulse">Загрузка приложения...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                <div className="p-8 bg-white shadow-lg rounded-lg border border-red-200 text-center">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Произошла ошибка</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 font-sans">
            <Header currentRole={role} onRoleChange={setRole} />
            <main className="container mx-auto p-4 md:p-8">
                {role === 'packer' ? (
                    <PackerApp products={products} />
                ) : (
                    <AdminDashboard 
                        products={products}
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { fileToBase64 } from '../utils/fileUtils';

interface ProductEditModalProps {
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
}

const DimensionInput: React.FC<{ label: string, value: number, onChange: (val: number) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600">{label}</label>
        <input 
            type="number"
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
        />
    </div>
);

const PhotoInput: React.FC<{ label: string; currentPhoto: string | null; onFileSelect: (file: File) => void; }> = ({ label, currentPhoto, onFileSelect }) => {
    const [preview, setPreview] = useState<string | null>(currentPhoto);
    const inputId = `photo-input-${label.replace(/\s+/g, '-')}`;

    useEffect(() => {
        setPreview(currentPhoto);
    }, [currentPhoto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            onFileSelect(file);
            fileToBase64(file).then(setPreview);
        }
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-4">
                <div className="w-24 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover rounded" /> : <span className="text-xs text-gray-400">Фото</span>}
                </div>
                <label htmlFor={inputId} className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    <span>Загрузить</span>
                </label>
                <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleChange} />
            </div>
        </div>
    );
};

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ productToEdit, onClose, onSave }) => {
    const [productData, setProductData] = useState({
        name: '',
        heightMin: 0, heightMax: 0,
        widthMin: 0, widthMax: 0,
        lengthMin: 0, lengthMax: 0,
    });
    const [exteriorPhotoFile, setExteriorPhotoFile] = useState<File | undefined>();
    const [crumbPhotoFile, setCrumbPhotoFile] = useState<File | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setProductData({
                name: productToEdit.name,
                ...productToEdit.referenceDimensions
            });
        }
    }, [productToEdit]);

    const handleChange = (field: string, value: string | number) => {
        setProductData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const payload = productToEdit 
            ? { 
                ...productToEdit, 
                name: productData.name, 
                referenceDimensions: {
                    heightMin: productData.heightMin, heightMax: productData.heightMax,
                    widthMin: productData.widthMin, widthMax: productData.widthMax,
                    lengthMin: productData.lengthMin, lengthMax: productData.lengthMax,
                },
                exteriorPhotoFile,
                crumbPhotoFile
            }
            : {
                name: productData.name,
                referenceDimensions: {
                    heightMin: productData.heightMin, heightMax: productData.heightMax,
                    widthMin: productData.widthMin, widthMax: productData.widthMax,
                    lengthMin: productData.lengthMin, lengthMax: productData.lengthMax,
                },
                exteriorPhotoFile,
                crumbPhotoFile
            };
        
        await onSave(payload);
        setIsSaving(false);
        onClose();
    };

    const isEditMode = !!productToEdit;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Редактировать эталон' : 'Добавить эталон'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Название продукта</label>
                        <input
                            type="text"
                            id="name"
                            value={productData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                    </div>
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Диапазоны размеров (мм)</legend>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <DimensionInput label="Высота (мин)" value={productData.heightMin} onChange={val => handleChange('heightMin', val)} />
                                <DimensionInput label="Высота (макс)" value={productData.heightMax} onChange={val => handleChange('heightMax', val)} />
                            </div>
                            <div className="space-y-2">
                                <DimensionInput label="Ширина (мин)" value={productData.widthMin} onChange={val => handleChange('widthMin', val)} />
                                <DimensionInput label="Ширина (макс)" value={productData.widthMax} onChange={val => handleChange('widthMax', val)} />
                            </div>
                            <div className="space-y-2">
                                <DimensionInput label="Длина (мин)" value={productData.lengthMin} onChange={val => handleChange('lengthMin', val)} />
                                <DimensionInput label="Длина (макс)" value={productData.lengthMax} onChange={val => handleChange('lengthMax', val)} />
                            </div>
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-gray-700 px-2">Эталонные фото</legend>
                        <div className="space-y-4">
                            <PhotoInput label="Внешний вид" currentPhoto={productToEdit?.referencePhotos.exterior ?? null} onFileSelect={setExteriorPhotoFile} />
                            <PhotoInput label="Разрез мякиша" currentPhoto={productToEdit?.referencePhotos.crumb ?? null} onFileSelect={setCrumbPhotoFile} />
                        </div>
                    </fieldset>

                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Отмена
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !productData.name}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:bg-gray-400"
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

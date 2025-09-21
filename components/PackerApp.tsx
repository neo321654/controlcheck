import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Product, FormData, FormErrors, Status } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProductSelector } from './ProductSelector';
import { MeasurementInput } from './MeasurementInput';
import { RatingInput } from './RatingInput';
import { ImageUploader } from './ImageUploader';
import { SummaryModal } from './SummaryModal';
import { submitToBitrix } from '../services/bitrixService';

interface PackerAppProps {
    products: Product[];
}

export const PackerApp: React.FC<PackerAppProps> = ({ products }) => {
    const [selectedSku, setSelectedSku] = useLocalStorage<string | null>('selectedSku', null);
    
    const initialFormData: FormData = {
        batchNumber: '',
        height: '',
        width: '',
        length: '',
        colorRating: 0,
        crumbRating: 0,
        tasteRating: 0,
        notes: '',
        exteriorPhoto: null,
        crumbPhoto: null,
    };

    const [formData, setFormData] = useLocalStorage<FormData>('formData', initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [calculatedResults, setCalculatedResults] = useState<{ status: Status, averageScore: number }>({ status: 'not passed', averageScore: 0 });


    const selectedProduct = useMemo(() => 
        products.find(p => p.sku === selectedSku) || null, 
    [products, selectedSku]);
    
    useEffect(() => {
        if (selectedSku && !products.some(p => p.sku === selectedSku)) {
            setSelectedSku(null);
            setFormData(initialFormData);
        }
    }, [products, selectedSku, setSelectedSku, initialFormData]);

    const handleProductChange = (sku: string) => {
        setSelectedSku(sku);
    };

    const calculateResults = useCallback(() => {
        if (!selectedProduct) return { status: 'not passed' as Status, averageScore: 0 };

        const { heightMin, heightMax, widthMin, widthMax, lengthMin, lengthMax } = selectedProduct.referenceDimensions;
        
        const height = Number(formData.height);
        const width = Number(formData.width);
        const length = Number(formData.length);

        // Score dimensions (5 for in-range, 1 for out-of-range)
        const heightScore = (height >= heightMin && height <= heightMax) ? 5 : 1;
        const widthScore = (width >= widthMin && width <= widthMax) ? 5 : 1;
        const lengthScore = (length >= lengthMin && length <= lengthMax) ? 5 : 1;
        const dimensionScore = (heightScore + widthScore + lengthScore) / 3;

        // Calculate average score from 4 components: dimensions, color, crumb, taste
        const averageScore = (
            dimensionScore +
            formData.colorRating +
            formData.crumbRating +
            formData.tasteRating
        ) / 4;

        const status: Status = averageScore >= 3.4 ? 'passed' : 'not passed';

        return { status, averageScore };
    }, [formData, selectedProduct]);


    const validate = useCallback(() => {
        const newErrors: FormErrors = {};
        if (!selectedProduct) newErrors.product = 'Необходимо выбрать SKU.';
        if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Номер партии обязателен.';
        if (!formData.height) newErrors.height = 'Высота обязательна.';
        if (!formData.width) newErrors.width = 'Ширина обязательна.';
        if (!formData.length) newErrors.length = 'Длина обязательна.';
        if (formData.colorRating === 0) newErrors.colorRating = 'Оценка колера обязательна.';
        if (formData.crumbRating === 0) newErrors.crumbRating = 'Оценка мякиша обязательна.';
        if (formData.tasteRating === 0) newErrors.tasteRating = 'Оценка вкуса обязательна.';
        if (!formData.exteriorPhoto) newErrors.exteriorPhoto = 'Фото внешнего вида обязательно.';
        if (!formData.crumbPhoto) newErrors.crumbPhoto = 'Фото разреза мякиша обязательно.';
        return newErrors;
    }, [formData, selectedProduct]);

    const handleFormChange = (field: keyof FormData, value: string | number | File) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const handleRatingChange = (field: keyof FormData, value: number) => {
      handleFormChange(field, value);
    };

    const handleSubmitAttempt = () => {
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            setCalculatedResults(calculateResults());
            setIsModalOpen(true);
        } else {
            const errorElement = document.querySelector(`[data-error-key="${Object.keys(validationErrors)[0]}"]`);
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setSelectedSku(null);
        setErrors({});
        setSubmissionStatus(null);
        setIsSubmitting(false);
        localStorage.removeItem('formData');
        localStorage.removeItem('selectedSku');
    };

    const confirmAndSubmit = async () => {
        if (!selectedProduct) return;
        
        setIsSubmitting(true);
        setIsModalOpen(false);
        setSubmissionStatus(null);
        
        const { status, averageScore } = calculatedResults;
        
        try {
            await submitToBitrix(formData, selectedProduct, status, averageScore);
            setSubmissionStatus('success');
            setTimeout(resetForm, 3000);
        } catch (error) {
            console.error("Submission failed:", error);
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md max-w-lg mx-auto">
                <p className="font-bold text-lg">Продукция не найдена</p>
                <p>Пожалуйста, попросите администратора добавить эталонные образцы.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/50">
                    <h2 className="text-2xl font-bold text-amber-900 mb-6">Данные партии</h2>
                    <div className="space-y-6">
                        <ProductSelector
                            products={products}
                            selectedSku={selectedSku}
                            onProductChange={handleProductChange}
                            error={errors.product}
                        />
                        {selectedProduct && (
                            <>
                                <div data-error-key="batchNumber">
                                  <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700">Номер партии</label>
                                  <input
                                      type="text"
                                      id="batchNumber"
                                      value={formData.batchNumber}
                                      onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white/75 backdrop-blur-sm text-gray-900 ${errors.batchNumber ? 'border-red-500' : 'border-gray-300'}`}
                                  />
                                  {errors.batchNumber && <p className="mt-1 text-xs text-red-600">{errors.batchNumber}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <MeasurementInput
                                        label="Высота (мм)"
                                        id="height"
                                        value={formData.height}
                                        referenceValueMin={selectedProduct.referenceDimensions.heightMin}
                                        referenceValueMax={selectedProduct.referenceDimensions.heightMax}
                                        onChange={(val) => handleFormChange('height', val)}
                                        error={errors.height}
                                    />
                                    <MeasurementInput
                                        label="Ширина (мм)"
                                        id="width"
                                        value={formData.width}
                                        referenceValueMin={selectedProduct.referenceDimensions.widthMin}
                                        referenceValueMax={selectedProduct.referenceDimensions.widthMax}
                                        onChange={(val) => handleFormChange('width', val)}
                                        error={errors.width}
                                    />
                                    <MeasurementInput
                                        label="Длина (мм)"
                                        id="length"
                                        value={formData.length}
                                        referenceValueMin={selectedProduct.referenceDimensions.lengthMin}
                                        referenceValueMax={selectedProduct.referenceDimensions.lengthMax}
                                        onChange={(val) => handleFormChange('length', val)}
                                        error={errors.length}
                                    />
                                </div>
                                <RatingInput label="Оценка колера" rating={formData.colorRating} onRatingChange={(r) => handleRatingChange('colorRating', r)} error={errors.colorRating} dataErrorKey="colorRating" />
                                <RatingInput label="Оценка мякиша" rating={formData.crumbRating} onRatingChange={(r) => handleRatingChange('crumbRating', r)} error={errors.crumbRating} dataErrorKey="crumbRating" />
                                <RatingInput label="Оценка вкуса" rating={formData.tasteRating} onRatingChange={(r) => handleRatingChange('tasteRating', r)} error={errors.tasteRating} dataErrorKey="tasteRating" />
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Заметки по вкусовым характеристикам</label>
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleFormChange('notes', e.target.value)}
                                        maxLength={300}
                                        rows={4}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white/75 backdrop-blur-sm text-gray-900"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 text-right">{formData.notes.length}/300</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* Right Column: Photos & Submission */}
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/50 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-900 mb-6">Фото-сравнение</h2>
                        {selectedProduct ? (
                            <div className="space-y-6">
                                <ImageUploader
                                    id="exteriorPhoto"
                                    label="Внешний вид"
                                    referencePhotoUrl={selectedProduct.referencePhotos.exterior}
                                    onFileChange={(file) => handleFormChange('exteriorPhoto', file)}
                                    error={errors.exteriorPhoto}
                                    persistedFile={formData.exteriorPhoto}
                                />
                                <ImageUploader
                                    id="crumbPhoto"
                                    label="Разрез мякиша"
                                    referencePhotoUrl={selectedProduct.referencePhotos.crumb}
                                    onFileChange={(file) => handleFormChange('crumbPhoto', file)}
                                    error={errors.crumbPhoto}
                                    persistedFile={formData.crumbPhoto}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">Выберите SKU, чтобы загрузить фотографии.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-900/10">
                         {submissionStatus === 'success' && (
                            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                              <span className="font-medium">Успешно!</span> Отчет отправлен в Bitrix24. Форма будет сброшена.
                            </div>
                        )}
                        {submissionStatus === 'error' && (
                            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                              <span className="font-medium">Ошибка!</span> Не удалось отправить отчет. Пожалуйста, попробуйте снова.
                            </div>
                        )}
                        <button
                            onClick={handleSubmitAttempt}
                            disabled={isSubmitting || !selectedProduct}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Отправка...' : 'Отправить в Bitrix24'}
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && selectedProduct && (
                <SummaryModal
                    formData={formData}
                    product={selectedProduct}
                    status={calculatedResults.status}
                    averageScore={calculatedResults.averageScore}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmAndSubmit}
                />
            )}
        </>
    );
};
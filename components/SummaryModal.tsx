import React from 'react';
import type { FormData, Product, Status } from '../types';
import { XIcon } from './icons/XIcon';

interface SummaryModalProps {
  formData: FormData;
  product: Product;
  status: Status;
  averageScore: number;
  onClose: () => void;
  onConfirm: () => void;
}

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900 text-right">{value}</dd>
    </div>
);

export const SummaryModal: React.FC<SummaryModalProps> = ({ formData, product, status, averageScore, onClose, onConfirm }) => {
    const statusClasses = status === 'passed' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';
    const statusText = status === 'passed' ? 'Пройдено' : 'Не пройдено';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Резюме проверки</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <dl className="space-y-2">
                        <SummaryRow label="SKU" value={product.name} />
                        <SummaryRow label="Номер партии" value={formData.batchNumber} />
                        <SummaryRow label="Высота / Ширина / Длина (мм)" value={`${formData.height} / ${formData.width} / ${formData.length}`} />
                        <SummaryRow label="Оценка колера" value={`${formData.colorRating}/5`} />
                        <SummaryRow label="Оценка мякиша" value={`${formData.crumbRating}/5`} />
                        <SummaryRow label="Оценка вкуса" value={`${formData.tasteRating}/5`} />
                        <SummaryRow label="Средний балл" value={<span className="font-bold text-lg text-amber-800">{averageScore.toFixed(2)}</span>} />
                        <SummaryRow label="Итоговый статус" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>{statusText}</span>} />
                        {formData.notes && (
                            <div className="pt-2">
                                <dt className="text-sm font-medium text-gray-500 mb-1">Заметки</dt>
                                <dd className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">{formData.notes}</dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Отмена
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700">
                        Подтвердить и отправить
                    </button>
                </div>
            </div>
        </div>
    );
};
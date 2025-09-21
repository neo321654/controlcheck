import React from 'react';

interface MeasurementInputProps {
  label: string;
  id: string;
  value: string | number;
  referenceValueMin: number;
  referenceValueMax: number;
  onChange: (value: string) => void;
  error?: string;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({ label, id, value, referenceValueMin, referenceValueMax, onChange, error }) => {
  return (
    <div data-error-key={id}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white/75 backdrop-blur-sm text-gray-900`}
      />
      <p className="mt-1 text-xs text-gray-500">Эталон: {referenceValueMin}–{referenceValueMax} мм</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

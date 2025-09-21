import React from 'react';
import { StarIcon } from './icons/StarIcon';

interface RatingInputProps {
  label: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  error?: string;
  dataErrorKey: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({ label, rating, onRatingChange, error, dataErrorKey }) => {
  return (
    <div data-error-key={dataErrorKey}>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full p-1"
            aria-label={`Оценка ${star}`}
          >
            <StarIcon
              className={`h-7 w-7 transition-colors ${
                star <= rating ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
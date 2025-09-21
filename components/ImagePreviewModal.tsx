
import React from 'react';
import { XIcon } from './icons/XIcon';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Enlarged view" className="object-contain w-full h-full max-h-[90vh]" />
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

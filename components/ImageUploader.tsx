import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ImageUploaderProps {
  id: string;
  label: string;
  referencePhotoUrl: string;
  onFileChange: (file: File) => void;
  error?: string;
  persistedFile: File | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, referencePhotoUrl, onFileChange, error, persistedFile }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
    // Reset the input value to allow re-uploading the same file
    if(event.target) {
        event.target.value = '';
    }
  };

  const updatePreview = useCallback((file: File | null) => {
     if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setPreview(null);
    }
  }, []);

  useEffect(() => {
    updatePreview(persistedFile);
  }, [persistedFile, updatePreview]);

  const openModal = (imgSrc: string) => {
    setModalImage(imgSrc);
    setIsModalOpen(true);
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-3" data-error-key={id}>
      <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
      <div className="grid grid-cols-2 gap-4 items-start">
        {/* User Photo */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-gray-600">Ваше фото</p>
          <div className={`relative aspect-video w-full rounded-lg border-2 ${error ? 'border-red-500' : 'border-amber-300'} border-dashed flex items-center justify-center`}>
            {preview ? (
              <>
                <img src={preview} alt="User upload preview" className="object-cover w-full h-full rounded-md" />
                 <button onClick={() => openModal(preview)} className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white">
                   <ZoomInIcon className="w-5 h-5" />
                 </button>
              </>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleTakePhoto}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Сделать фото
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadFile}
                      className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Загрузить файл
                    </button>
                </div>
            )}
            <input
              ref={fileInputRef}
              id={id}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Reference Photo */}
        <div className="space-y-2">
           <p className="text-sm font-medium text-center text-gray-600">Эталон</p>
            <div className="relative aspect-video w-full rounded-lg border border-amber-200 overflow-hidden">
                 <img src={referencePhotoUrl} alt="Reference" className="object-cover w-full h-full" />
                  <button onClick={() => openModal(referencePhotoUrl)} className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white">
                   <ZoomInIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {isModalOpen && modalImage && (
        <ImagePreviewModal imageUrl={modalImage} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
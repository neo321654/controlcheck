
export interface Product {
  sku: string;
  name: string;
  referenceDimensions: {
    heightMin: number;
    heightMax: number;
    widthMin: number;
    widthMax: number;
    lengthMin: number;
    lengthMax: number;
  };
  referencePhotos: {
    exterior: string; // Can be a URL or a base64 data URI
    crumb: string;    // Can be a URL or a base64 data URI
  };
}

export interface FormData {
  batchNumber: string;
  height: string | number;
  width: string | number;
  length: string | number;
  colorRating: number;
  crumbRating: number;
  tasteRating: number;
  notes: string;
  exteriorPhoto: File | null;
  crumbPhoto: File | null;
}

export type FormErrors = {
  [K in keyof FormData | 'product']?: string;
};

export type Status = 'passed' | 'not passed';
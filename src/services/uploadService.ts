import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PDF_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 10;

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

const PDF_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/x-bzpdf',
  'application/x-gzpdf',
]);

const hasAllowedExtension = (fileName: string, extensions: string[]) => {
  const normalizedName = fileName.toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
};

const getUploadErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseMessage = error.response?.data?.message;

    if (status === 401 || status === 403) {
      return 'Admin session expired or unauthorized. Please log in again.';
    }

    if (status === 413) {
      return 'File too large.';
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage.trim();
    }

    if (error.request) {
      return 'Network error: Unable to reach the server. Please check your connection.';
    }
  }

  return error instanceof Error ? error.message : fallbackMessage;
};

export const validateImageFiles = (files: File[], existingCount = 0): string | null => {
  if (files.length === 0) return 'Please select at least one image.';

  if (existingCount + files.length > MAX_PRODUCT_IMAGES) {
    return 'Maximum 10 images allowed per product.';
  }

  for (const file of files) {
    const normalizedType = file.type.toLowerCase();
    const isAllowedType = IMAGE_MIME_TYPES.has(normalizedType) || hasAllowedExtension(file.name, IMAGE_EXTENSIONS);

    if (!isAllowedType) {
      return `"${file.name}" is not a supported image type. Use JPG, JPEG, PNG, WebP, SVG, or GIF.`;
    }

    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      return `"${file.name}" is too large. Maximum 5MB per file.`;
    }
  }

  return null;
};

export const validatePdfFile = (file: File | null | undefined): string | null => {
  if (!file) return 'Please select a PDF file.';

  const normalizedType = file.type.toLowerCase();
  const isAllowedType = PDF_MIME_TYPES.has(normalizedType) || file.name.toLowerCase().endsWith('.pdf');

  if (!isAllowedType) {
    return 'Only PDF files are allowed.';
  }

  if (file.size > PDF_MAX_SIZE_BYTES) {
    return 'PDF is too large. Maximum 10MB.';
  }

  return null;
};

export const uploadProductImages = async (token: string, files: File[]): Promise<string[]> => {
  if (!token.trim()) {
    throw new Error('Admin session expired or unauthorized. Please log in again.');
  }

  const validationError = validateImageFiles(files);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  try {
    const response = await axios.post(`${API_URL}/upload/images`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const urls = response.data?.urls;
    return Array.isArray(urls) ? urls.map((url) => String(url)) : [];
  } catch (error) {
    throw new Error(getUploadErrorMessage(error, 'Failed to upload images. Please try again.'));
  }
};

export const uploadProductPdf = async (token: string, file: File): Promise<string> => {
  if (!token.trim()) {
    throw new Error('Admin session expired or unauthorized. Please log in again.');
  }

  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await axios.post(`${API_URL}/upload/pdf`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return String(response.data?.url || '');
  } catch (error) {
    throw new Error(getUploadErrorMessage(error, 'Failed to upload PDF. Please try again.'));
  }
};

export const deleteFileFromServer = async (token: string, fileUrl: string): Promise<void> => {
  if (!token?.trim() || !fileUrl) return;

  try {
    await axios.delete(`${API_URL}/upload/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { fileUrl }, // Backend ko batayen ke kaunsi file hatani hai
    });
    console.log(`File deleted successfully: ${fileUrl}`);
  } catch (error) {
    console.error('Failed to delete file from server storage:', error);
  }
};

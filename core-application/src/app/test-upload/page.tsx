'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ImageUpload } from '../../components/ui/image-upload';

export default function TestUploadPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleImageUploaded = (url: string) => {
    setUploadedImageUrl(url);
    console.log('Image uploaded:', url);
  };

  const handleImageRemoved = () => {
    setUploadedImageUrl('');
    console.log('Image removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Image Upload Test
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload an Image
            </label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
              existingImageUrl={uploadedImageUrl}
              bucket="bookmark-images"
              path="test-uploads"
              maxSizeInMB={2}
            />
          </div>

          {uploadedImageUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Uploaded Image URL:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                {uploadedImageUrl}
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
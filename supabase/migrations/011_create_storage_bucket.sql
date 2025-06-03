-- Migration: Create storage bucket for bookmark images
-- Created: 2024-06-04
-- Description: Set up storage bucket and policies for bookmark image uploads

-- Create the bookmark-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bookmark-images', 'bookmark-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Users can upload bookmark images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bookmark-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'uploads'
);

-- Create policy to allow authenticated users to view files
CREATE POLICY "Users can view bookmark images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'bookmark-images'
);

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own bookmark images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bookmark-images' AND
  auth.uid() IS NOT NULL
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own bookmark images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bookmark-images' AND
  auth.uid() IS NOT NULL
); 
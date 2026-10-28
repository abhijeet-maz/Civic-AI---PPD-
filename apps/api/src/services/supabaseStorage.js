import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'civicai-media';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Uploads a file buffer or base64 data to Supabase Storage.
 * @param {string|Buffer} fileData - Base64 string or file buffer
 * @param {string} folderType - 'problem' or 'resolution'
 * @param {string} incidentId - Optional incident ID for path scoping
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{ url: string, publicId: string, resourceType: string, format: string, storagePath: string, uploadedAt: Date }>}
 */
export async function uploadMediaToSupabase(fileData, folderType = 'problem', incidentId = 'INC-NEW', mimeType = 'image/jpeg') {
  let format = 'jpeg';
  let resourceType = 'image';
  let buffer = null;

  if (typeof fileData === 'string' && fileData.startsWith('data:')) {
    const match = fileData.match(/^data:(image|video)\/([a-zA-Z0-9]+);base64,/);
    if (match) {
      resourceType = match[1];
      format = match[2];
      mimeType = `${resourceType}/${format}`;
    }
    const base64Data = fileData.replace(/^data:(image|video)\/[a-zA-Z0-9]+;base64,/, '');
    buffer = Buffer.from(base64Data, 'base64');
  } else if (Buffer.isBuffer(fileData)) {
    buffer = fileData;
    if (mimeType.includes('/')) {
      const parts = mimeType.split('/');
      resourceType = parts[0];
      format = parts[1];
    }
  } else if (typeof fileData === 'string') {
    return {
      url: fileData,
      publicId: `ref_${Date.now()}`,
      resourceType,
      format,
      storagePath: fileData,
      uploadedAt: new Date()
    };
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);
  const fileName = `${folderType}_${timestamp}_${randomSuffix}.${format}`;
  const storagePath = `incidents/${folderType}/${incidentId}/${fileName}`;

  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ [Supabase Storage] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env. Falling back to data URL storage.');
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return {
      url: dataUrl,
      publicId: storagePath,
      resourceType,
      format,
      storagePath,
      uploadedAt: new Date()
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('❌ [Supabase Storage Upload Error]:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    return {
      url: publicUrlData.publicUrl,
      publicId: data.path,
      resourceType,
      format,
      storagePath: data.path,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('❌ [Supabase Storage Error]:', error);
    throw error;
  }
}

/**
 * Creates a short-lived signed URL for an object already stored in the configured bucket.
 * Needed because the bucket is private: the public URL returned at upload time
 * (/object/public/...) is rejected by Supabase for private buckets.
 * @param {string} storagePath - object path inside the bucket (e.g. "incidents/problem/INC-1/file.jpeg")
 * @param {number} expiresIn - lifetime in seconds
 * @returns {Promise<string>} signed URL
 */
export async function getSignedMediaUrl(storagePath, expiresIn = 3600) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase Storage is not configured.');
  }
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    const err = new Error(error?.message || 'Could not create signed URL.');
    // keep the low-level network/TLS cause (ENOTFOUND, ETIMEDOUT, UNABLE_TO_VERIFY_LEAF_SIGNATURE ...)
    err.cause = error?.originalError?.cause || error?.originalError || undefined;
    throw err;
  }
  return data.signedUrl;
}

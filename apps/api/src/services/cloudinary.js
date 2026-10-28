import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a buffer or base64 string to Cloudinary.
 * @param {string|Buffer} fileData - Base64 string or file buffer
 * @param {string} folder - Folder name on Cloudinary
 * @returns {Promise<{ url: string, publicId: string, resourceType: string, format: string }>}
 */
export async function uploadMediaToCloudinary(fileData, folder = 'civicai_evidence') {
  if (!isCloudinaryConfigured) {
    console.warn('⚠️ [Cloudinary] Real Cloudinary credentials missing in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Returning formatted data URL reference.');
    
    let format = 'png';
    let resourceType = 'image';
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const match = fileData.match(/^data:(image|video)\/([a-zA-Z0-9]+);base64,/);
      if (match) {
        resourceType = match[1];
        format = match[2];
      }
    }

    return {
      url: typeof fileData === 'string' && fileData.startsWith('data:') ? fileData : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
      publicId: `dev_placeholder_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      resourceType,
      format,
      uploadedAt: new Date()
    };
  }

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto'
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('❌ [Cloudinary Upload Error]:', error);
    throw new Error(`Media upload failed: ${error.message}`);
  }
}

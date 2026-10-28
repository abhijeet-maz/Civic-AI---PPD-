import express from 'express';
import multer from 'multer';
import { uploadMediaToSupabase, getSignedMediaUrl } from '../services/supabaseStorage.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload - Handle file or base64 uploads to Supabase Storage
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let fileData = null;
    let mimeType = 'image/jpeg';
    const folderType = req.body.type || req.query.type || 'problem';
    const incidentId = req.body.incidentId || req.query.incidentId || 'INC-NEW';

    if (req.file) {
      mimeType = req.file.mimetype;
      fileData = req.file.buffer;
    } else if (req.body.image || req.body.fileData) {
      fileData = req.body.image || req.body.fileData;
    }

    if (!fileData) {
      return res.status(400).json({ success: false, error: 'No media file or base64 data provided.' });
    }

    const uploadResult = await uploadMediaToSupabase(fileData, folderType, incidentId, mimeType);
    return res.json({
      success: true,
      media: uploadResult
    });
  } catch (err) {
    console.error('Upload route error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Media upload failed.' });
  }
});

// GET /api/upload/view?path=incidents/... - redirects to a fresh short-lived signed URL.
// Used by <img src> in both portals so images load from the private bucket.
const SAFE_MEDIA_PATH = /^incidents\/[A-Za-z0-9_\-./]+$/;
router.get('/view', async (req, res) => {
  const mediaPath = String(req.query.path || '');
  if (!SAFE_MEDIA_PATH.test(mediaPath) || mediaPath.includes('..')) {
    return res.status(400).json({ success: false, error: 'Invalid media path.' });
  }
  try {
    const signedUrl = await getSignedMediaUrl(mediaPath, 3600);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // helmet default would block cross-origin <img>
    res.set('Cache-Control', 'private, max-age=1800');       // shorter than the 1h signature
    return res.redirect(302, signedUrl);
  } catch (err) {
    const netCode = err.cause && (err.cause.code || err.cause.cause?.code || err.cause.message); // set when Node could not reach Supabase at all
    console.error('Media signing error:', err.message, netCode ? `(${netCode})` : '');
    return res.status(netCode ? 502 : 404).json({
      success: false,
      error: 'Media not found or unavailable.',
      ...(process.env.NODE_ENV !== 'production' && { reason: err.message, code: netCode }),
    });
  }
});

export default router;


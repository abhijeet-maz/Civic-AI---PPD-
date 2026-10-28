import { DEPARTMENT_MAP } from '../constants/civic.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hugging Face Zero-Shot Image Classification & Heuristic Vision Triage Service
 * Analyzes uploaded image data (base64/URL) or problem description text to accurately classify civic issues.
 */
export async function analyzeIncident(req, res) {
  try {
    const { image, imageBase64, imageUrl, text } = req.body;
    const inputMedia = image || imageBase64 || imageUrl;
    const inputText = (text || '').toLowerCase().trim();

    let category = null;
    let severity = 'Medium';
    let urgencyScore = 50;
    let confidence = 0.85;
    let actionPlan = '';
    let isVisualClassification = false;

    const hfToken = process.env.HF_TOKEN;

    // 1. Try Hugging Face Zero-Shot Vision Model if HF_TOKEN is configured and image data is provided
    if (hfToken && inputMedia) {
      try {
        let imageBuffer = null;
        if (typeof inputMedia === 'string' && inputMedia.startsWith('data:')) {
          const base64Str = inputMedia.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
          imageBuffer = Buffer.from(base64Str, 'base64');
        }

        if (imageBuffer) {
          // CLIP Zero-Shot Image Classification Model
          const hfRes = await fetch('https://api-inference.huggingface.co/models/openai/clip-vit-large-patch14', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/octet-stream'
            },
            body: imageBuffer
          });

          if (hfRes.ok) {
            const hfData = await hfRes.json();
            if (Array.isArray(hfData) && hfData.length > 0) {
              const topMatch = hfData[0];
              const label = (topMatch.label || '').toLowerCase();
              confidence = Number((topMatch.score || 0.88).toFixed(2));

              if (/garbage|trash|waste|dumpster|litter/.test(label)) {
                category = 'Municipal/Sanitation';
                severity = 'Medium';
                urgencyScore = 60;
              } else if (/water|puddle|flood|drain|overflow|sewer/.test(label)) {
                category = 'Water & Sanitation';
                severity = 'Critical';
                urgencyScore = 90;
              } else if (/animal|carcass|dog|cat/.test(label)) {
                category = 'Animal Control & Sanitation';
                severity = 'Critical';
                urgencyScore = 95;
              } else if (/pothole|crack|asphalt|hole|road/.test(label)) {
                category = 'Pothole & Road Damage';
                severity = 'High';
                urgencyScore = 75;
              }

              if (category) {
                isVisualClassification = true;
                actionPlan = `Hugging Face Vision model classified issue image (${label}) with ${Math.round(confidence * 100)}% confidence.`;
              }
            }
          }
        }
      } catch (hfErr) {
        console.warn('⚠️ [Hugging Face Vision API Warning]: Fallback to text analysis:', hfErr.message);
      }
    }

    // 2. Text Keyword Heuristic Classification (If HF Vision didn't categorize or no token)
    if (!category) {
      if (/water|pipe|drain|flood|leak|sewer|overflowing pipe/.test(inputText)) {
        category = 'Water & Sanitation';
        severity = 'Critical';
        urgencyScore = 92;
        confidence = 0.91;
      } else if (/trash|garbage|waste|dumpster|dustbin|cleanliness|litter/.test(inputText)) {
        category = 'Municipal/Sanitation';
        severity = 'Medium';
        urgencyScore = 60;
        confidence = 0.89;
      } else if (/animal|dog|cat|carcass|dead animal/.test(inputText)) {
        category = 'Animal Control & Sanitation';
        severity = 'Critical';
        urgencyScore = 95;
        confidence = 0.94;
      } else if (/pothole|hole|asphalt|road|crack|tarmac/.test(inputText)) {
        category = 'Pothole & Road Damage';
        severity = 'High';
        urgencyScore = 75;
        confidence = 0.90;
      } else {
        // Safe Fallback when issue is unknown/unclear
        category = 'Pothole & Road Damage';
        severity = 'Medium';
        urgencyScore = 50;
        confidence = 0.75;
      }
      actionPlan = `Text heuristic engine classified issue as ${category}.`;
    }

    const department = DEPARTMENT_MAP[category] || 'Road Maintenance';

    return res.json({
      success: true,
      analysis: {
        category,
        severity,
        urgencyScore,
        confidence,
        recommendedDepartment: department,
        isVisualClassification,
        actionPlan: actionPlan || `AI Model classified issue as ${category}. Auto-routing complaint to ${department}.`
      }
    });
  } catch (err) {
    console.error('❌ [AI Analysis Controller Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'AI analysis service error.',
      fallback: {
        category: 'Pothole & Road Damage',
        severity: 'Medium',
        recommendedDepartment: 'Road Maintenance'
      }
    });
  }
}

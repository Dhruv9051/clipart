import { Request, Response, NextFunction } from 'express';

const VALID_STYLES = ['cartoon', 'anime', 'pixel', 'flat', 'sketch'];

export function validateGenerateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { imageBase64, styleId, prompt } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }
  if (!styleId || !VALID_STYLES.includes(styleId)) {
    return res.status(400).json({ error: `styleId must be one of: ${VALID_STYLES.join(', ')}` });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }
  if (imageBase64.length > 7_000_000) {
    return res.status(413).json({ error: 'Image too large. Max 5MB.' });
  }

  next();
}
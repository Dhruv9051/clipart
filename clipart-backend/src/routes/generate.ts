import { Router, Request, Response } from 'express';
import { validateGenerateRequest } from '../middleware/validation';
import { ReplicateService } from '../services/replicate';

const router = Router();

router.post('/', validateGenerateRequest, async (req: Request, res: Response) => {
  const { imageBase64, styleId, prompt } = req.body;

  try {
    console.log(`[generate] Starting → style: ${styleId}`);
    const imageUrl = await ReplicateService.generateImage({ imageBase64, styleId, prompt });
    console.log(`[generate] Done → style: ${styleId}`);
    res.json({ imageUrl });
  } catch (err: any) {
    console.error(`[generate] Failed → style: ${styleId}:`, err.message);
    res.status(500).json({ error: err.message ?? 'Generation failed' });
  }
});

export default router;
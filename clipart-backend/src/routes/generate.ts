import { Router, Request, Response } from 'express';
import { validateGenerateRequest } from '../middleware/validation';
import { ImageGenerationService } from '../services/imageGeneration';

const router = Router();

router.post('/', validateGenerateRequest, async (req: Request, res: Response) => {
  const { imageBase64, styleId, prompt, negativePrompt } = req.body;

  try {
    console.log(`Starting → style: ${styleId}`);
    const imageUrl = await ImageGenerationService.generateImage({
      imageBase64,
      styleId,
      prompt,
      negativePrompt,
    });
    console.log(`[generate] Done → style: ${styleId}`);
    res.json({ imageUrl });
  } catch (err: any) {
    console.error(`Failed → ${styleId}:`, err.message);
    res.status(500).json({ error: err.message ?? 'Generation failed' });
  }
});

export default router;
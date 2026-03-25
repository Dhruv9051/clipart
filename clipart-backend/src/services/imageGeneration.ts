import { config } from '../config';

type GenerateParams = {
  imageBase64: string;
  prompt: string;
  styleId: string;
};

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN ?? '';

// Correct HF router endpoint for text-to-image
const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

export const ImageGenerationService = {
  async generateImage(params: GenerateParams): Promise<string> {
    console.log(`[hf] Generating → style: ${params.styleId}`);

    const fullPrompt = `${params.prompt}, high quality, detailed, professional illustration`;

    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          negative_prompt: 'ugly, blurry, low quality, distorted, watermark',
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace API error: ${err}`);
    }

    // HF returns raw image bytes
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Upload to imgur for a public accessible URL
    const uploadResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64, type: 'base64' }),
    });

    if (!uploadResponse.ok) {
      console.log('[hf] Imgur upload failed, returning data URL');
      return `data:image/png;base64,${base64}`;
    }

    const uploadData = await uploadResponse.json() as { data: { link: string } };
    console.log(`[hf] Done → ${uploadData.data.link}`);
    return uploadData.data.link;
  },
};
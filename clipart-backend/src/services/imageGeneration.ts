import { config } from '../config';

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN ?? '';

type GenerateParams = {
  imageBase64: string;
  prompt: string;
  styleId: string;
};

// These are truly free models that work without credits
const FREE_MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-2',
  'runwayml/stable-diffusion-v1-5',
];

async function tryGenerate(modelUrl: string, prompt: string): Promise<ArrayBuffer | null> {
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${modelUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
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
    console.log(`[hf] Model ${modelUrl} failed: ${err}`);
    return null;
  }

  return response.arrayBuffer();
}

async function uploadToImgur(base64: string): Promise<string> {
  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': 'Client-ID 546c25a59c58ad7',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64, type: 'base64' }),
  });

  if (!response.ok) throw new Error('Imgur upload failed');

  const data = await response.json() as { data: { link: string } };
  return data.data.link;
}

export const ImageGenerationService = {
  async generateImage(params: GenerateParams): Promise<string> {
    console.log(`[hf] Generating → style: ${params.styleId}`);

    const fullPrompt = `${params.prompt}, high quality, detailed, professional illustration`;

    // Try each free model in order until one works
    for (const model of FREE_MODELS) {
      console.log(`[hf] Trying model: ${model}`);
      const buffer = await tryGenerate(model, fullPrompt);

      if (buffer) {
        const base64 = Buffer.from(buffer).toString('base64');

        try {
          const url = await uploadToImgur(base64);
          console.log(`[hf] Done → ${url}`);
          return url;
        } catch {
          // Imgur failed, return data URL as fallback
          console.log('[hf] Imgur failed, using data URL');
          return `data:image/png;base64,${base64}`;
        }
      }
    }

    throw new Error('All models failed. Please check HuggingFace token and credits.');
  },
};
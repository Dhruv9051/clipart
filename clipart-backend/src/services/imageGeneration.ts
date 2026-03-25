import { config } from '../config';

type GenerateParams = {
  imageBase64: string;
  prompt: string;
  styleId: string;
};

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN ?? '';

// Using hf-inference provider with correct router URL
const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0/v1/images/generations';

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
        prompt: fullPrompt,
        n: 1,
        size: '512x512',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace API error: ${err}`);
    }

    const result = await response.json() as { data: Array<{ b64_json: string }> };
    const base64 = result.data[0]?.b64_json;
    if (!base64) throw new Error('No image data returned');

    // Upload to imgur for a public URL (needed for mobile download)
    const uploadResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64, type: 'base64' }),
    });

    if (!uploadResponse.ok) {
      return `data:image/png;base64,${base64}`;
    }

    const uploadData = await uploadResponse.json() as { data: { link: string } };
    console.log(`[hf] Image uploaded → ${uploadData.data.link}`);
    return uploadData.data.link;
  },
};
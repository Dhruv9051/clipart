const HF_TOKEN = process.env.HUGGINGFACE_TOKEN ?? '';

type GenerateParams = {
  imageBase64: string;
  prompt: string;
  styleId: string;
  negativePrompt?: string;
};

// Pollinations AI — completely free, no API key needed
async function generateWithPollinations(prompt: string, styleId: string, negativePrompt?: string): Promise<string> {
  const fullPrompt = `${prompt}, high quality, detailed, professional illustration`;
  const encoded = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  // This URL directly serves the generated image
  let url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true&enhance=true&model=flux`;
  if (negativePrompt) {
    url += `&neg_prompt=${encodeURIComponent(negativePrompt)}`;
  }
  
  console.log(`[pollinations] Generated URL for ${styleId}: ${url}`);
  return url;
}

async function generateWithHuggingFace(prompt: string, negativePrompt?: string): Promise<string | null> {
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-2',
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: negativePrompt ?? 'ugly, blurry, low quality, distorted, watermark',
              width: 512,
              height: 512,
              num_inference_steps: 20,
              guidance_scale: 7.5,
            },
          }),
        }
      );

      if (!response.ok) {
        console.log(`[hf] ${model} failed: ${response.status}`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // Upload to imgur
      const uploadRes = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64, type: 'base64' }),
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json() as { data: { link: string } };
        return data.data.link;
      }

      return `data:image/png;base64,${base64}`;
    } catch (err) {
      console.log(`[hf] ${model} error:`, err);
      continue;
    }
  }

  return null;
}

export const ImageGenerationService = {
  async generateImage(params: GenerateParams): Promise<string> {
    console.log(`[generate] Starting → style: ${params.styleId}`);

    const fullPrompt = `${params.prompt}, high quality, detailed, professional illustration`;

    // Try HuggingFace first
    if (HF_TOKEN) {
      const hfResult = await generateWithHuggingFace(fullPrompt, params.negativePrompt);
      if (hfResult) {
        console.log(`[generate] HF succeeded → style: ${params.styleId}`);
        return hfResult;
      }
    }

    // Fallback to Pollinations AI (always free, always works)
    console.log(`[generate] Falling back to Pollinations → style: ${params.styleId}`);
    return generateWithPollinations(fullPrompt, params.styleId, params.negativePrompt);
  },
};
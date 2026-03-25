import { config } from '../config';

type GenerateParams = {
  imageBase64: string;
  prompt: string;
  styleId: string;
};

type Prediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
};

const HEADERS: Record<string, string> = {
  'Authorization': `Token ${config.replicateToken}`,
  'Content-Type': 'application/json',
};

async function createPrediction(params: GenerateParams): Promise<Prediction> {
  const body = {
    // stability-ai/stable-diffusion — verified free public model
    version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    input: {
      prompt: `${params.prompt}, high quality, detailed, professional illustration`,
      negative_prompt: 'ugly, blurry, low quality, distorted, watermark, text, nsfw',
      width: 768,
      height: 768,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      scheduler: 'DPMSolverMultistep',
    },
  };

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${err}`);
  }

  const data = await response.json() as Prediction;
  return data;
}

async function pollUntilDone(predictionId: string): Promise<string> {
  const MAX_ATTEMPTS = 60;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise(r => setTimeout(r, 2000));

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: HEADERS }
    );

    if (!response.ok) throw new Error('Failed to poll prediction status');

    const prediction = await response.json() as Prediction;
    console.log(`[replicate] ${predictionId} → ${prediction.status}`);

    if (prediction.status === 'succeeded') {
      const url = prediction.output?.[0];
      if (!url) throw new Error('No output URL in response');
      return url;
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Generation ${prediction.status}: ${prediction.error ?? 'unknown'}`);
    }
  }

  throw new Error('Timed out after 2 minutes');
}

export const ReplicateService = {
  async generateImage(params: GenerateParams): Promise<string> {
    console.log(`[replicate] Creating prediction → style: ${params.styleId}`);
    const prediction = await createPrediction(params);
    console.log(`[replicate] Prediction created: ${prediction.id}`);
    return pollUntilDone(prediction.id);
  },
};
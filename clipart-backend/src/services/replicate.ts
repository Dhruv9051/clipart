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
    version: '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165fffea',
    input: {
      prompt: `${params.prompt}, high quality, detailed`,
      negative_prompt: 'ugly, blurry, low quality, distorted, watermark, text',
      num_inference_steps: 4,
      guidance_scale: 0,
      width: 1024,
      height: 1024,
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

  const data = await response.json() as Prediction;  // ← explicit cast
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
      throw new Error(`Generation ${prediction.status}: ${prediction.error ?? 'unknown error'}`);
    }
  }

  throw new Error('Timed out after 2 minutes');
}

export const ReplicateService = {
  async generateImage(params: GenerateParams): Promise<string> {
    console.log(`[replicate] Creating prediction for style: ${params.styleId}`);
    const prediction = await createPrediction(params);
    console.log(`[replicate] Prediction created: ${prediction.id}`);
    return pollUntilDone(prediction.id);
  },
};
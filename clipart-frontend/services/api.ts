type GenerateRequest = {
  imageBase64: string;
  styleId: string;
  prompt: string;
};

type GenerateResponse = {
  imageUrl: string;
};

const BACKEND_URL = 'https://clipart-backend-n6hb.onrender.com';

export const ApiService = {
  async generateClipart(payload: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Server error ${response.status}: ${error}`);
    }

    return response.json();
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
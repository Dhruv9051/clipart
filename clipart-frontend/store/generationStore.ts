type ResultStatus = 'idle' | 'loading' | 'done' | 'error';

type Result = {
  status: ResultStatus;
  uri?: string;
};

type GenerationState = {
  results: Record<string, Result>;
  imageUri: string | null;
  selectedStyleIds: string[];
  isGenerating: boolean;
};

let state: GenerationState = {
  results: {},
  imageUri: null,
  selectedStyleIds: [],
  isGenerating: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

export const GenerationStore = {
  getState: () => state,

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setGenerating: (imageUri: string, styleIds: string[]) => {
    state = {
      results: {},
      imageUri,
      selectedStyleIds: styleIds,
      isGenerating: true,
    };
    notify();
  },

  updateResult: (styleId: string, update: Partial<Result>) => {
    state = {
      ...state,
      results: {
        ...state.results,
        [styleId]: { ...state.results[styleId], ...update },
      },
    };
    const allDone = state.selectedStyleIds.every(
      id =>
        state.results[id]?.status === 'done' ||
        state.results[id]?.status === 'error'
    );
    if (allDone) {
      state = { ...state, isGenerating: false };
    }
    notify();
  },

  reset: () => {
    state = {
      results: {},
      imageUri: null,
      selectedStyleIds: [],
      isGenerating: false,
    };
    notify();
  },

  hasActiveGeneration: () => {
    return state.imageUri !== null;
  },
};
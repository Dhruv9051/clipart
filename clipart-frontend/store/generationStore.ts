// Simple global store — persists across navigation without Redux/Zustand
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

// Module-level state — persists as long as app is open
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
        state = { ...state, imageUri, selectedStyleIds: styleIds, isGenerating: true };
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
        // Check if all done
        const allDone = state.selectedStyleIds.every(
            id => state.results[id]?.status === 'done' || state.results[id]?.status === 'error'
        );
        if (allDone) state = { ...state, isGenerating: false };
        notify();
    },

    reset: () => {
        state = { results: {}, imageUri: null, selectedStyleIds: [], isGenerating: false };
        notify();
    },

    isSameGeneration: (imageUri: string, styleIds: string[]) => {
        const s = state;
        // Only skip if actively generating OR already have results for same input
        const hasResults = styleIds.every(
            id => s.results[id]?.status === 'done' || s.results[id]?.status === 'error'
        );
        const sameInput =
            s.imageUri === imageUri &&
            JSON.stringify([...s.selectedStyleIds].sort()) ===
            JSON.stringify([...styleIds].sort());

        return sameInput && (s.isGenerating || hasResults);
    },
};

// On web, detect page refresh and reset store
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    GenerationStore.reset();
  });

  // Also reset on initial load (handles refresh case)
  GenerationStore.reset();
}
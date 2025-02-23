import { create } from 'zustand'

interface LLMStore {
    selectedModel: string
    setSelectedModel: (model: string) => void
}

export const useLLMStore = create<LLMStore>((set) => ({
    selectedModel: 'OpenAI',
    setSelectedModel: (model) => set({ selectedModel: model }),
}))
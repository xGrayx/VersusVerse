// src/store/bracketStore.ts
import { create } from 'zustand'
import { type Bracket, type Competitor, type Match } from '../types/bracket'

interface BracketState {
    currentBracket: Bracket | null;
    competitors: Competitor[];
    setCurrentBracket: (bracket: Bracket) => void;
    updateBracket: (bracket: Bracket) => void;
    addCompetitor: (competitor: Competitor) => void;
    removeCompetitor: (id: string) => void;
    updateMatch: (matchId: string, updates: Partial<Match>) => void;
    resetBracket: () => void;
}

export const useBracketStore = create<BracketState>((set) => ({
    currentBracket: null,
    competitors: [],
    setCurrentBracket: (bracket) => set({ currentBracket: bracket }),
    updateBracket: (bracket) => set({ currentBracket: bracket }),
    addCompetitor: (competitor) =>
        set((state) => ({ competitors: [...state.competitors, competitor] })),
    removeCompetitor: (id) =>
        set((state) => ({
            competitors: state.competitors.filter(c => c.id !== id)
        })),
    updateMatch: (matchId, updates) =>
        set((state) => {
            if (!state.currentBracket) return state;

            const newRounds = state.currentBracket.rounds.map(round => ({
                ...round,
                matches: round.matches.map(match =>
                    match.id === matchId ? { ...match, ...updates } : match
                )
            }));

            return {
                ...state,
                currentBracket: {
                    ...state.currentBracket,
                    rounds: newRounds,
                    updatedAt: new Date()
                }
            };
        }),
    resetBracket: () => set({ currentBracket: null, competitors: [] })
}));
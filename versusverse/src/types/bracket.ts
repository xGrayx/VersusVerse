// src/types/bracket.ts
export interface Competitor {
    id: string;
    name: string;
    image?: string;
    description?: string;
    seed?: number;
}

export interface Match {
    id: string;
    roundIndex: number;
    matchIndex: number;
    competitor1?: Competitor;
    competitor2?: Competitor;
    winner?: Competitor;
    explanation?: string;
}

export interface Round {
    matches: Match[];
}

export interface Bracket {
    id: string;
    title: string;
    description?: string;
    rounds: Round[];
    createdAt: Date;
    updatedAt: Date;
    status: 'draft' | 'in_progress' | 'completed';
}